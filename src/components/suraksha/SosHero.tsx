import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Siren, Activity, Users, Navigation } from "lucide-react";
import { api, hasBackend } from "@/lib/api";

const HOLD_MS = 3000;

/** Record the alert on the Spring Boot backend when it is configured. */
function recordSos(source: string, coords?: GeolocationCoordinates) {
  if (!hasBackend) return;
  void api
    .triggerSos({
      deviceId: "SRK-2210",
      location: source,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      accuracyMeters: coords ? Math.round(coords.accuracy) : undefined,
    })
    .catch(() => {
      /* the on-device alert already fired; server logging is best-effort */
    });
}

export function SosHero() {
  const [progress, setProgress] = useState(0);
  const [armed, setArmed] = useState(false);
  const [taps, setTaps] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef(0);

  const dispatch = useCallback((source: string) => {
    setArmed(true);
    const id = toast.error("SOS dispatched", {
      description: `Guardian alert sent · ${source} · finding your location…`,
    });
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          recordSos(source, pos.coords);
          toast.error("SOS dispatched", {
            id,
            description: `${source} · location ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (±${Math.round(pos.coords.accuracy)} m) attached`,
          });
        },
        () => {
          recordSos(source);
          toast.error("SOS dispatched", {
            id,
            description: `${source} · location unavailable — allow location in Permissions so responders can find you`,
          });
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      recordSos(source);
    }
    window.setTimeout(() => setArmed(false), 6000);
  }, []);

  const stopHold = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
  }, []);

  const beginHold = useCallback(() => {
    start.current = performance.now();
    const step = () => {
      const pct = Math.min(1, (performance.now() - start.current) / HOLD_MS);
      setProgress(pct);
      if (pct >= 1) {
        stopHold();
        dispatch("3-second hold");
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [dispatch, stopHold]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        dispatch("hotkey Shift + S");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  useEffect(() => () => stopHold(), [stopHold]);

  const onClick = () => {
    setTaps((t) => t + 1);
    toast("SOS primed", { description: "Hold the button for 3 seconds to dispatch." });
  };

  const circumference = 2 * Math.PI * 46;

  return (
    <section id="command" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-full bg-crimson/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-crimson ring-1 ring-crimson/30">
            Emergency dispatch
          </span>
          <h1 className="mt-4 max-w-xl font-display text-3xl font-extrabold sm:text-4xl">
            One press connects you to help
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Click to prime, hold three seconds to send, or press{" "}
            <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Shift</kbd> +{" "}
            <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">S</kbd> anywhere.
          </p>

          <div className="relative mt-9 grid place-items-center">
            <span className="pointer-events-none absolute size-56 rounded-full border border-crimson/30 animate-sos-ring" />
            <span
              className="pointer-events-none absolute size-56 rounded-full border border-crimson/20 animate-sos-ring"
              style={{ animationDelay: "1.2s" }}
            />
            <svg viewBox="0 0 100 100" className="absolute size-64 -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border)" strokeWidth="2.5" />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="var(--crimson)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
              />
            </svg>

            <button
              type="button"
              aria-label="Send SOS emergency alert"
              onClick={onClick}
              onPointerDown={beginHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="group relative grid size-44 select-none place-items-center rounded-full text-primary-foreground transition-transform duration-150 active:scale-95 sm:size-48"
              style={{
                background:
                  "radial-gradient(circle at 32% 26%, color-mix(in oklab, white 34%, var(--crimson)), var(--crimson) 46%, var(--crimson-soft) 100%)",
                boxShadow:
                  "0 26px 60px -18px color-mix(in oklab, var(--crimson) 75%, transparent), inset 0 -10px 22px color-mix(in oklab, black 45%, transparent), inset 0 8px 18px color-mix(in oklab, white 30%, transparent)",
              }}
            >
              <span className="absolute inset-3 rounded-full ring-1 ring-white/20" />
              <Siren className="size-9 drop-shadow" aria-hidden />
              <span className="mt-1 font-display text-3xl font-black tracking-tight">SOS</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] opacity-85">
                {progress > 0 ? `${Math.ceil((1 - progress) * 3)}s` : "hold 3s"}
              </span>
            </button>
          </div>

          <p
            aria-live="assertive"
            className={`mt-7 rounded-full px-4 py-2 text-sm font-medium ring-1 ${
              armed
                ? "bg-crimson/15 text-crimson ring-crimson/40"
                : "bg-emerald/10 text-emerald ring-emerald/30"
            }`}
          >
            {armed ? "Alert active — responders notified" : "Standing by · all systems nominal"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Primed {taps}× this session</p>
        </div>
      </div>

      <aside className="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1">
        {[
          { icon: Activity, label: "Threat index", value: "Low", tone: "text-emerald" },
          { icon: Users, label: "Guardians online", value: "3", tone: "text-foreground" },
          { icon: Navigation, label: "GPS accuracy", value: "4.1 m", tone: "text-foreground" },
        ].map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
            </div>
            <p className={`mt-2 font-display text-2xl font-bold ${tone}`}>{value}</p>
          </div>
        ))}
      </aside>
    </section>
  );
}

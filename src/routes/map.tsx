import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Zap,
  ShieldCheck,
  Lightbulb,
  Cctv,
  Users,
  Siren,
  Navigation,
  Radar,
  Phone,
  Link2,
  Copy,
  TriangleAlert,
  ArrowLeft,
  Timer,
} from "lucide-react";
import { SiteHeader } from "@/components/suraksha/SiteHeader";
import { MapCanvas } from "@/components/suraksha/map/MapCanvas";
import {
  ORIGIN,
  ROUTES,
  SERVICES,
  SERVICE_LABEL,
  type Service,
} from "@/components/suraksha/map/mapData";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Safe Navigation Map — SURAKSHA" },
      {
        name: "description",
        content:
          "Plan safest routes with lighting, CCTV and patrol coverage, set geofence alerts, share live tracking and find police, hospitals and women's support centres nearby.",
      },
      { property: "og:title", content: "Safe Navigation Map — SURAKSHA" },
      {
        property: "og:description",
        content:
          "Safest vs fastest routing, risk-zone overlays, geofence alerts and nearby safety services in one dark command map.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

const BADGE_ICON: Record<string, typeof Lightbulb> = {
  "Well-Lit": Lightbulb,
  "CCTV Covered": Cctv,
  "Frequent Patrol Zone": Siren,
  Populated: Users,
};

const TYPES: Service["type"][] = ["police", "hospital", "support", "safe"];

function MapPage() {
  const [activeRoute, setActiveRoute] = useState<"fastest" | "safest">("safest");
  const [destination, setDestination] = useState("Green Park Metro, Sector 9");
  const [types, setTypes] = useState<Service["type"][]>(TYPES);
  const [radius, setRadius] = useState(160);
  const [geofenceOn, setGeofenceOn] = useState(true);
  const [pos, setPos] = useState(ORIGIN);
  const [share, setShare] = useState<{ url: string; left: number } | null>(null);
  const [alerts, setAlerts] = useState<{ id: number; text: string; at: string }[]>([]);
  const step = useRef(0);
  const wasOut = useRef(false);

  const route = ROUTES.find((r) => r.id === activeRoute)!;

  // simulated live movement along the active route
  useEffect(() => {
    step.current = 0;
    const nums = route.path
      .replace(/[A-Za-z]/g, " ")
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    const pts: [number, number][] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i]!, nums[i + 1]!]);
    if (pts.length < 2) return;

    const id = setInterval(() => {
      step.current = (step.current + 1) % 40;
      const t = step.current / 40;
      const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
      const local = t * (pts.length - 1) - seg;
      const a = pts[seg]!;
      const b = pts[seg + 1]!;
      setPos({ x: a[0] + (b[0] - a[0]) * local, y: a[1] + (b[1] - a[1]) * local });
    }, 700);
    return () => clearInterval(id);
  }, [route.path]);

  const outside = useMemo(() => {
    const d = Math.hypot(pos.x - ORIGIN.x, pos.y - ORIGIN.y);
    return geofenceOn && d > radius;
  }, [pos, radius, geofenceOn]);

  useEffect(() => {
    if (outside && !wasOut.current) {
      wasOut.current = true;
      const at = new Date().toLocaleTimeString("en-GB");
      setAlerts((a) => [{ id: Date.now(), text: "Left safe boundary", at }, ...a].slice(0, 5));
      toast.error("Geofence breach", {
        description: "You left the safe boundary — guardians notified with live location.",
      });
    }
    if (!outside && wasOut.current) {
      wasOut.current = false;
      const at = new Date().toLocaleTimeString("en-GB");
      setAlerts((a) => [{ id: Date.now(), text: "Back inside boundary", at }, ...a].slice(0, 5));
    }
  }, [outside]);

  // share link countdown
  useEffect(() => {
    if (!share) return;
    if (share.left <= 0) {
      setShare(null);
      toast("Live tracking link expired");
      return;
    }
    const id = setTimeout(() => setShare((s) => (s ? { ...s, left: s.left - 1 } : s)), 1000);
    return () => clearTimeout(id);
  }, [share]);

  const startShare = () => {
    const code = Math.random().toString(36).slice(2, 8);
    setShare({ url: `https://suraksha.live/t/${code}`, left: 900 });
    toast.success("Live tracking link active", { description: "Expires automatically in 15 min." });
  };

  const toggleType = (t: Service["type"]) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const visibleServices = SERVICES.filter((s) => types.includes(s.type));
  const mm = share ? String(Math.floor(share.left / 60)).padStart(2, "0") : "00";
  const ss = share ? String(share.left % 60).padStart(2, "0") : "00";

  return (
    <div className="grid-bg min-h-screen pb-16">
      <SiteHeader />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-extrabold sm:text-3xl">
              Map &amp; navigation
            </h1>
            <p className="text-sm text-muted-foreground">
              Risk overlays, safest routing and live guardian tracking.
            </p>
          </div>
          <Link
            to="/"
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-4" aria-hidden /> Command
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="space-y-6">
            <MapCanvas
              activeRoute={activeRoute}
              visibleTypes={types}
              geofenceRadius={radius}
              userPos={pos}
              breached={outside}
              onSelectService={(s) =>
                toast(s.name, { description: `${s.dist} away · ${s.open} · dial ${s.phone}` })
              }
            />

            {/* planner */}
            <section className="glass rounded-3xl p-5 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="dest">Where are you heading?</Label>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <div className="relative min-w-0">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="dest"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="min-h-11 pl-9"
                      placeholder="Search a destination"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toast.success("Routes recalculated", {
                        description: `Destination: ${destination}`,
                      })
                    }
                    className="min-h-11 shrink-0 rounded-xl bg-crimson px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-crimson/90"
                  >
                    Plan
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {ROUTES.map((r) => {
                  const active = r.id === activeRoute;
                  const safest = r.id === "safest";
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setActiveRoute(r.id)}
                      aria-pressed={active}
                      className={`rounded-2xl p-4 text-left ring-1 transition-all hover:-translate-y-0.5 ${
                        active
                          ? safest
                            ? "bg-emerald/10 ring-emerald/50"
                            : "bg-amber/10 ring-amber/50"
                          : "bg-surface-2/60 ring-border"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2 font-display font-semibold">
                          {safest ? (
                            <ShieldCheck className="size-4 shrink-0 text-emerald" aria-hidden />
                          ) : (
                            <Zap className="size-4 shrink-0 text-amber" aria-hidden />
                          )}
                          <span className="truncate">{r.name}</span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                            r.score > 75 ? "bg-emerald/15 text-emerald" : "bg-amber/15 text-amber"
                          }`}
                        >
                          {r.score}/100
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-sm text-muted-foreground">
                        {r.eta} · {r.distance}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.badges.map((b) => {
                          const Icon = BADGE_ICON[b];
                          return (
                            <span
                              key={b}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                safest
                                  ? "bg-emerald/12 text-emerald"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {Icon ? <Icon className="size-3" aria-hidden /> : null}
                              {b}
                            </span>
                          );
                        })}
                      </div>
                      {r.warning && (
                        <p className="mt-3 flex items-start gap-1.5 text-xs text-crimson">
                          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                          {r.warning}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
                  <h2 className="truncate font-display text-base font-bold">
                    Turn-by-turn safe navigation
                  </h2>
                  <span className="shrink-0 font-mono text-sm text-muted-foreground">
                    ETA {route.eta} · {route.distance}
                  </span>
                </div>
                <ol className="mt-4 space-y-2">
                  {route.steps.map((s, i) => (
                    <li
                      key={s.text}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface-2/60 px-3 py-3 ring-1 ring-border"
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                          s.risk === "high"
                            ? "bg-crimson/15 text-crimson"
                            : s.risk === "moderate"
                              ? "bg-amber/15 text-amber"
                              : "bg-emerald/15 text-emerald"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{s.text}</span>
                        <span className="block font-mono text-xs text-muted-foreground">
                          {s.meta}
                        </span>
                      </span>
                      <Navigation className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>

          {/* right rail */}
          <div className="space-y-6">
            <section className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-bold">Geofence</h2>
                <Switch
                  checked={geofenceOn}
                  onCheckedChange={setGeofenceOn}
                  aria-label="Enable geofence alerts"
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Alert guardians the moment you leave the safe boundary.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="radius">Radius</Label>
                  <span className="font-mono text-muted-foreground">
                    {(radius * 2.5).toFixed(0)} m
                  </span>
                </div>
                <Slider
                  id="radius"
                  value={[radius]}
                  min={60}
                  max={320}
                  step={10}
                  onValueChange={(v) => setRadius(v[0] ?? radius)}
                />
              </div>

              <p
                aria-live="polite"
                className={`mt-4 rounded-xl px-3 py-2 text-sm ring-1 ${
                  outside
                    ? "bg-crimson/12 text-crimson ring-crimson/40"
                    : "bg-emerald/10 text-emerald ring-emerald/30"
                }`}
              >
                {geofenceOn
                  ? outside
                    ? "Outside boundary — alert dispatched"
                    : "Inside safe boundary"
                  : "Geofence off"}
              </p>

              {alerts.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {alerts.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground"
                    >
                      <span className="truncate">{a.text}</span>
                      <span className="shrink-0">{a.at}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass rounded-3xl p-5">
              <h2 className="font-display text-base font-bold">Live tracking link</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A temporary link lets guardians watch your route in real time.
              </p>
              {share ? (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-surface-2/70 px-3 py-2 ring-1 ring-emerald/40">
                    <span className="truncate font-mono text-xs text-emerald">{share.url}</span>
                    <button
                      type="button"
                      aria-label="Copy tracking link"
                      onClick={() => {
                        navigator.clipboard?.writeText(share.url);
                        toast.success("Link copied");
                      }}
                      className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-secondary"
                    >
                      <Copy className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Timer className="size-4" aria-hidden /> Expires in{" "}
                    <span className="font-mono text-foreground">
                      {mm}:{ss}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShare(null);
                      toast("Live tracking stopped");
                    }}
                    className="min-h-11 w-full rounded-xl bg-secondary text-sm font-semibold hover:bg-accent"
                  >
                    Stop sharing
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startShare}
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-crimson text-sm font-bold text-primary-foreground transition-colors hover:bg-crimson/90"
                >
                  <Link2 className="size-4" aria-hidden /> Share live tracking link
                </button>
              )}
            </section>

            <section className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2">
                <Radar className="size-4 text-emerald animate-pulse-dot" aria-hidden />
                <h2 className="font-display text-base font-bold">Nearby services</h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={types.includes(t)}
                    onClick={() => toggleType(t)}
                    className={`min-h-11 rounded-full px-3 text-xs font-medium ring-1 transition-colors ${
                      types.includes(t)
                        ? "bg-emerald/12 text-emerald ring-emerald/40"
                        : "bg-secondary text-muted-foreground ring-border"
                    }`}
                  >
                    {SERVICE_LABEL[t]}
                  </button>
                ))}
              </div>

              <ul className="mt-4 space-y-2">
                {visibleServices.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl bg-surface-2/60 p-3 ring-1 ring-border transition-colors hover:ring-crimson/40"
                  >
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {s.dist} · {s.open}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={`tel:${s.phone}`}
                        className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-crimson/15 text-xs font-semibold text-crimson hover:bg-crimson/25"
                      >
                        <Phone className="size-3.5" aria-hidden /> Call {s.phone}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(`Route set to ${s.name}`, {
                            description: `Safest path · ${s.dist}`,
                          })
                        }
                        className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary text-xs font-semibold hover:bg-accent"
                      >
                        <Navigation className="size-3.5" aria-hidden /> Directions
                      </button>
                    </div>
                  </li>
                ))}
                {visibleServices.length === 0 && (
                  <li className="rounded-xl bg-surface-2/60 p-4 text-center text-xs text-muted-foreground">
                    Pick a filter to see services.
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

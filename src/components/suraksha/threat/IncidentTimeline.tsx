import { useEffect, useState } from "react";
import { CheckCheck, CloudUpload, FileLock2, MapPin, MessageSquare, Siren } from "lucide-react";
import { api, hasBackend } from "@/lib/api";

const ICONS: Record<string, typeof Siren> = {
  siren: Siren,
  pin: MapPin,
  upload: CloudUpload,
  message: MessageSquare,
  check: CheckCheck,
};

const EVENTS = [
  {
    icon: Siren,
    title: "SOS trigger dispatched",
    at: "21:04:12",
    detail: "Hold-to-send (3 s) · device SRK-2210",
    tone: "crimson",
  },
  {
    icon: MapPin,
    title: "GPS snapshot captured",
    at: "21:04:13",
    detail: "17.4421° N, 78.3915° E · accuracy 4.1 m",
    tone: "emerald",
  },
  {
    icon: CloudUpload,
    title: "Evidence uploaded to vault",
    at: "21:04:31",
    detail: "audio_0412.enc · 2.4 MB · AES-256",
    tone: "emerald",
  },
  {
    icon: MessageSquare,
    title: "Contact SMS delivered",
    at: "21:04:36",
    detail: "Amma ✓ · Priya ✓ · Ravi (guardian) ✓",
    tone: "emerald",
  },
  {
    icon: CheckCheck,
    title: "Patrol acknowledged",
    at: "21:06:02",
    detail: "Sector 22 unit · ETA 4 min",
    tone: "amber",
  },
];

const VAULT = [
  { name: "audio_0412.enc", size: "2.4 MB", hash: "8f3a…c710", tag: "Audio" },
  { name: "video_0413.enc", size: "18.7 MB", hash: "b21d…9e44", tag: "Video" },
  { name: "gps_trace_0412.json.enc", size: "42 KB", hash: "5c90…10ab", tag: "Telemetry" },
];

const TONE: Record<string, string> = {
  crimson: "var(--crimson)",
  emerald: "var(--emerald)",
  amber: "var(--amber)",
};

export function IncidentTimeline() {
  const [events, setEvents] = useState(EVENTS);
  const [reference, setReference] = useState("SRK-2026-0907");

  useEffect(() => {
    if (!hasBackend) return;
    let active = true;
    api
      .latestIncident()
      .then((incident) => {
        if (!active || incident.events.length === 0) return;
        setReference(incident.reference);
        setEvents(
          incident.events.map((e) => ({
            icon: ICONS[e.icon] ?? CheckCheck,
            title: e.title,
            at: new Date(e.occurredAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
            detail: e.detail ?? "",
            tone: e.tone,
          })),
        );
      })
      .catch(() => {
        /* keep the sample timeline when no incident is stored yet */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="timeline" className="grid gap-4 lg:grid-cols-2">
      <div className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">Incident timeline</h2>
        <p className="text-sm text-muted-foreground">
          Chain-of-custody log for incident #{reference}.
        </p>

        <ol className="mt-5 space-y-4">
          {events.map(({ icon: Icon, title, at, detail, tone }, i) => (
            <li key={title} className="relative flex gap-4 pl-1">
              {i !== events.length - 1 && (
                <span className="absolute left-[1.35rem] top-11 h-[calc(100%-1.5rem)] w-px bg-border" />
              )}
              <span
                className="grid size-11 shrink-0 place-items-center rounded-xl ring-1"
                style={{
                  background: `color-mix(in oklab, ${TONE[tone]} 12%, transparent)`,
                  color: TONE[tone],
                  borderColor: "transparent",
                }}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{title}</p>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {at}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">Tamper-proof evidence vault</h2>
            <p className="text-sm text-muted-foreground">
              Hash-sealed files ready for law-enforcement submission.
            </p>
          </div>
          <span className="rounded-full bg-emerald/12 px-3 py-1 text-[11px] font-semibold text-emerald ring-1 ring-emerald/30">
            Integrity verified
          </span>
        </div>

        <ul className="mt-4 space-y-2">
          {VAULT.map((f) => (
            <li
              key={f.name}
              className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3 text-sm"
            >
              <FileLock2 className="size-4 shrink-0 text-crimson" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{f.name}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  sha256 {f.hash} · {f.size}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {f.tag}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 rounded-xl bg-secondary/40 px-4 py-3 text-[11px] text-muted-foreground">
          Every file is encrypted on device, sealed with a SHA-256 digest and write-locked — any
          later edit breaks the chain and is flagged in the audit log.
        </p>
      </div>
    </section>
  );
}

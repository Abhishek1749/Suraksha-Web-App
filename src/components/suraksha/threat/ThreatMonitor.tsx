import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, AudioLines, Gauge, Radar } from "lucide-react";

type Level = "low" | "suspicious" | "critical";

const LEVEL_META: Record<Level, { label: string; color: string; note: string }> = {
  low: { label: "Low", color: "var(--emerald)", note: "Movement patterns nominal" },
  suspicious: { label: "Suspicious", color: "var(--amber)", note: "Anomalies accumulating" },
  critical: { label: "Critical danger", color: "var(--crimson)", note: "Escalation recommended" },
};

const ANOMALIES = [
  "Rapid acceleration detected",
  "Unusual night travel route",
  "Deviated from planned path",
  "Prolonged stationary in low-light sector",
  "Sudden device orientation change",
  "Ambient noise spike (shouting profile)",
  "Route re-entered high-risk hotspot",
  "Heart-rate band spike from wearable",
];

const severityOf = (t: string) =>
  t.includes("Deviated") || t.includes("shouting") || t.includes("hotspot")
    ? "high"
    : t.includes("Rapid") || t.includes("Heart")
      ? "medium"
      : "low";

export function ThreatMonitor() {
  const [score, setScore] = useState(24);
  const [emotion, setEmotion] = useState(18);
  const [logs, setLogs] = useState<{ id: number; text: string; at: string }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setScore((s) => Math.min(98, Math.max(6, Math.round(s + (Math.random() * 26 - 12)))));
      setEmotion((e) => Math.min(96, Math.max(4, Math.round(e + (Math.random() * 22 - 10)))));
      if (Math.random() > 0.35) {
        const text = ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)]!;
        idRef.current += 1;
        setLogs((l) =>
          [{ id: idRef.current, text, at: new Date().toLocaleTimeString("en-GB") }, ...l].slice(
            0,
            8,
          ),
        );
      }
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const level: Level = score >= 70 ? "critical" : score >= 40 ? "suspicious" : "low";
  const meta = LEVEL_META[level];
  const dash = useMemo(() => `${(score / 100) * 264} 264`, [score]);

  return (
    <section id="monitor" className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="glass rounded-3xl p-5 sm:p-6">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Gauge className="size-3.5" aria-hidden /> Threat level gauge
        </p>

        <div className="mt-4 grid place-items-center">
          <div className="relative size-44">
            <svg viewBox="0 0 100 100" className="size-full -rotate-[100deg]" aria-hidden>
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="oklch(1 0 0 / 10%)"
                strokeWidth="9"
                strokeDasharray="264 400"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={meta.color}
                strokeWidth="9"
                strokeDasharray={dash}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <p
                className="font-mono text-4xl font-bold tabular-nums"
                style={{ color: meta.color }}
              >
                {score}
              </p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                danger score
              </p>
            </div>
          </div>
        </div>

        <div
          className="mt-4 rounded-2xl px-4 py-3 text-center ring-1"
          style={{
            background: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
            color: meta.color,
            borderColor: "transparent",
          }}
          role="status"
          aria-live="polite"
        >
          <p className="font-display text-lg font-bold">{meta.label}</p>
          <p className="text-xs opacity-80">{meta.note}</p>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <AudioLines className="size-3.5" aria-hidden /> Voice emotion stress
            </span>
            <span className="font-mono tabular-nums">{emotion}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${emotion}%`,
                background:
                  emotion > 65
                    ? "var(--crimson)"
                    : emotion > 35
                      ? "var(--amber)"
                      : "var(--emerald)",
              }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            On-device model · fear / distress markers in ambient speech
          </p>
        </div>
      </div>

      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Radar className="size-3.5" aria-hidden /> AI anomaly detector stream
          </p>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald/12 px-3 py-1 text-[11px] font-medium text-emerald ring-1 ring-emerald/30">
            <span className="size-1.5 rounded-full bg-emerald animate-pulse-dot" /> Telemetry live
          </span>
        </div>

        <ul className="mt-4 space-y-2" aria-live="polite">
          {logs.length === 0 && (
            <li className="rounded-xl bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
              Listening to sensor fusion stream…
            </li>
          )}
          {logs.map((l) => {
            const sev = severityOf(l.text);
            const c =
              sev === "high"
                ? "var(--crimson)"
                : sev === "medium"
                  ? "var(--amber)"
                  : "var(--emerald)";
            return (
              <li
                key={l.id}
                className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3 text-sm"
              >
                <Activity className="size-4 shrink-0" style={{ color: c }} aria-hidden />
                <span className="min-w-0 flex-1 truncate">{l.text}</span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ background: `color-mix(in oklab, ${c} 15%, transparent)`, color: c }}
                >
                  {sev}
                </span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {l.at}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

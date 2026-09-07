import { Activity, Clock, ServerCog, Siren } from "lucide-react";

const METRICS = [
  {
    icon: Siren,
    label: "Active incidents",
    value: "7",
    sub: "2 critical · 5 monitored",
    tone: "crimson",
  },
  {
    icon: Clock,
    label: "Avg response time",
    value: "4m 12s",
    sub: "-38 s vs last week",
    tone: "emerald",
  },
  { icon: Activity, label: "Reports today", value: "63", sub: "peak 21:00–23:00", tone: "amber" },
  {
    icon: ServerCog,
    label: "App health",
    value: "99.94%",
    sub: "all services nominal",
    tone: "emerald",
  },
];

const REGIONS = [
  { name: "Sector 22 · Madhapur", risk: 78, units: 3 },
  { name: "Old City · Charminar", risk: 61, units: 4 },
  { name: "Gachibowli IT belt", risk: 34, units: 2 },
  { name: "Secunderabad North", risk: 22, units: 2 },
];

const QUEUE = [
  { id: "SRK-0907-14", type: "SOS hold", sector: "Sector 22", age: "1m", state: "Dispatching" },
  {
    id: "SRK-0907-13",
    type: "Geofence breach",
    sector: "Old City",
    age: "6m",
    state: "Patrol en route",
  },
  { id: "SRK-0907-11", type: "Voice distress", sector: "Ameerpet", age: "18m", state: "Resolved" },
];

const TONE: Record<string, string> = {
  crimson: "var(--crimson)",
  emerald: "var(--emerald)",
  amber: "var(--amber)",
};

export function DispatchPanel() {
  return (
    <section id="dispatch" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Admin &amp; police dispatch</h2>
          <p className="text-sm text-muted-foreground">
            Regional command overview — simulated operations data.
          </p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[11px] text-muted-foreground">
          Hyderabad control room
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map(({ icon: Icon, label, value, sub, tone }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <span
              className="grid size-10 place-items-center rounded-xl"
              style={{
                background: `color-mix(in oklab, ${TONE[tone]} 12%, transparent)`,
                color: TONE[tone],
              }}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <p className="mt-4 font-display text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-3xl p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Regional crime analytics
          </p>
          <ul className="mt-4 space-y-4">
            {REGIONS.map((r) => (
              <li key={r.name}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium">{r.name}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {r.units} units · risk {r.risk}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.risk}%`,
                      background:
                        r.risk > 65
                          ? "var(--crimson)"
                          : r.risk > 35
                            ? "var(--amber)"
                            : "var(--emerald)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-3xl p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Live dispatch queue
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Case</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Sector</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {QUEUE.map((q) => (
                  <tr key={q.id} className="border-t border-border/70">
                    <td className="py-3 pr-3 font-mono text-xs">{q.id}</td>
                    <td className="py-3 pr-3">{q.type}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{q.sector}</td>
                    <td className="py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
                        style={{
                          background:
                            q.state === "Resolved"
                              ? "color-mix(in oklab, var(--emerald) 14%, transparent)"
                              : "color-mix(in oklab, var(--crimson) 14%, transparent)",
                          color: q.state === "Resolved" ? "var(--emerald)" : "var(--crimson)",
                        }}
                      >
                        {q.state}
                      </span>
                      <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                        {q.age}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

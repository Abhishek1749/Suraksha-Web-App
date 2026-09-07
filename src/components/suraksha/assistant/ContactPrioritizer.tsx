import { useMemo, useState } from "react";
import { ArrowDownUp, MessageSquare, Phone, Signal } from "lucide-react";
import { toast } from "sonner";

type Contact = {
  id: string;
  name: string;
  relation: string;
  tier: 1 | 2 | 3;
  km: number;
  status: "available" | "idle" | "offline";
  phone: string;
};

const CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Priya Nair",
    relation: "Sister",
    tier: 1,
    km: 0.8,
    status: "available",
    phone: "+919866011111",
  },
  {
    id: "c2",
    name: "Amma",
    relation: "Mother",
    tier: 1,
    km: 6.4,
    status: "available",
    phone: "+919849000000",
  },
  {
    id: "c3",
    name: "Rahul Verma",
    relation: "Colleague",
    tier: 3,
    km: 1.1,
    status: "available",
    phone: "+919000022222",
  },
  {
    id: "c4",
    name: "Sneha Rao",
    relation: "Best friend",
    tier: 2,
    km: 2.3,
    status: "idle",
    phone: "+919000033333",
  },
  {
    id: "c5",
    name: "Papa",
    relation: "Father",
    tier: 1,
    km: 6.4,
    status: "idle",
    phone: "+919849099999",
  },
  {
    id: "c6",
    name: "Neighbour — Latha",
    relation: "Neighbour",
    tier: 2,
    km: 0.3,
    status: "offline",
    phone: "+919000044444",
  },
];

const STATUS_WEIGHT = { available: 0, idle: 18, offline: 55 } as const;

function score(c: Contact, mode: "smart" | "distance" | "tier") {
  if (mode === "distance") return c.km;
  if (mode === "tier") return c.tier;
  return c.km * 6 + (c.tier - 1) * 14 + STATUS_WEIGHT[c.status];
}

const MODES = [
  { id: "smart", label: "Smart priority" },
  { id: "distance", label: "Closest first" },
  { id: "tier", label: "Relationship tier" },
] as const;

export function ContactPrioritizer() {
  const [mode, setMode] = useState<"smart" | "distance" | "tier">("smart");

  const ordered = useMemo(
    () => [...CONTACTS].sort((a, b) => score(a, mode) - score(b, mode)),
    [mode],
  );

  return (
    <section id="prioritizer" className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold">Smart contact prioritizer</h2>
          <p className="text-sm text-muted-foreground">
            Ranked live by proximity, availability and relationship tier.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-surface-2/70 p-1 ring-1 ring-border">
          <ArrowDownUp className="ml-2 size-3.5 text-muted-foreground" aria-hidden />
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors ${
                mode === m.id
                  ? "bg-emerald text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {ordered.map((c, i) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-2/60 px-4 py-3 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-emerald/40"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary font-mono text-sm font-bold">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{c.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {c.relation} · Tier {c.tier} · {c.km.toFixed(1)} km away
              </span>
            </span>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ring-1 ${
                c.status === "available"
                  ? "bg-emerald/12 text-emerald ring-emerald/30"
                  : c.status === "idle"
                    ? "bg-amber/12 text-amber ring-amber/30"
                    : "bg-secondary text-muted-foreground ring-border"
              }`}
            >
              <Signal className="size-3" aria-hidden />
              {c.status}
            </span>
            <span className="flex shrink-0 gap-2">
              <a
                href={`tel:${c.phone}`}
                aria-label={`Call ${c.name}`}
                className="grid size-11 place-items-center rounded-xl bg-crimson text-primary-foreground transition-colors hover:bg-crimson/90"
              >
                <Phone className="size-4" aria-hidden />
              </a>
              <button
                type="button"
                aria-label={`Send alert SMS to ${c.name}`}
                onClick={() =>
                  toast.success(`Alert queued to ${c.name}`, {
                    description: "Live location link attached, delivery receipt pending.",
                  })
                }
                className="grid size-11 place-items-center rounded-xl bg-secondary transition-colors hover:bg-accent"
              >
                <MessageSquare className="size-4" aria-hidden />
              </button>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

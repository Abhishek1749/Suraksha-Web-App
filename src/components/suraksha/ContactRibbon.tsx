import { Phone } from "lucide-react";

const CONTACTS = [
  { name: "Police", number: "100", tone: "crimson" },
  { name: "Emergency", number: "112", tone: "crimson" },
  { name: "Women helpline", number: "1091", tone: "emerald" },
  { name: "Ambulance", number: "108", tone: "emerald" },
  { name: "Trusted: Amma", number: "+91 98490 00000", tone: "muted" },
  { name: "Trusted: Priya", number: "+91 98660 11111", tone: "muted" },
];

export function ContactRibbon() {
  return (
    <section id="contacts" className="glass rounded-3xl p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-bold">Emergency contact ribbon</h2>
          <p className="text-sm text-muted-foreground">One tap dials, alert SMS goes out too.</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald/12 px-3 py-1 text-xs text-emerald ring-1 ring-emerald/30">
          Auto-SMS on
        </span>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONTACTS.map((c) => (
          <li key={c.number}>
            <a
              href={`tel:${c.number.replace(/\s/g, "")}`}
              className="flex min-h-14 items-center gap-3 rounded-2xl bg-surface-2/70 px-4 py-3 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-crimson/50"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  c.tone === "crimson"
                    ? "bg-crimson/15 text-crimson"
                    : c.tone === "emerald"
                      ? "bg-emerald/15 text-emerald"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                <Phone className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{c.name}</span>
                <span className="block truncate font-mono text-xs text-muted-foreground">
                  {c.number}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

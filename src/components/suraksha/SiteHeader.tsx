import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PermissionsButton } from "@/components/suraksha/PermissionCenter";
import { ShieldCheck, Satellite, BatteryFull, Wifi, MapPin } from "lucide-react";

const NAV = ["Command", "Tools", "Recordings", "Contacts"];

export function SiteHeader() {
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass border-x-0 border-t-0">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-crimson/15 ring-1 ring-crimson/40">
            <ShieldCheck className="size-5 text-crimson" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
              SURAKSHA
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              AI &amp; IoT Women Safety
            </p>
          </div>
        </div>

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Command
          </Link>
          {NAV.slice(1).map((item) => (
            <a
              key={item}
              href={`/#${item.toLowerCase()}`}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item}
            </a>
          ))}
          <Link
            to="/map"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            Map
          </Link>
          <Link
            to="/threat"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            Threat AI
          </Link>
          <Link
            to="/assistant"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            Assistant
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-emerald/12 px-3 py-1.5 text-xs font-medium text-emerald ring-1 ring-emerald/35 md:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald animate-pulse-dot" />
            Guardian link live
          </span>
          <span className="hidden items-center gap-3 font-mono text-xs text-muted-foreground sm:flex">
            <Satellite className="size-4" aria-hidden />
            <Wifi className="size-4" aria-hidden />
            <BatteryFull className="size-4" aria-hidden />
          </span>
          <PermissionsButton />
          <span className="rounded-lg bg-secondary px-2.5 py-1.5 font-mono text-xs tabular-nums">
            {clock}
          </span>
        </div>
      </div>

      <div className="border-t border-border/70 bg-crimson/10">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-1.5 sm:px-6">
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-crimson">
            <MapPin className="size-3.5" aria-hidden /> SOS ready
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="whitespace-nowrap text-[11px] text-muted-foreground animate-ticker">
              GPS lock 4.1 m · Sector 22, Hyderabad — 3 guardians on standby — nearest patrol 1.2 km
              — hold SOS 3 s or press Shift + S to dispatch — GPS lock 4.1 m · Sector 22, Hyderabad
              — 3 guardians on standby — nearest patrol 1.2 km — hold SOS 3 s or press Shift + S to
              dispatch —
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

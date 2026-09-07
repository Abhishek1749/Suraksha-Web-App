import { toast } from "sonner";
import { PhoneCall, Mic, Video, Siren, Share2, ShieldAlert } from "lucide-react";

type Props = {
  onFakeCall: () => void;
  onRecord: (mode: "audio" | "video") => void;
};

export function QuickTools({ onFakeCall, onRecord }: Props) {
  const tools = [
    {
      icon: PhoneCall,
      title: "Fake call",
      desc: "Stage an incoming call to exit safely",
      badge: "Instant",
      accent: "emerald",
      action: onFakeCall,
    },
    {
      icon: Mic,
      title: "Audio recorder",
      desc: "Discreet on-screen recorder — you always see it running",
      badge: "You control it",
      accent: "crimson",
      action: () => onRecord("audio"),
    },
    {
      icon: Video,
      title: "Video recorder",
      desc: "Camera capture with a live preview while recording",
      badge: "Live preview",
      accent: "crimson",
      action: () => onRecord("video"),
    },
    {
      icon: Siren,
      title: "Police ping",
      desc: "Push live coordinates to nearest patrol",
      badge: "112 linked",
      accent: "crimson",
      action: () =>
        toast.error("Police ping sent", { description: "Patrol 1.2 km away · ETA 4 min" }),
    },
    {
      icon: Share2,
      title: "Share live route",
      desc: "Guardians follow your path in real time",
      badge: "3 guardians",
      accent: "emerald",
      action: () => toast.success("Live route shared with 3 guardians"),
    },
    {
      icon: ShieldAlert,
      title: "Safe-word listen",
      desc: "Arm a spoken trigger word (asks for the mic first)",
      badge: "Opt-in",
      accent: "emerald",
      action: () => toast("Safe-word listening armed", { description: 'Trigger word: "mango"' }),
    },
  ];

  return (
    <section id="tools" className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-bold">Quick tools</h2>
          <p className="text-sm text-muted-foreground">Discreet actions, one tap each.</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">6 armed</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map(({ icon: Icon, title, desc, badge, accent, action }) => (
          <button
            key={title}
            type="button"
            onClick={action}
            className="glass group min-h-24 rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:ring-1 hover:ring-crimson/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ring-1 ${
                  accent === "crimson"
                    ? "bg-crimson/12 text-crimson ring-crimson/30"
                    : "bg-emerald/12 text-emerald ring-emerald/30"
                }`}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                  accent === "crimson" ? "bg-crimson/12 text-crimson" : "bg-emerald/12 text-emerald"
                }`}
              >
                {badge}
              </span>
            </div>
            <p className="mt-4 font-display text-base font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

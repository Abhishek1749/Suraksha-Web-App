import { useEffect, useRef, useState } from "react";
import { Languages, Mic, MicOff, Radio } from "lucide-react";
import { toast } from "sonner";

const LANGS = [
  { id: "en-IN", label: "English" },
  { id: "hi-IN", label: "हिन्दी" },
  { id: "te-IN", label: "తెలుగు" },
  { id: "ta-IN", label: "தமிழ்" },
  { id: "bn-IN", label: "বাংলা" },
];

const PHRASES = [
  { phrase: "Help me", action: "Trigger SOS + live location", tone: "crimson" },
  { phrase: "Save me / Bachao", action: "Silent SOS, no screen change", tone: "crimson" },
  { phrase: "Call police", action: "Dial 112 and start recording", tone: "crimson" },
  { phrase: "I am safe", action: "Cancel alert with safe-word check", tone: "emerald" },
];

const BARS = 40;

export function VoiceCommands() {
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(6));
  const [heard, setHeard] = useState<string[]>([]);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!listening) {
      setLevels(Array(BARS).fill(6));
      return;
    }
    let t = 0;
    const loop = () => {
      t += 0.22;
      setLevels(
        Array.from({ length: BARS }, (_, i) => {
          const wave = Math.sin(t + i * 0.45) * Math.sin(t * 0.6 + i * 0.11);
          return 8 + Math.abs(wave) * 46 + Math.random() * 8;
        }),
      );
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame.current);
  }, [listening]);

  useEffect(() => {
    if (!listening) return;
    const samples = [
      "…ambient noise",
      "…footsteps nearby",
      "…speech detected",
      "…no keyword match",
    ];
    const id = setInterval(() => {
      setHeard((h) =>
        [
          `${new Date().toLocaleTimeString("en-GB")} ${samples[Math.floor(Math.random() * samples.length)]}`,
          ...h,
        ].slice(0, 5),
      );
    }, 2200);
    return () => clearInterval(id);
  }, [listening]);

  const toggle = () => {
    const next = !listening;
    setListening(next);
    toast[next ? "success" : "message"](
      next ? "Background voice listening armed" : "Voice listening stopped",
      {
        description: next
          ? `Keyword engine running in ${LANGS.find((l) => l.id === lang)?.label}.`
          : "No audio is being processed.",
      },
    );
  };

  return (
    <section id="voice" className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold">Multilingual voice commands</h2>
          <p className="text-sm text-muted-foreground">
            Hands-free trigger phrases recognised in the background.
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${
            listening
              ? "bg-crimson/12 text-crimson ring-crimson/35"
              : "bg-secondary text-muted-foreground ring-border"
          }`}
        >
          <Radio className="size-3.5" aria-hidden />
          {listening ? "Listening" : "Standby"}
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-surface-2/60 p-4 ring-1 ring-border">
        <div className="flex h-24 items-center justify-between gap-[2px]" aria-hidden>
          {levels.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={`w-full rounded-full transition-[height] duration-100 ${
                listening ? "bg-crimson/80" : "bg-border"
              }`}
            />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {listening ? "Voice recognition is listening" : "Voice recognition is off"}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className={`flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors ${
              listening
                ? "bg-crimson text-primary-foreground hover:bg-crimson/90"
                : "bg-emerald text-background hover:bg-emerald/90"
            }`}
          >
            {listening ? (
              <MicOff className="size-4" aria-hidden />
            ) : (
              <Mic className="size-4" aria-hidden />
            )}
            {listening ? "Stop listening" : "Arm voice trigger"}
          </button>

          <div className="flex min-h-12 items-center gap-2 rounded-xl bg-surface-2/70 px-3 ring-1 ring-border">
            <Languages className="size-4 text-muted-foreground" aria-hidden />
            <label htmlFor="voice-lang" className="sr-only">
              Recognition language
            </label>
            <select
              id="voice-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id} className="bg-surface-2 text-foreground">
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ul className="space-y-2">
          {PHRASES.map((p) => (
            <li
              key={p.phrase}
              className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2/60 px-4 py-3 ring-1 ring-border"
            >
              <span className="min-w-0">
                <span className="block truncate font-display text-sm font-bold">“{p.phrase}”</span>
                <span className="block truncate text-xs text-muted-foreground">{p.action}</span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ring-1 ${
                  p.tone === "crimson"
                    ? "bg-crimson/12 text-crimson ring-crimson/30"
                    : "bg-emerald/12 text-emerald ring-emerald/30"
                }`}
              >
                {p.tone === "crimson" ? "Emergency" : "Stand-down"}
              </span>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl bg-surface-2/40 p-4 ring-1 ring-border">
          <p className="font-display text-sm font-bold">Recognition log</p>
          <ul className="mt-3 space-y-2 font-mono text-xs text-muted-foreground">
            {heard.length === 0 && <li>Awaiting audio frames…</li>}
            {heard.map((h, i) => (
              <li key={i} className="truncate">
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

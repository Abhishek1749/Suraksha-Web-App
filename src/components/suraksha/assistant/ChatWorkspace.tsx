import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Bot, ShieldQuestion, Sparkle, User } from "lucide-react";
import { askSafetyAssistant } from "@/lib/assistant.functions";
import { api, hasBackend } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

const CHIPS = [
  "Find nearby safe haven",
  "How to file a Zero-FIR",
  "Identify risk level of current area",
  "Someone is following me right now",
  "First aid for a bleeding wound",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "I'm **SURAKSHA Assist**. Ask me about staying safe right now, your legal rights, or first aid. In an emergency, hit the SOS button or call **112**.",
};

export function ChatWorkspace() {
  const ask = useServerFn(askSafetyAssistant);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const { reply } = await ask({
        data: { messages: next.filter((m) => m !== GREETING).slice(-16) },
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant could not answer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="chat" className="glass flex flex-col overflow-hidden rounded-3xl">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald/15 ring-1 ring-emerald/35">
          <ShieldQuestion className="size-5 text-emerald" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-bold">AI safety chatbot</h2>
          <p className="truncate text-xs text-muted-foreground">
            Safety guidance · legal rights · first aid
          </p>
        </div>
        <span className="ml-auto hidden shrink-0 items-center gap-2 rounded-full bg-emerald/12 px-3 py-1 text-[11px] text-emerald ring-1 ring-emerald/30 sm:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald [animation:pulse-dot_1.4s_ease-in-out_infinite]" />
          Online
        </span>
      </header>

      <div
        ref={scrollRef}
        className="max-h-[26rem] min-h-[18rem] space-y-4 overflow-y-auto px-5 py-5"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <span
              className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${
                m.role === "user"
                  ? "bg-crimson/15 text-crimson"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {m.role === "user" ? (
                <User className="size-4" aria-hidden />
              ) : (
                <Bot className="size-4" aria-hidden />
              )}
            </span>
            <div
              className={`max-w-[85%] text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-2xl bg-crimson px-4 py-2.5 font-medium text-primary-foreground"
                  : "text-foreground"
              }`}
            >
              {m.role === "user" ? (
                m.content
              ) : (
                <div className="space-y-2 [&_a]:text-emerald [&_a]:underline [&_code]:font-mono [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:text-foreground">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="grid size-8 place-items-center rounded-lg bg-secondary">
              <Sparkle className="size-4 animate-pulse" aria-hidden />
            </span>
            Thinking…
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-crimson/12 px-4 py-3 text-sm text-crimson ring-1 ring-crimson/30"
          >
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={busy}
              onClick={() => void send(chip)}
              className="min-h-9 shrink-0 rounded-full bg-surface-2/70 px-3.5 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground hover:ring-emerald/50 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor="assistant-input" className="sr-only">
            Ask the safety assistant
          </label>
          <textarea
            id="assistant-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Describe your situation or ask a question…"
            className="min-h-12 flex-1 resize-none rounded-2xl bg-surface-2/70 px-4 py-3.5 text-sm ring-1 ring-border outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald/60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald text-background transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <ArrowUp className="size-5" aria-hidden />
          </button>
        </form>
      </div>
    </section>
  );
}

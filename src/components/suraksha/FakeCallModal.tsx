import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, PhoneOff, Video, Volume2, Timer, User } from "lucide-react";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const VOICES = [
  { id: "papa", label: "Papa (deep)" },
  { id: "friend", label: "Best friend" },
  { id: "boss", label: "Office boss" },
  { id: "police", label: "Police officer" },
];
const DELAYS = [0, 10, 30, 60];

export function FakeCallModal({ open, onOpenChange }: Props) {
  const [caller, setCaller] = useState("Papa");
  const [voice, setVoice] = useState("papa");
  const [delay, setDelay] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [ringing, setRinging] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callSecs, setCallSecs] = useState(0);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setRinging(true);
      return;
    }
    const id = window.setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  useEffect(() => {
    if (!inCall) return;
    tick.current = window.setInterval(() => setCallSecs((s) => s + 1), 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [inCall]);

  const reset = () => {
    setRinging(false);
    setInCall(false);
    setCallSecs(0);
    setCountdown(null);
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const trigger = () => {
    if (delay === 0) setRinging(true);
    else setCountdown(delay);
  };

  const mmss = `${String(Math.floor(callSecs / 60)).padStart(2, "0")}:${String(callSecs % 60).padStart(2, "0")}`;

  if (ringing || inCall) {
    return (
      <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
        <DialogContent className="max-w-sm overflow-hidden border-border bg-background p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Incoming call from {caller}</DialogTitle>
            <DialogDescription>Simulated call screen</DialogDescription>
          </DialogHeader>
          <div className="grid-bg flex min-h-[30rem] flex-col items-center justify-between px-6 py-10 text-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {inCall ? "Ongoing call" : "Incoming call"}
              </p>
              <div className="mx-auto mt-8 grid size-28 place-items-center rounded-full bg-secondary ring-4 ring-white/10">
                <User className="size-12 text-muted-foreground" aria-hidden />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold">{caller}</h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {inCall ? mmss : "mobile · +91 98490 43210"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Voice preset: {VOICES.find((v) => v.id === voice)?.label}
              </p>
            </div>

            <div className="flex w-full items-center justify-center gap-10">
              {!inCall && (
                <button
                  type="button"
                  onClick={() => setInCall(true)}
                  aria-label="Accept call"
                  className="grid size-16 place-items-center rounded-full bg-emerald text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Phone className="size-6" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={close}
                aria-label="End call"
                className="grid size-16 place-items-center rounded-full bg-crimson text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <PhoneOff className="size-6" aria-hidden />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-md border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-display">Fake call</DialogTitle>
          <DialogDescription>
            Stage a believable incoming call so you can walk away from a situation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="caller-name">Caller name</Label>
            <Input
              id="caller-name"
              value={caller}
              onChange={(e) => setCaller(e.target.value)}
              className="min-h-11"
              placeholder="Papa"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">
              <Volume2 className="mr-1 inline size-4" aria-hidden /> Voice preset
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVoice(v.id)}
                  className={`min-h-11 rounded-xl px-3 text-sm ring-1 transition-colors ${
                    voice === v.id
                      ? "bg-crimson/15 text-crimson ring-crimson/50"
                      : "bg-secondary text-muted-foreground ring-border hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">
              <Timer className="mr-1 inline size-4" aria-hidden /> When
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {DELAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDelay(d)}
                  className={`min-h-11 rounded-xl text-sm ring-1 transition-colors ${
                    delay === d
                      ? "bg-emerald/15 text-emerald ring-emerald/50"
                      : "bg-secondary text-muted-foreground ring-border hover:text-foreground"
                  }`}
                >
                  {d === 0 ? "Now" : `${d}s`}
                </button>
              ))}
            </div>
          </fieldset>

          {countdown !== null && (
            <p aria-live="polite" className="text-center font-mono text-sm text-emerald">
              Ringing in {countdown}s…
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={trigger}
              className="min-h-11 flex-1 bg-crimson text-primary-foreground hover:bg-crimson/90"
            >
              <Phone className="size-4" /> {delay === 0 ? "Call now" : "Schedule call"}
            </Button>
            <Button variant="secondary" className="min-h-11" onClick={() => setVoice("friend")}>
              <Video className="size-4" /> Video style
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

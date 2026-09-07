import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Mic, MapPin, Bell, ShieldCheck, RefreshCw, Info } from "lucide-react";
import {
  PERMISSION_COPY,
  STATE_LABEL,
  guidanceFor,
  isSecureContextOk,
  readAllPermissions,
  requestPermission,
  type PermissionKey,
  type PermissionState,
} from "@/lib/permissions";

const ICONS: Record<PermissionKey, typeof Camera> = {
  camera: Camera,
  microphone: Mic,
  geolocation: MapPin,
  notifications: Bell,
};

const ORDER: PermissionKey[] = ["camera", "microphone", "geolocation", "notifications"];

function tone(state: PermissionState) {
  if (state === "granted") return "bg-emerald/12 text-emerald ring-emerald/35";
  if (state === "denied") return "bg-crimson/12 text-crimson ring-crimson/35";
  if (state === "insecure" || state === "unsupported")
    return "bg-amber/12 text-amber ring-amber/35";
  return "bg-secondary text-muted-foreground ring-border";
}

export function PermissionCenter({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [states, setStates] = useState<Record<PermissionKey, PermissionState>>({
    camera: "unknown",
    microphone: "unknown",
    geolocation: "unknown",
    notifications: "unknown",
  });
  const [busy, setBusy] = useState<PermissionKey | null>(null);
  const [secure, setSecure] = useState(true);

  const refresh = useCallback(async () => {
    setStates(await readAllPermissions());
    setSecure(isSecureContextOk());
  }, []);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const ask = async (key: PermissionKey) => {
    setBusy(key);
    const res = await requestPermission(key);
    setStates((s) => ({ ...s, [key]: res.state }));
    setBusy(null);
    if (res.state === "granted") toast.success(res.message);
    else if (res.state === "denied") toast.error(res.message);
    else toast(res.message);
    void refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-border bg-background sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 font-display">
            <ShieldCheck className="size-5 text-emerald" aria-hidden />
            Permissions &amp; privacy
          </DialogTitle>
          <DialogDescription>
            SURAKSHA never turns anything on by itself. Each permission below is requested only when
            you tap Allow, and nothing is captured until you start a recording yourself.
          </DialogDescription>
        </DialogHeader>

        {!secure && (
          <p className="flex items-start gap-2 rounded-xl bg-amber/12 px-3 py-2.5 text-xs text-amber ring-1 ring-amber/30">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Camera, microphone and location need a secure HTTPS address. They will work on the
            published site.
          </p>
        )}

        <ul className="space-y-3">
          {ORDER.map((key) => {
            const Icon = ICONS[key];
            const state = states[key];
            const help = guidanceFor(state);
            const canAsk = state !== "granted" && state !== "unsupported" && state !== "insecure";
            return (
              <li key={key} className="rounded-2xl bg-surface-2/70 p-4 ring-1 ring-border">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary ring-1 ring-border">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-semibold">
                        {PERMISSION_COPY[key].label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {PERMISSION_COPY[key].why}
                      </span>
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 ${tone(state)}`}
                  >
                    {STATE_LABEL[state]}
                  </span>
                </div>

                {help && <p className="mt-3 text-xs text-muted-foreground">{help}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={state === "granted" ? "secondary" : "default"}
                    className="min-h-10"
                    disabled={!canAsk || busy === key}
                    onClick={() => ask(key)}
                  >
                    {busy === key
                      ? "Waiting for your answer…"
                      : state === "granted"
                        ? "Allowed"
                        : state === "denied"
                          ? "Try again"
                          : `Allow ${PERMISSION_COPY[key].label.toLowerCase()}`}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">
            Recordings stay on this device until you choose to save or share them.
          </p>
          <Button type="button" variant="ghost" size="sm" className="min-h-10" onClick={refresh}>
            <RefreshCw className="size-4" aria-hidden /> Recheck
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Header entry point with its own dialog instance. */
export function PermissionsButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Permissions and privacy"
        className={`flex min-h-10 items-center gap-2 rounded-lg bg-secondary px-3 text-xs font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      >
        <ShieldCheck className="size-4" aria-hidden />
        <span className="hidden sm:inline">Permissions</span>
      </button>
      <PermissionCenter open={open} onOpenChange={setOpen} />
    </>
  );
}

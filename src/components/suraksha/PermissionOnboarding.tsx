import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { PermissionCenter } from "@/components/suraksha/PermissionCenter";

const KEY = "suraksha:permissions-intro-dismissed";

export function PermissionOnboarding() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* private mode */
    }
  };

  if (!show) return null;

  return (
    <>
      <section aria-labelledby="perm-intro-title" className="glass relative rounded-3xl p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald/12 text-emerald ring-1 ring-emerald/30">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="perm-intro-title" className="font-display text-base font-bold">
              Set up your safety permissions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Camera, microphone, location and notifications are all off until you allow them. Turn
              on only what you want — you can change your mind any time.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="min-h-11 rounded-xl bg-emerald px-4 text-sm font-semibold text-background transition-colors hover:bg-emerald/90"
            >
              Review permissions
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss permission setup"
              className="grid min-h-11 min-w-11 place-items-center rounded-xl bg-secondary transition-colors hover:bg-accent"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </section>
      <PermissionCenter open={open} onOpenChange={setOpen} />
    </>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { MapPinned, Paperclip, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const KINDS = ["Harassment", "Stalking", "Poor lighting", "Suspicious activity"] as const;
const RISK = ["Low", "Moderate", "High"] as const;

const RISK_COLOR: Record<string, string> = {
  Low: "var(--emerald)",
  Moderate: "var(--amber)",
  High: "var(--crimson)",
};

export function ReportForm() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("Harassment");
  const [risk, setRisk] = useState<(typeof RISK)[number]>("Moderate");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [geo, setGeo] = useState("17.4421° N, 78.3915° E · Sector 22, Hyderabad");

  return (
    <section id="report" className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Crowd-sourced safety report</h2>
          <p className="text-sm text-muted-foreground">
            Anonymous reports feed the community risk heatmap within minutes.
          </p>
        </div>
        <span className="rounded-full bg-crimson/12 px-3 py-1 text-[11px] font-semibold text-crimson ring-1 ring-crimson/30">
          412 reports this month
        </span>
      </div>

      <form
        className="mt-5 grid gap-5 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Report submitted", {
            description: `${kind} · ${risk} risk · tagged to ${geo.split("·")[1]?.trim() ?? "your location"}`,
          });
          setNotes("");
          setFiles([]);
        }}
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium">Incident type</p>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  aria-pressed={kind === k}
                  className={`min-h-11 rounded-xl px-4 text-sm font-medium transition-colors ${
                    kind === k
                      ? "bg-crimson text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Risk classification</p>
            <div className="flex flex-wrap gap-2">
              {RISK.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRisk(r)}
                  aria-pressed={risk === r}
                  className="min-h-11 rounded-xl px-4 text-sm font-semibold ring-1 transition-all"
                  style={
                    risk === r
                      ? {
                          background: `color-mix(in oklab, ${RISK_COLOR[r]} 18%, transparent)`,
                          color: RISK_COLOR[r],
                          borderColor: "transparent",
                        }
                      : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="geo" className="text-sm font-medium">
              GPS auto-tag
            </Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="geo"
                value={geo}
                onChange={(e) => setGeo(e.target.value)}
                className="min-h-11"
              />
              <button
                type="button"
                onClick={() => {
                  setGeo("17.4421° N, 78.3915° E · Sector 22, Hyderabad");
                  toast("Location re-tagged", { description: "Accuracy 4.1 m" });
                }}
                className="grid min-h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary transition-colors hover:bg-accent"
                aria-label="Re-tag current location"
              >
                <MapPinned className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              What happened?
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Describe the incident, time of day, and anything that would help others stay safe."
              className="mt-2"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Attachments</p>
            <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-4 text-sm text-muted-foreground transition-colors hover:bg-secondary">
              <Paperclip className="size-4" aria-hidden />
              Attach images or audio
              <input
                type="file"
                multiple
                accept="image/*,audio/*"
                className="sr-only"
                onChange={(e) =>
                  setFiles(
                    Array.from(e.target.files ?? [])
                      .map((f) => f.name)
                      .slice(0, 5),
                  )
                }
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {files.map((f) => (
                  <li
                    key={f}
                    className="max-w-full truncate rounded-full bg-secondary px-3 py-1 text-[11px]"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-crimson text-sm font-bold text-primary-foreground transition-colors hover:bg-crimson/90"
          >
            <ShieldAlert className="size-4" aria-hidden /> Submit report
          </button>
        </div>
      </form>
    </section>
  );
}

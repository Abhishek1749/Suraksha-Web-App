import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/suraksha/SiteHeader";
import { ThreatMonitor } from "@/components/suraksha/threat/ThreatMonitor";
import { IncidentTimeline } from "@/components/suraksha/threat/IncidentTimeline";
import { ReportForm } from "@/components/suraksha/threat/ReportForm";
import { DispatchPanel } from "@/components/suraksha/threat/DispatchPanel";

export const Route = createFileRoute("/threat")({
  head: () => ({
    meta: [
      { title: "AI Threat Detection & Analytics — SURAKSHA" },
      {
        name: "description",
        content:
          "Live AI threat gauge, anomaly stream, chain-of-custody incident timeline, tamper-proof evidence vault, crowd-sourced reporting and police dispatch analytics.",
      },
      { property: "og:title", content: "AI Threat Detection & Analytics — SURAKSHA" },
      {
        property: "og:description",
        content:
          "Real-time danger scoring, evidence chain-of-custody, community safety reports and a police dispatch overview in one dark command console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThreatPage,
});

function ThreatPage() {
  return (
    <div className="grid-bg min-h-screen pb-16">
      <SiteHeader />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              AI threat detection &amp; analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Simulated sensor-fusion telemetry, evidence custody and dispatch intelligence.
            </p>
          </div>
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-4" aria-hidden /> Command
          </Link>
        </div>

        <ThreatMonitor />
        <IncidentTimeline />
        <ReportForm />
        <DispatchPanel />
      </main>
    </div>
  );
}

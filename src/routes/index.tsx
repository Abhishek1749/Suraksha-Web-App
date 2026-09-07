import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/suraksha/SiteHeader";
import { SosHero } from "@/components/suraksha/SosHero";
import { QuickTools } from "@/components/suraksha/QuickTools";
import { ContactRibbon } from "@/components/suraksha/ContactRibbon";
import { RecordingDrawer } from "@/components/suraksha/RecordingDrawer";
import { PermissionOnboarding } from "@/components/suraksha/PermissionOnboarding";
import { FakeCallModal } from "@/components/suraksha/FakeCallModal";
import { PhoneCall, Mic, Siren, Map, Activity, Bot } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SURAKSHA — AI & IoT Women Safety Command" },
      {
        name: "description",
        content:
          "SURAKSHA is an AI and IoT women safety console: instant SOS dispatch, stealth recording, fake calls and one-tap 112, 100 and 1091 helplines.",
      },
      { property: "og:title", content: "SURAKSHA — AI & IoT Women Safety Command" },
      {
        property: "og:description",
        content:
          "Instant SOS dispatch, stealth recording, fake calls and one-tap emergency helplines in a single safety console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [fakeCall, setFakeCall] = useState(false);
  const [recOpen, setRecOpen] = useState(false);
  const [recMode, setRecMode] = useState<"audio" | "video">("audio");

  const openRecorder = (mode: "audio" | "video") => {
    setRecMode(mode);
    setRecOpen(true);
  };

  return (
    <div className="grid-bg min-h-screen pb-28">
      <SiteHeader />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <PermissionOnboarding />
        <SosHero />
        <QuickTools onFakeCall={() => setFakeCall(true)} onRecord={openRecorder} />
        <section id="recordings" className="glass rounded-3xl p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-bold">Evidence vault</h2>
              <p className="text-sm text-muted-foreground">
                Record audio or video evidence on this device, review it, then download or delete
                it. Nothing uploads without you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openRecorder("audio")}
              className="min-h-11 shrink-0 rounded-xl bg-crimson px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-crimson/90"
            >
              Open recorder
            </button>
          </div>
        </section>
        <section className="glass rounded-3xl p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-bold">Map &amp; navigation</h2>
              <p className="text-sm text-muted-foreground">
                Safe-zone overlays, safest routing, geofence alerts and nearby help.
              </p>
            </div>
            <Link
              to="/map"
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold transition-colors hover:bg-accent"
            >
              <Map className="size-4" aria-hidden /> Open map
            </Link>
          </div>
        </section>
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">AI threat detection</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Live danger scoring, anomaly stream, evidence chain-of-custody and dispatch analytics.
            </p>
            <Link
              to="/threat"
              className="mt-4 flex min-h-11 w-fit items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold transition-colors hover:bg-accent"
            >
              <Activity className="size-4" aria-hidden /> Open threat console
            </Link>
          </div>
          <div className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Safety &amp; AI assistant</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask about rights, Zero-FIR and first aid, arm voice triggers, rank trusted contacts.
            </p>
            <Link
              to="/assistant"
              className="mt-4 flex min-h-11 w-fit items-center gap-2 rounded-xl bg-emerald px-4 text-sm font-semibold text-background transition-colors hover:bg-emerald/90"
            >
              <Bot className="size-4" aria-hidden /> Open assistant
            </Link>
          </div>
        </section>

        <ContactRibbon />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 glass border-x-0 border-b-0 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setFakeCall(true)}
            aria-label="Start a fake incoming call"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold transition-colors hover:bg-accent"
          >
            <PhoneCall className="size-4" aria-hidden />
            <span className="hidden sm:inline">Fake call</span>
          </button>
          <button
            type="button"
            onClick={() => openRecorder("audio")}
            aria-label="Open the evidence recorder"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold transition-colors hover:bg-accent"
          >
            <Mic className="size-4" aria-hidden />
            <span className="hidden sm:inline">Record</span>
          </button>
          <a
            href="tel:112"
            className="flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-crimson text-sm font-bold text-primary-foreground transition-colors hover:bg-crimson/90"
          >
            <Siren className="size-4" aria-hidden />
            Call 112 now
          </a>
        </div>
      </div>

      <FakeCallModal open={fakeCall} onOpenChange={setFakeCall} />
      <RecordingDrawer open={recOpen} mode={recMode} onOpenChange={setRecOpen} />
    </div>
  );
}

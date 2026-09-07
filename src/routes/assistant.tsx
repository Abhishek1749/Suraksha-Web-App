import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/suraksha/SiteHeader";
import { ChatWorkspace } from "@/components/suraksha/assistant/ChatWorkspace";
import { VoiceCommands } from "@/components/suraksha/assistant/VoiceCommands";
import { ContactPrioritizer } from "@/components/suraksha/assistant/ContactPrioritizer";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Safety & AI Assistant — SURAKSHA" },
      {
        name: "description",
        content:
          "AI safety chatbot for legal rights, Zero-FIR and first aid, multilingual voice trigger phrases and a smart emergency contact prioritizer.",
      },
      { property: "og:title", content: "Safety & AI Assistant — SURAKSHA" },
      {
        property: "og:description",
        content:
          "Ask an AI safety assistant, arm multilingual voice triggers and rank trusted contacts by proximity and availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <div className="grid-bg min-h-screen pb-16">
      <SiteHeader />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Safety &amp; AI assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Guidance, voice triggers and contact intelligence — always one tap away.
            </p>
          </div>
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-4" aria-hidden /> Command
          </Link>
        </div>

        <ChatWorkspace />
        <VoiceCommands />
        <ContactPrioritizer />
      </main>
    </div>
  );
}

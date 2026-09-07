import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

const SYSTEM = `You are SURAKSHA Assist, a calm, practical women-safety assistant for users in India.
Scope: personal safety guidance, Indian legal rights (IPC/BNS basics, Zero-FIR, POSH Act, section 498A, cyber-crime reporting), emergency helplines (112, 100, 1091, 181, 108, 1930), first-aid steps, and risk assessment of a described situation.
Rules:
- If the user seems in immediate danger, start with a one-line urgent action and the right helpline number.
- Answer in short markdown: max 6 bullet points or numbered steps, bold the key action.
- Be specific and factual. Say clearly when something needs a lawyer, doctor or police officer.
- Never claim to have dispatched help; the app's SOS button does that.`;

export const askSafetyAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this app.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "system", content: SYSTEM }, ...data.messages],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429)
        throw new Error("Too many requests right now — try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits are exhausted for this workspace. Add credits to continue.");
      throw new Error(`Assistant unavailable (${res.status}). ${body.slice(0, 180)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("The assistant returned an empty reply.");
    return { reply };
  });

import { action } from "../_generated/server";
import { v } from "convex/values";
import { saveMessage, listMessages } from "@convex-dev/agent";
import { components } from "../_generated/api";

const AICREDITS_BASE_URL = "https://api.aicredits.in/v1";
const MODEL = "openai/gpt-4o";
const SYSTEM_PROMPT =
    "You are AetherLive, a helpful AI customer support agent. Greet the user warmly and help them with their questions. Keep responses concise and professional.";

export const respond = action({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const { threadId } = args;

        const apiKey = process.env.AI_Credits_API_KEY;
        if (!apiKey) {
            console.warn("[agent] No AI_Credits_API_KEY configured — skipping AI response");
            return;
        }

        const history = await listMessages(ctx, components.agent, {
            threadId,
            paginationOpts: { numItems: 20, cursor: null },
        });

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.page.map((m: any) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
            })),
        ];

        const response = await fetch(`${AICREDITS_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            console.error(`[agent] AI Credits API error: ${response.status} ${await response.text()}`);
            return;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            console.error("[agent] No response text from AI Credits");
            return;
        }

        await saveMessage(ctx, components.agent, {
            threadId,
            message: {
                role: "assistant",
                content: text,
            },
        });
    },
});

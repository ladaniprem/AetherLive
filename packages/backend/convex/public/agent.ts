import { action } from "../_generated/server";
import { v } from "convex/values";
import { saveMessage, listMessages } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const respond = action({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const { threadId } = args;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("[agent] No GEMINI_API_KEY configured — skipping AI response");
            return;
        }

        const history = await listMessages(ctx, components.agent, {
            threadId,
            paginationOpts: { numItems: 20, cursor: null },
        });

        const messages = history.page.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
        }));

        messages.unshift({
            role: "user" as const,
            parts: [{ text: "You are AetherLive, a helpful AI customer support agent. Greet the user warmly and help them with their questions. Keep responses concise and professional." }],
        });

        messages.push({
            role: "model" as const,
            parts: [{ text: "Hi there! I'm AetherLive AI. How can I help you today?" }],
        });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: messages,
                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.7,
                    },
                }),
            },
        );

        if (!response.ok) {
            console.error(`[agent] Gemini API error: ${response.status} ${await response.text()}`);
            return;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error("[agent] No response text from Gemini");
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

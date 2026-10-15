import { action, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { saveMessage, listMessages } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { checkRateLimitAction } from "../lib/rateLimit";

const AICREDITS_BASE_URL = "https://api.aicredits.in/v1";
const MODEL = "openai/gpt-4o-mini";
const HISTORY_LIMIT = 20;

const SYSTEM_PROMPT = [
    "You are AetherLive, a helpful AI customer support agent.",
    "Greet the user warmly and help them with their questions.",
    "Keep responses concise and professional.",
].join(" ");

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Resolve which org owns a thread. The agent action is public (the visitor
 * widget calls it with only a threadId), so the org has to come from the
 * server-side thread→conversation link, never from the client.
 */
export const threadContext = internalQuery({
    args: { threadId: v.string() },
    handler: async (ctx, args) => {
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
            .first();

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Legacy rows can predate `organizationId`; without it there is no
        // plan to check, so treat the thread as unentitled.
        if (!conversation.organizationId) {
            throw new Error("Conversation has no organization");
        }

        return {
            organizationId: conversation.organizationId,
            conversationId: conversation._id,
        };
    },
});

/**
 * `listMessages()` returns MessageDocs **newest-first**, with the role at
 * `message.role` and the plain text at `text`. There is no top-level `.role`,
 * and `.content` is a structured array — reading those is what made the model
 * see every turn as a user turn full of JSON. Chat completions need
 * chronological order, so reverse and only keep the tail.
 */
function toChatMessages(docs: any[]): ChatMessage[] {
    return docs
        .slice(0, HISTORY_LIMIT)
        .reverse()
        .map((m: any) => {
            const text =
                typeof m.text === "string" && m.text
                    ? m.text
                    : Array.isArray(m.parts)
                      ? m.parts
                            .filter((p: any) => p.type === "text" && typeof p.text === "string")
                            .map((p: any) => p.text)
                            .join("")
                      : "";

            return {
                role: m.message?.role === "assistant" ? ("assistant" as const) : ("user" as const),
                content: text,
            };
        })
        .filter((m) => m.content.trim().length > 0);
}

async function callAi(messages: ChatMessage[]): Promise<string> {
    const apiKey = process.env.AI_Credits_API_KEY;
    if (!apiKey) {
        throw new Error("AI_NOT_CONFIGURED");
    }

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
        const detail = await response.text();
        console.error(`[agent] AI Credits API error: ${response.status} ${detail.slice(0, 300)}`);
        throw new Error(`AI_REQUEST_FAILED: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (typeof text !== "string" || !text.trim()) {
        console.error("[agent] Empty completion from AI Credits");
        throw new Error("AI_EMPTY_RESPONSE");
    }

    return text;
}

/**
 * Built-in AI responder. Always the last resort: the widget prefers the Vapi
 * assistant (same brain as the voice calls) and falls back here, so an
 * entitled org always gets a reply even with no Vapi wiring or no card on
 * file in Vapi.
 */
export const respond = action({
    args: {
        threadId: v.string(),
        /**
         * Set by the widget for a brand-new empty chat so the model opens the
         * conversation instead of replying to nothing. Without it an empty
         * thread produces a nonsensical answer to a nonexistent question.
         */
        greeting: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { threadId } = args;

        const { internal } = await import("../_generated/api");
        const context = await ctx.runQuery(internal.public.agent.threadContext, { threadId });

        // The AI call costs money per request — a free org must never reach it.
        await ctx.runQuery(internal.entitlements.assertFeature, {
            organizationId: context.organizationId,
            feature: "aiCustomerSupport",
        });

        await checkRateLimitAction(ctx, "agentRespond", context.organizationId);

        const history = await listMessages(ctx, components.agent, {
            threadId,
            paginationOpts: { numItems: HISTORY_LIMIT, cursor: null },
        });

        const turns = toChatMessages(history.page as any[]);

        if (turns.length === 0) {
            if (!args.greeting) {
                // Nothing to answer and no greeting requested — the caller
                // raced the mutation. Not an error.
                return;
            }

            const greeting = await callAi([
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content:
                        "The visitor just opened a new chat and has not written anything yet. Greet them briefly and ask how you can help.",
                },
            ]);

            await saveMessage(ctx, components.agent, {
                threadId,
                message: { role: "assistant", content: greeting },
            });
            return;
        }

        // An empty thread is only ever the greeting case; anything else means
        // the visitor (or the operator) spoke last.
        const reply = await callAi([
            { role: "system", content: SYSTEM_PROMPT },
            ...turns,
        ]);

        await saveMessage(ctx, components.agent, {
            threadId,
            message: { role: "assistant", content: reply },
        });
    },
});

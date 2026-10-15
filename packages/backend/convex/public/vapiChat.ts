import { action, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { listMessages, saveMessage } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { requireFeature } from "../lib/subscription";
import { checkRateLimitAction } from "../lib/rateLimit";

// Text chat answered by the SAME Vapi assistant as voice calls,
// so chat + voice behave "accordingly" (same brain, same answers).
// Multi-turn context via Vapi previousChatId chaining (stored per conversation).
// Throws VAPI_NOT_CONFIGURED when the org has no Vapi wired —
// callers should fall back to the built-in agent in that case.

export const threadContext = internalQuery({
    args: {
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get("contactSessions", args.contactSessionId);
        if (!session) throw new Error("Contact session not found");

        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_contactSessionId_and_threadId", (q) =>
                q.eq("contactSessionId", args.contactSessionId).eq("threadId", args.threadId),
            )
            .first();
        if (!conversation) throw new Error("Not authorized");

        const organizationId = session.organizationId;

        // Gate here (not just in `respond`) so the entitlement is checked
        // before any secret is read.
        await requireFeature(ctx, organizationId, "aiVoiceAgent");

        const secret = await ctx.db
            .query("secrets")
            .withIndex("by_service_and_organizationId", (q) =>
                q.eq("service", "vapi").eq("organizationId", organizationId),
            )
            .first();
        const secretValue = secret?.value as
            | { publicApiKey?: string; privateApiKey?: string }
            | undefined;

        const settings = await ctx.db
            .query("widgetSettings")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
            .first();

        return {
            organizationId,
            conversationId: conversation._id,
            vapiChatId: conversation.vapiChatId,
            privateKey: secretValue?.privateApiKey ?? process.env.VAPI_API_KEY,
            assistantId: settings?.vapiSettings.assistantId,
        };
    },
});

export const saveChatId = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        vapiChatId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.conversationId, { vapiChatId: args.vapiChatId });
    },
});

export const respond = action({
    args: {
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
        greeting: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { threadId, contactSessionId, greeting } = args;
        const { internal } = await import("../_generated/api");

        const context = await ctx.runQuery(internal.public.vapiChat.threadContext, {
            threadId,
            contactSessionId,
        });

        if (!context.privateKey || !context.assistantId) {
            throw new Error("VAPI_NOT_CONFIGURED");
        }

        await checkRateLimitAction(ctx, "vapiChatRespond", context.organizationId);

        // Fresh empty chat: ask the assistant to open with a greeting.
        // Otherwise answer the visitor's latest message.
        let input: string | undefined;
        if (greeting) {
            input = "The visitor just opened a new chat. Greet them briefly and ask how you can help.";
        } else {
            const history = await listMessages(ctx, components.agent, {
                threadId,
                paginationOpts: { numItems: 10, cursor: null },
            });

            const lastUser = [...history.page]
                .reverse()
                .find(
                    (m: any) =>
                        m.message?.role !== "assistant" &&
                        typeof m.text === "string" &&
                        m.text,
                ) as any;
            if (!lastUser?.text) return;
            input = lastUser.text;
        }

        const response = await fetch("https://api.vapi.ai/chat", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${context.privateKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                assistantId: context.assistantId,
                input,
                previousChatId: context.vapiChatId,
                stream: false,
            }),
        });

        if (!response.ok) {
            const detail = await response.text();
            console.error(`[vapiChat] API error: ${response.status} ${detail}`);
            throw new Error(`VAPI_REQUEST_FAILED: ${response.status} ${detail.slice(0, 300)}`);
        }

        const data = (await response.json()) as {
            id?: string;
            output?: Array<{ role?: string; content?: string }>;
        };

        const text = data.output?.find(
            (m) => m.role === "assistant" && m.content,
        )?.content;
        if (!text) {
            console.error("[vapiChat] No assistant output in response");
            throw new Error("VAPI_EMPTY_RESPONSE");
        }

        if (data.id && data.id !== context.vapiChatId) {
            await ctx.runMutation(internal.public.vapiChat.saveChatId, {
                conversationId: context.conversationId,
                vapiChatId: data.id,
            });
        }

        await saveMessage(ctx, components.agent, {
            threadId,
            message: { role: "assistant", content: text },
        });
    },
});

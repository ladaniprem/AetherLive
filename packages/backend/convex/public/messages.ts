import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { listMessages, saveMessage } from "@convex-dev/agent";
import { checkRateLimit, checkRateLimitQuery } from "../lib/rateLimit";
import { components } from "../_generated/api";
import { requireFeature } from "../lib/subscription";

export const getMany = query({
    args: {
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const { threadId, contactSessionId } = args;

        await checkRateLimitQuery(ctx, "publicMessageGetMany", contactSessionId);

        const session = await ctx.db.get("contactSessions", contactSessionId);
        if (!session) throw new Error("Contact session not found");

        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_contactSessionId_and_threadId", (q) =>
                q.eq("contactSessionId", contactSessionId).eq("threadId", threadId),
            )
            .first();
        if (!conversation) throw new Error("Not authorized");

        await requireFeature(ctx, session.organizationId, "aiCustomerSupport");

        return await listMessages(ctx, components.agent, {
            threadId,
            paginationOpts: args.paginationOpts,
        });
    },
});

// Saves a finished voice-call transcript into the chat thread as proper
// conversation messages (caller = user side, agent = assistant side),
// so the call appears in chat format instead of prefixed transcript lines.
export const saveTranscript = mutation({
    args: {
        conversationId: v.string(),
        contactSessionId: v.id("contactSessions"),
        lines: v.array(
            v.object({
                role: v.union(v.literal("user"), v.literal("assistant")),
                // Optional: voice transcript events sometimes carry no text
                text: v.optional(v.string()),
            }),
        ),
    },
    handler: async (ctx, args) => {
        const { conversationId, contactSessionId, lines } = args;

        const session = await ctx.db.get("contactSessions", contactSessionId);
        if (!session) throw new Error("Contact session not found");

        const normalizedConversationId = ctx.db.normalizeId("conversations", conversationId);
        const conversation = normalizedConversationId
            ? await ctx.db.get("conversations", normalizedConversationId)
            : null;
        if (!conversation || conversation.contactSessionId !== contactSessionId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, session.organizationId, "aiCustomerSupport");

        await checkRateLimit(ctx, "publicMessageCreate", contactSessionId);

        const clean = lines
            .map((l) => ({ role: l.role, text: (l.text ?? "").slice(0, 2000) }))
            .filter((l) => l.text.trim().length > 0)
            .slice(0, 50);
        if (clean.length === 0) return { saved: 0 };

        for (const line of clean) {
            if (line.role === "assistant") {
                await saveMessage(ctx, components.agent, {
                    threadId: conversation.threadId,
                    message: { role: "assistant", content: line.text },
                });
            } else {
                await saveMessage(ctx, components.agent, {
                    threadId: conversation.threadId,
                    prompt: line.text,
                });
            }
        }
        return { saved: clean.length };
    },
});

export const create = mutation({
    args: {
        threadId: v.string(),
        prompt: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const { threadId, contactSessionId, prompt } = args;

        const session = await ctx.db.get("contactSessions", contactSessionId);
        if (!session) throw new Error("Contact session not found");

        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_contactSessionId_and_threadId", (q) =>
                q.eq("contactSessionId", contactSessionId).eq("threadId", threadId),
            )
            .first();
        if (!conversation) throw new Error("Not authorized");

        await requireFeature(ctx, session.organizationId, "aiCustomerSupport");

        await checkRateLimit(ctx, "publicMessageCreate", contactSessionId);

        // Stored raw — React escapes on render and AIResponse runs
        // rehypeSanitize, so at-rest escaping would double-encode text.
        await saveMessage(ctx, components.agent, {
            threadId,
            prompt: prompt.slice(0, 10000),
        });
    },
});

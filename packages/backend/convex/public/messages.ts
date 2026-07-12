import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { listMessages, saveMessage } from "@convex-dev/agent";
import { checkRateLimit, checkRateLimitQuery } from "../lib/rateLimit";
import { components } from "../_generated/api";

function sanitize(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

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
            .filter((q) =>
                q.and(
                    q.eq(q.field("contactSessionId"), contactSessionId),
                    q.eq(q.field("threadId"), threadId),
                ),
            )
            .first();
        if (!conversation) throw new Error("Not authorized");

        return await listMessages(ctx, components.agent, {
            threadId,
            paginationOpts: args.paginationOpts,
        });
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
            .filter((q) =>
                q.and(
                    q.eq(q.field("contactSessionId"), contactSessionId),
                    q.eq(q.field("threadId"), threadId),
                ),
            )
            .first();
        if (!conversation) throw new Error("Not authorized");

        await checkRateLimit(ctx, "publicMessageCreate", contactSessionId);

        const sanitizedPrompt = sanitize(prompt).slice(0, 10000);

        await saveMessage(ctx, components.agent, {
            threadId,
            prompt: sanitizedPrompt,
        });
    },
});

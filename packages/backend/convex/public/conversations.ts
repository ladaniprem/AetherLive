import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { checkRateLimit, checkRateLimitQuery } from "../lib/rateLimit";
import { createThread } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const getOne = query({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const { conversationId, contactSessionId } = args;

        await checkRateLimitQuery(ctx, "conversationGetOne", contactSessionId);

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            return null;
        }

        if (conversation.contactSessionId !== contactSessionId) {
            return null;
        }

        return conversation;
    },
});

export const getMany = query({
    args: {
        contactSessionId: v.id("contactSessions"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const { contactSessionId } = args;

        const session = await ctx.db.get("contactSessions", contactSessionId);
        if (!session) throw new Error("Contact session not found");

        return await ctx.db
            .query("conversations")
            .filter((q) => q.eq(q.field("contactSessionId"), contactSessionId))
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

export const create = mutation({
    args: {
        contactSessionId: v.id("contactSessions"),
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { contactSessionId, organizationId } = args;

        await checkRateLimit(ctx, "contactSessionCreate", organizationId);

        const session = await ctx.db.get("contactSessions", contactSessionId);
        if (!session) throw new Error("Contact session not found");
        if (session.organizationId !== organizationId) throw new Error("Not authorized");

        const threadId = await createThread(ctx, components.agent);

        const conversationId = await ctx.db.insert("conversations", {
            status: "unresolved",
            threadId,
            contactSessionId,
            organizationId,
        });

        await ctx.db.patch("contactSessions", contactSessionId, {
            conversationId,
        });

        return conversationId;
    },
});

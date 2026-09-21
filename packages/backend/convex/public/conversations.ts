import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { checkRateLimit, checkRateLimitQuery } from "../lib/rateLimit";
import { createThread } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const getOne = query({
    args: {
        conversationId: v.string(),
        contactSessionId: v.string(),
    },
    handler: async (ctx, args) => {
        // Stale IDs from other deployments decode as foreign-table IDs — treat as missing
        const conversationId = ctx.db.normalizeId("conversations", args.conversationId);
        const contactSessionId = ctx.db.normalizeId("contactSessions", args.contactSessionId);
        if (!conversationId || !contactSessionId) return null;

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
        contactSessionId: v.string(),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const contactSessionId = ctx.db.normalizeId("contactSessions", args.contactSessionId);
        if (!contactSessionId) {
            return { page: [], isDone: true, continueCursor: "" };
        }

        const session = await ctx.db.get("contactSessions", contactSessionId);
        if (!session) {
            return { page: [], isDone: true, continueCursor: "" };
        }

        return await ctx.db
            .query("conversations")
            .filter((q) => q.eq(q.field("contactSessionId"), contactSessionId))
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

export const create = mutation({
    args: {
        contactSessionId: v.string(),
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        const contactSessionId = ctx.db.normalizeId("contactSessions", args.contactSessionId);
        if (!contactSessionId) throw new Error("Invalid contact session");

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

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getMany = query({
    args: {
        paginationOpts: paginationOptsValidator,
        status: v.optional(
            v.union(
                v.literal("unresolved"),
                v.literal("resolved"),
                v.literal("escalated"),
            ),
        ),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("conversations");

        if (args.status) {
            query = query.filter((q) => q.eq(q.field("status"), args.status));
        }

        const result = await query.order("desc").paginate(args.paginationOpts);

        const page = await Promise.all(
            result.page.map(async (conversation) => {
                const contactSession = await ctx.db.get(
                    "contactSessions",
                    conversation.contactSessionId,
                );

                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_threadId", (q) => q.eq("threadId", conversation.threadId))
                    .order("desc")
                    .first();

                return {
                    ...conversation,
                    contactSession,
                    lastMessage,
                };
            }),
        );

        return {
            ...result,
            page,
        };
    },
});

export const getOne = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const { conversationId } = args;
        return await ctx.db.get("conversations", conversationId);
    },
});

export const updateStatus = mutation({
    args: {
        conversationId: v.id("conversations"),
        status: v.union(
            v.literal("unresolved"),
            v.literal("resolved"),
            v.literal("escalated"),
        ),
    },
    handler: async (ctx, args) => {
        const { conversationId, status } = args;
        await ctx.db.patch("conversations", conversationId, { status });
    },
});

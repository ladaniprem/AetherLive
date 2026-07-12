import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { listMessages } from "@convex-dev/agent";
import { components } from "../_generated/api";

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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        let query = ctx.db.query("conversations");

        if (args.status) {
            query = query.filter((q) => q.eq(q.field("status"), args.status));
        }

        const result = await query.order("desc").paginate(args.paginationOpts);

        const page = (await Promise.all(
            result.page.map(async (conversation) => {
                const contactSession = await ctx.db.get(
                    "contactSessions",
                    conversation.contactSessionId,
                );

                if (!contactSession || contactSession.organizationId !== identity.orgId) {
                    return null;
                }

                const lastMsgResult = await listMessages(ctx, components.agent, {
                    threadId: conversation.threadId,
                    paginationOpts: { numItems: 1, cursor: null },
                });
                const lastMessage = lastMsgResult.page[0] ?? null;

                return {
                    ...conversation,
                    contactSession,
                    lastMessage,
                };
            }),
        )).filter((item): item is NonNullable<typeof item> => item !== null);

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

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            return null;
        }

        const contactSession = await ctx.db.get("contactSessions", conversation.contactSessionId);
        if (!contactSession || contactSession.organizationId !== identity.orgId) {
            return null;
        }

        return conversation;
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

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        const contactSession = await ctx.db.get("contactSessions", conversation.contactSessionId);
        if (!contactSession || contactSession.organizationId !== identity.orgId) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch("conversations", conversationId, { status });
    },
});

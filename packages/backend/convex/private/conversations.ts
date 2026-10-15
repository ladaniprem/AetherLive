import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { createThread, listMessages, updateThreadMetadata } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { getOrganizationId } from "../lib/auth";
import { requireFeature } from "../lib/subscription";

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

const organizationId = getOrganizationId(identity);

        if (!organizationId) {
            return { page: [], continueCursor: "", isDone: true };
        }

        await requireFeature(ctx, organizationId, "aiCustomerSupport");

        const result = args.status
            ? await ctx.db
                .query("conversations")
                .withIndex("by_organizationId_and_status", (q) =>
                    q.eq("organizationId", organizationId).eq("status", args.status!),
                )
                .order("desc")
                .paginate(args.paginationOpts)
            : await ctx.db
                .query("conversations")
                .withIndex("by_organizationId_and_status", (q) =>
                    q.eq("organizationId", organizationId),
                )
                .order("desc")
                .paginate(args.paginationOpts);

        const page = (await Promise.all(
            result.page.map(async (conversation) => {
                const contactSession = await ctx.db.get(
                    "contactSessions",
                    conversation.contactSessionId,
                );

                if (!contactSession) {
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

const organizationId = getOrganizationId(identity);

        if (!organizationId) return null;

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            return null;
        }

        const contactSession = await ctx.db.get("contactSessions", conversation.contactSessionId);
        if (!contactSession || contactSession.organizationId !== organizationId) {
            return null;
        }

        await requireFeature(ctx, organizationId, "aiCustomerSupport");

        return conversation;
    },
});

export const remove = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const { conversationId } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);
        if (!organizationId) throw new Error("Not authorized");

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (conversation.organizationId !== organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "aiCustomerSupport");

        // Unlink the visitor session if it points at this conversation
        const session = await ctx.db.get("contactSessions", conversation.contactSessionId);
        if (session?.conversationId === conversationId) {
            await ctx.db.patch(session._id, { conversationId: undefined });
        }

        // Archive the AI thread (history becomes inaccessible); doc delete below
        try {
            await updateThreadMetadata(ctx, components.agent, {
                threadId: conversation.threadId,
                patch: { status: "archived" },
            });
        } catch (error) {
            console.warn("[conversations.remove] thread archive failed:", error);
        }

        await ctx.db.delete(conversationId);
        return { deleted: true };
    },
});

export const clearMessages = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const { conversationId } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);
        if (!organizationId) throw new Error("Not authorized");

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (conversation.organizationId !== organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "aiCustomerSupport");

        // Fresh thread = empty message history; old thread orphaned.
        const threadId = await createThread(ctx, components.agent);
        await ctx.db.patch(conversationId, {
            threadId,
            vapiChatId: undefined,
        });
        return { cleared: true };
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

const organizationId = getOrganizationId(identity);

        if (!organizationId) throw new Error("Not authorized");

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (conversation.organizationId !== organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "aiCustomerSupport");

        await ctx.db.patch("conversations", conversationId, { status });
    },
});

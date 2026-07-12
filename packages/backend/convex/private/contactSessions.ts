import { query } from "../_generated/server";
import { v } from "convex/values";

export const getOneByConversationId = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const { conversationId } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const contactSession = await ctx.db
            .query("contactSessions")
            .filter((q) => q.eq(q.field("conversationId"), conversationId))
            .first();

        if (!contactSession || contactSession.organizationId !== identity.orgId) {
            return null;
        }

        return contactSession;
    },
});

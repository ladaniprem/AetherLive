import { query } from "../_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "../lib/auth";

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

const organizationId = getOrganizationId(identity);

        if (!organizationId) return null;

        const contactSession = await ctx.db
            .query("contactSessions")
            .filter((q) => q.eq(q.field("conversationId"), conversationId))
            .first();

        if (!contactSession || contactSession.organizationId !== organizationId) {
            return null;
        }

        return contactSession;
    },
});

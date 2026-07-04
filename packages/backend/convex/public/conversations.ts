import { query } from "../_generated/server";
import { v } from "convex/values";

export const getOne = query({
    args: {
        conversationId: v.id("conversations"),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const { conversationId, contactSessionId } = args;

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

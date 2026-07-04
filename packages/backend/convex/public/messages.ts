import { query, action } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { listMessages, saveMessage } from "@convex-dev/agent";

export const getMany = query({
    args: {
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const { threadId, paginationOpts } = args;

        return await listMessages(ctx, components.agent, {
            threadId,
            paginationOpts,
        });
    },
});

export const create = action({
    args: {
        threadId: v.string(),
        prompt: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const { threadId, prompt } = args;

        await saveMessage(ctx, components.agent, {
            threadId,
            prompt,
        });
    },
});

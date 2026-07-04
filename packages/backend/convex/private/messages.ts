import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { listMessages, saveMessage } from "@convex-dev/agent";

export const getMany = query({
    args: {
        threadId: v.string(),
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

export const create = mutation({
    args: {
        conversationId: v.id("conversations"),
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
        const { conversationId, prompt } = args;

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        await saveMessage(ctx, components.agent, {
            threadId: conversation.threadId,
            prompt,
        });
    },
});

export const enhanceResponse = action({
    args: {
        prompt: v.string(),
    },
    handler: async (_ctx, args) => {
        const { prompt } = args;
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful customer support assistant. Enhance the following message to be more professional and helpful.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to enhance response: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },
});

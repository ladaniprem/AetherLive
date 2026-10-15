import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { listMessages, saveMessage } from "@convex-dev/agent";
import { checkRateLimit, checkRateLimitAction } from "../lib/rateLimit";
import { components } from "../_generated/api";
import { getOrganizationId } from "../lib/auth";
import { requireFeature } from "../lib/subscription";

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const { threadId, paginationOpts } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);
        if (!organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "aiCustomerSupport");

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

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        await checkRateLimit(ctx, "messageCreate", identity.subject);

const organizationId = getOrganizationId(identity);

        if (!organizationId) throw new Error("Not authorized");

        const conversation = await ctx.db.get("conversations", conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        const contactSession = await ctx.db.get("contactSessions", conversation.contactSessionId);
        if (!contactSession || contactSession.organizationId !== organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "aiCustomerSupport");

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
    handler: async (ctx, args) => {
        const { prompt } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        await checkRateLimitAction(ctx, "enhanceResponse", identity.subject);

        const organizationId = getOrganizationId(identity);
        if (!organizationId) {
            throw new Error("Not authorized");
        }

        const { internal } = await import("../_generated/api");
        await ctx.runQuery(internal.entitlements.assertFeature, {
            organizationId,
            feature: "aiCustomerSupport",
        });

        // Uses AI Credits (OpenAI-compatible) — OPENAI_API_KEY was never set
        // on the deployment, which made Enhance always fail with Unauthorized.
        const apiKey = process.env.AI_Credits_API_KEY;
        if (!apiKey) {
            throw new Error("AI credits key not configured");
        }

        const response = await fetch("https://api.aicredits.in/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
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

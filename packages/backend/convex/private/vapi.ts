import { action, internalQuery } from "../_generated/server";
import { ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { getOrganizationId } from "../lib/auth";
import { requireFeature } from "../lib/subscription";

export const getSecret = internalQuery({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);
        if (!organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "aiVoiceAgent");

        const secret = await ctx.db
            .query("secrets")
            .withIndex("by_service_and_organizationId", (q) =>
                q.eq("service", "vapi").eq("organizationId", organizationId),
            )
            .first();

        if (!secret) {
            return null;
        }

        return secret.value as {
            publicApiKey?: string;
            privateApiKey?: string;
        };
    },
});

async function getVapiApiKey(ctx: ActionCtx): Promise<string | undefined> {
    const secret: {
        publicApiKey?: string;
        privateApiKey?: string;
    } | null = await ctx.runQuery(internal.private.vapi.getSecret, {});
    return secret?.privateApiKey ?? process.env.VAPI_API_KEY;
}

export const getAssistants = action({
    args: {},
    handler: async (ctx) => {
        const apiKey = await getVapiApiKey(ctx);
        if (!apiKey) {
            throw new Error("Vapi API key is not configured");
        }

        const response = await fetch("https://api.vapi.ai/assistant", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch assistants: ${response.statusText}`);
        }

        return await response.json();
    },
});

export const getPhoneNumbers = action({
    args: {},
    handler: async (ctx) => {
        const apiKey = await getVapiApiKey(ctx);
        if (!apiKey) {
            throw new Error("Vapi API key is not configured");
        }

        const response = await fetch("https://api.vapi.ai/phone-number", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch phone numbers: ${response.statusText}`);
        }

        return await response.json();
    },
});

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getOne = query({
    args: {
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get("contactSessions", args.contactSessionId);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        organizationId: v.string(),
        metadata: v.object({
            userAgent: v.string(),
            language: v.string(),
            languages: v.optional(v.string()),
            platform: v.string(),
            vendor: v.string(),
            screenResolution: v.string(),
            viewportSize: v.string(),
            timezone: v.string(),
            timezoneOffset: v.number(),
            cookieEnabled: v.boolean(),
            referrer: v.string(),
            currentUrl: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const { name, email, organizationId, metadata } = args;
        const contactSessionId = await ctx.db.insert("contactSessions", {
            name,
            email,
            organizationId,
            metadata,
        });
        return contactSessionId;
    },
});

export const validate = mutation({
    args: {
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get("contactSessions", args.contactSessionId);
        return { valid: !!session };
    },
});

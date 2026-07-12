import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { checkRateLimit } from "../lib/rateLimit";
import { validateCsrfToken } from "../lib/csrf";

export const getOne = query({
    args: {
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get("contactSessions", args.contactSessionId);
        if (!session) return null;
        // Only return non-PII fields - the session ID acts as bearer token
        return {
            _id: session._id,
            _creationTime: session._creationTime,
            organizationId: session.organizationId,
            conversationId: session.conversationId,
        };
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        organizationId: v.string(),
        csrfToken: v.string(),
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
        const { name, email, organizationId, csrfToken, metadata } = args;

        if (name.length > 200) throw new Error("Name too long");
        if (email.length > 320) throw new Error("Email too long");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");

        await checkRateLimit(ctx, "contactSessionCreate", organizationId);
        await validateCsrfToken(ctx, csrfToken, organizationId);

        const sanitized = (s: string) =>
            s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const contactSessionId = await ctx.db.insert("contactSessions", {
            name: sanitized(name),
            email: sanitized(email),
            organizationId,
            metadata: {
                ...metadata,
                referrer: sanitized(metadata.referrer),
                currentUrl: sanitized(metadata.currentUrl),
            },
        });
        return contactSessionId;
    },
});

export const validate = mutation({
    args: {
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        await checkRateLimit(ctx, "contactSessionValidate", args.contactSessionId);
        const session = await ctx.db.get("contactSessions", args.contactSessionId);
        return { valid: !!session };
    },
});
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
    users: defineTable({
        name: v.string(),
    }),
    contactSessions: defineTable({
        name: v.string(),
        email: v.string(),
        organizationId: v.string(),
        conversationId: v.optional(v.id("conversations")),
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
    }).index("by_organizationId", ["organizationId"]),
    conversations: defineTable({
        status: v.union(
            v.literal("unresolved"),
            v.literal("resolved"),
            v.literal("escalated"),
        ),
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
        organizationId: v.optional(v.string()),
    }).index("by_contactSessionId", ["contactSessionId"])
        .index("by_status", ["status"])
        .index("by_contactSessionId_and_threadId", ["contactSessionId", "threadId"])
        .index("by_organizationId_and_status", ["organizationId", "status"]),
    files: defineTable({
        name: v.string(),
        type: v.string(),
        size: v.number(),
        storageId: v.id("_storage"),
        category: v.string(),
        organizationId: v.optional(v.string()),
    }).index("by_organizationId", ["organizationId"]),
    widgetSettings: defineTable({
        organizationId: v.optional(v.string()),
        greetMessage: v.string(),
        defaultSuggestions: v.object({
            suggestion1: v.optional(v.string()),
            suggestion2: v.optional(v.string()),
            suggestion3: v.optional(v.string()),
        }),
        vapiSettings: v.object({
            assistantId: v.optional(v.string()),
            phoneNumber: v.optional(v.string()),
        }),
    }).index("by_organizationId", ["organizationId"]),
    plugins: defineTable({
        service: v.string(),
        organizationId: v.string(),
        enabled: v.boolean(),
        config: v.optional(v.any()),
    }).index("by_service_and_organizationId", ["service", "organizationId"]),
    secrets: defineTable({
        service: v.string(),
        organizationId: v.optional(v.string()),
        value: v.any(),
    }).index("by_service_and_organizationId", ["service", "organizationId"]),
    rateLimits: defineTable({
        key: v.string(),
        window: v.number(),
        count: v.number(),
        expiresAt: v.number(),
    }).index("by_key_and_window", ["key", "window"]),
    csrfTokens: defineTable({
        token: v.string(),
        organizationId: v.string(),
        expiresAt: v.number(),
    }).index("by_token", ["token"]),
    subscriptions: defineTable({
        organizationId: v.string(),
        plan: v.union(
            v.literal("free"),
            v.literal("pro"),
            v.literal("enterprise"),
        ),
        status: v.union(
            v.literal("active"),
            v.literal("canceled"),
            v.literal("past_due"),
            v.literal("trialing"),
        ),
        stripeSubscriptionId: v.optional(v.string()),
        currentPeriodEnd: v.optional(v.number()),
        updatedAt: v.number(),
    }).index("by_organizationId", ["organizationId"]),
});

export default schema;
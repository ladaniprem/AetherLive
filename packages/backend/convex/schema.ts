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
    }),
    conversations: defineTable({
        status: v.union(
            v.literal("unresolved"),
            v.literal("resolved"),
            v.literal("escalated"),
        ),
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
    }),
    files: defineTable({
        name: v.string(),
        type: v.string(),
        size: v.number(),
        storageId: v.id("_storage"),
        category: v.string(),
        organizationId: v.string(),
    }),
    widgetSettings: defineTable({
        organizationId: v.string(),
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
    }),
    plugins: defineTable({
        service: v.string(),
        organizationId: v.string(),
        enabled: v.boolean(),
        config: v.optional(v.any()),
    }),
    secrets: defineTable({
        service: v.string(),
        organizationId: v.string(),
        value: v.any(),
    }),
});

export default schema;
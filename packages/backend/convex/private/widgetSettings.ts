import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "../lib/auth";
import { requireFeature } from "../lib/subscription";

export const getOne = query({
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

        await requireFeature(ctx, organizationId, "widgetCustomization");

        return await ctx.db
            .query("widgetSettings")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
            .first();
    },
});

export const upsert = mutation({
    args: {
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
        themeColor: v.optional(v.string()),
        chatBackground: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);
        if (!organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "widgetCustomization");

        const existing = await ctx.db
            .query("widgetSettings")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
            .first();

        if (existing) {
            await ctx.db.patch("widgetSettings", existing._id, {
                greetMessage: args.greetMessage,
                defaultSuggestions: args.defaultSuggestions,
                vapiSettings: args.vapiSettings,
                themeColor: args.themeColor,
                chatBackground: args.chatBackground,
            });
        } else {
            await ctx.db.insert("widgetSettings", {
                organizationId,
                greetMessage: args.greetMessage,
                defaultSuggestions: args.defaultSuggestions,
                vapiSettings: args.vapiSettings,
                themeColor: args.themeColor,
                chatBackground: args.chatBackground,
            } as any);
        }
    },
});

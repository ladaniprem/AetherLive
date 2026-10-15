import { query } from "../_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "../lib/auth";
import {
    SUBSCRIPTION_PLANS,
    getOrgPlan as resolveOrgPlan,
    getPlanFeatures,
    type Plan,
} from "../lib/subscription";

export const getOrgPlan = query({
    args: {
        organizationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // The Clerk org claim is authoritative; the arg is only a fallback for
        // tokens that carry no org claim. A free plan with no subscription
        // row is the default for every new org.
        const orgId = getOrganizationId(identity) ?? args.organizationId;

        if (!orgId) {
            return {
                plan: "free" as Plan,
                status: "active" as const,
                currentPeriodEnd: null,
                ...SUBSCRIPTION_PLANS["free"],
                features: [],
            };
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
            .first();

        const plan = await resolveOrgPlan(ctx, orgId);
        const planConfig = SUBSCRIPTION_PLANS[plan];

        return {
            plan,
            status: subscription?.status ?? ("active" as const),
            currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
            ...planConfig,
            // Features already account for lapsed status via resolveOrgPlan.
            features: getPlanFeatures(plan),
        };
    },
});

export const getFeatures = query({
    args: {
        organizationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const orgId = getOrganizationId(identity) ?? args.organizationId;
        if (!orgId) {
            return { plan: "free" as Plan, status: "active" as const, isActive: false, features: [] as string[] };
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", orgId))
            .first();

        const plan = await resolveOrgPlan(ctx, orgId);
        const status = subscription?.status ?? ("active" as const);

        return {
            plan,
            status,
            isActive: status === "active" || status === "trialing",
            features: getPlanFeatures(plan),
        };
    },
});

// Monthly conversation usage for the org — backs the usage meter in
// Plans & Billing. Metered, NOT blocking: an entitled org's visitors are
// never refused mid-chat (blocking a paying customer's customer is the worst
// failure mode). Hard caps need a product decision on over-quota UX first.
export const getMonthlyUsage = query({
    args: {
        organizationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const orgId = getOrganizationId(identity) ?? args.organizationId;
        if (!orgId) {
            return {
                plan: "free" as Plan,
                used: 0,
                limit: SUBSCRIPTION_PLANS["free"].maxConversationsPerMonth as number,
            };
        }

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        const rows = await ctx.db
            .query("conversations")
            .withIndex("by_organizationId_and_status", (q) => q.eq("organizationId", orgId))
            .collect();
        const used = rows.filter((r) => r._creationTime >= monthStart).length;

        const plan = await resolveOrgPlan(ctx, orgId);
        const maxConversations = SUBSCRIPTION_PLANS[plan].maxConversationsPerMonth;

        return {
            plan,
            used,
            // null = unlimited (Enterprise)
            limit: maxConversations === Infinity ? null : (maxConversations as number),
        };
    },
});

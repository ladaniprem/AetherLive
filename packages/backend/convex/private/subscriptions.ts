import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { SUBSCRIPTION_PLANS } from "../lib/subscription";
import type { Plan } from "../lib/subscription";

function resolveOrgId(identityOrgId: string | undefined, argsOrgId: string | undefined): string | undefined {
    return argsOrgId ?? identityOrgId;
}

export const getOrgPlan = query({
    args: {
        organizationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const orgId = resolveOrgId(identity?.orgId as string | undefined, args.organizationId);
        if (!orgId) {
            const freeConfig = SUBSCRIPTION_PLANS["free"];
            return {
                plan: "free",
                status: "active",
                currentPeriodEnd: null,
                ...freeConfig,
                features: [],
            };
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("organizationId"), orgId))
            .first();

        const plan: Plan = (subscription?.plan as Plan) ?? "free";
        const planConfig = SUBSCRIPTION_PLANS[plan];

        return {
            plan,
            status: subscription?.status ?? "active",
            currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
            ...planConfig,
            features: subscription?.status === "active" || subscription?.status === "trialing"
                ? planConfig.features
                : [],
        };
    },
});

export const setPlan = mutation({
    args: {
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
        organizationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const identityOrgId = identity?.orgId as string | undefined;
        const organizationId = args.organizationId ?? identityOrgId;

        if (!organizationId) {
            const authState = identity ? "authenticated" : "not authenticated";
            throw new Error(
                `Organization ID is required (auth: ${authState}, hasIdentityOrg: ${!!identityOrgId})`
            );
        }

        const existing = await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("organizationId"), organizationId))
            .first();

        const data = {
            organizationId,
            plan: args.plan,
            status: args.status,
            stripeSubscriptionId: args.stripeSubscriptionId,
            currentPeriodEnd: args.currentPeriodEnd,
            updatedAt: Date.now(),
        };

        if (existing) {
            await ctx.db.replace("subscriptions", existing._id, data);
        } else {
            await ctx.db.insert("subscriptions", data);
        }
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

        const orgId = resolveOrgId(identity?.orgId as string | undefined, args.organizationId);
        if (!orgId) {
            return { plan: "free", status: "active", isActive: false, features: [] };
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("organizationId"), orgId))
            .first();

        const plan: Plan = (subscription?.plan as Plan) ?? "free";
        const isActive = subscription?.status === "active" || subscription?.status === "trialing";

        return {
            plan,
            status: subscription?.status ?? "active",
            isActive,
            features: isActive ? SUBSCRIPTION_PLANS[plan].features : [],
        };
    },
});

import { action, internalMutation, query } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { getOrganizationId } from "../lib/auth";

// Plans are created once in Razorpay Dashboard (no-code):
//   Pro INR: Rs 499/mo  -> RAZORPAY_PRO_INR_PLAN_ID (plan_xxx)
//   Pro USD: $20/mo     -> RAZORPAY_PRO_USD_PLAN_ID (plan_yyy)
// Frontend passes currency: "INR" | "USD", backend picks the plan id.

function razorpayAuth(): string {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        throw new Error(
            "Razorpay not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in Convex dashboard env vars.",
        );
    }
    return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

// Bridges the Razorpay key_id (public-safe; the secret stays server-side) to
// the dashboard so checkout.js can open. Also tells the UI whether live
// billing is fully configured, instead of failing mid-click.
export const getCheckoutConfig = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const keyId = process.env.RAZORPAY_KEY_ID ?? null;
        return {
            configured: Boolean(
                keyId &&
                process.env.RAZORPAY_KEY_SECRET &&
                process.env.RAZORPAY_PRO_INR_PLAN_ID &&
                process.env.RAZORPAY_PRO_USD_PLAN_ID,
            ),
            keyId,
            plans: {
                INR: Boolean(process.env.RAZORPAY_PRO_INR_PLAN_ID),
                USD: Boolean(process.env.RAZORPAY_PRO_USD_PLAN_ID),
            },
        };
    },
});

export const createSubscription = action({
    args: {
        currency: v.optional(v.union(v.literal("INR"), v.literal("USD"))),
    },
    handler: async (ctx, args): Promise<{ subscriptionId: string; keyId: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const organizationId = getOrganizationId(identity);
        if (!organizationId) throw new Error("Select an organization first");

        const currency = args.currency ?? "INR";
        const planId =
            currency === "USD"
                ? process.env.RAZORPAY_PRO_USD_PLAN_ID
                : process.env.RAZORPAY_PRO_INR_PLAN_ID;
        if (!planId) {
            throw new Error(
                `Razorpay ${currency} plan not configured. Create a plan in Razorpay Dashboard and set RAZORPAY_PRO_${currency}_PLAN_ID.`,
            );
        }

        const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
            method: "POST",
            headers: {
                Authorization: razorpayAuth(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                plan_id: planId,
                customer_notify: 1,
                total_count: 12,
                notes: { organizationId, plan: "pro", currency },
            }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Razorpay error: ${res.status} ${text}`);
        }
        const sub = (await res.json()) as { id: string };

        await ctx.runMutation(internal.private.razorpay.savePending, {
            organizationId,
            razorpaySubscriptionId: sub.id,
            razorpayPlanId: planId,
            currency,
        });

        return { subscriptionId: sub.id, keyId: process.env.RAZORPAY_KEY_ID! };
    },
});

export const savePending = internalMutation({
    args: {
        organizationId: v.string(),
        razorpaySubscriptionId: v.string(),
        razorpayPlanId: v.string(),
        currency: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
            .first();
        const data = {
            organizationId: args.organizationId,
            plan: "free" as const,
            status: "active" as const,
            razorpaySubscriptionId: args.razorpaySubscriptionId,
            razorpayPlanId: args.razorpayPlanId,
            currency: args.currency,
            updatedAt: Date.now(),
        };
        if (existing) await ctx.db.patch(existing._id, data);
        else await ctx.db.insert("subscriptions", data);
    },
});

export const activateFromWebhook = internalMutation({
    args: {
        organizationId: v.string(),
        razorpaySubscriptionId: v.optional(v.string()),
        razorpayCustomerId: v.optional(v.string()),
        currentPeriodEnd: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
            .first();
        const data = {
            organizationId: args.organizationId,
            plan: "pro" as const,
            status: "active" as const,
            razorpaySubscriptionId: args.razorpaySubscriptionId,
            razorpayCustomerId: args.razorpayCustomerId,
            currentPeriodEnd: args.currentPeriodEnd,
            updatedAt: Date.now(),
        };
        if (existing) await ctx.db.patch(existing._id, data);
        else await ctx.db.insert("subscriptions", data);
    },
});

export const cancelFromWebhook = internalMutation({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
            .first();
        if (!existing) return;
        await ctx.db.patch(existing._id, {
            plan: "free",
            status: "canceled",
            updatedAt: Date.now(),
        });
    },
});

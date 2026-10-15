import { query } from "../_generated/server";
import { v } from "convex/values";
import { checkRateLimitQuery } from "../lib/rateLimit";
import { getOrgPlan, getPlanFeatures, hasFeature } from "../lib/subscription";

export const validate = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.organizationId) {
            return { valid: false, reason: "Missing organization ID" };
        }

        await checkRateLimitQuery(ctx, "organizationValidate", args.organizationId);

        return { valid: true };
    },
});

/**
 * Visitor-facing entitlement check. The widget calls this during boot to
 * decide whether to show the product or the upgrade screen. Safe to expose
 * unauthenticated: it reveals only the plan tier and the (public) feature
 * list, both of which are already on the marketing pricing page.
 */
export const getAccess = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.organizationId) {
            return { plan: "free" as const, canChat: false };
        }

        await checkRateLimitQuery(ctx, "organizationValidate", args.organizationId);

        const plan = await getOrgPlan(ctx, args.organizationId);

        return {
            plan,
            canChat: hasFeature(plan, "aiCustomerSupport"),
            features: getPlanFeatures(plan),
        };
    },
});

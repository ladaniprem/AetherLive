import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
    PlanRequiredError,
    getPlanFeatures,
    getOrgPlan,
    hasFeature,
} from "./lib/subscription";

/**
 * Actions have no `ctx.db`, so plan checks inside actions go through these
 * internal queries. `assertFeature` throws `PlanRequiredError`, which both the
 * widget and the dashboard match on to render the upgrade screen.
 */
export const getPlanState = internalQuery({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const plan = await getOrgPlan(ctx, args.organizationId);
        return { plan, features: getPlanFeatures(plan) };
    },
});

export const assertFeature = internalQuery({
    args: { organizationId: v.string(), feature: v.string() },
    handler: async (ctx, args) => {
        const plan = await getOrgPlan(ctx, args.organizationId);
        if (!hasFeature(plan, args.feature)) {
            throw new PlanRequiredError(args.feature);
        }
        return { plan };
    },
});

import { QueryCtx, MutationCtx } from "../_generated/server";

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export const SUBSCRIPTION_PLANS = {
    free: {
        name: "Starter",
        price: 0,
        maxAgents: 1,
        maxConversationsPerMonth: 100,
        features: [] as string[],
    },
    pro: {
        name: "Pro",
        price: 20,
        maxAgents: 15,
        maxConversationsPerMonth: 10000,
        features: [
            "aiCustomerSupport",
            "aiVoiceAgent",
            "phoneSystem",
            "knowledgeBase",
            "teamAccess",
            "widgetCustomization",
            "integrations",
        ] as string[],
    },
    enterprise: {
        name: "Enterprise",
        price: -1,
        maxAgents: Infinity,
        maxConversationsPerMonth: Infinity,
        features: [
            "aiCustomerSupport",
            "aiVoiceAgent",
            "phoneSystem",
            "knowledgeBase",
            "teamAccess",
            "widgetCustomization",
            "integrations",
            "sso",
            "auditLogs",
            "dedicatedAccountManager",
        ] as string[],
    },
} as const;

export type Plan = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Every gated capability. `free` has none of them, so a free org is a
 * full paywall: nothing works until the org is on Pro.
 */
export const FEATURE_KEYS = [
    "aiCustomerSupport",
    "aiVoiceAgent",
    "phoneSystem",
    "knowledgeBase",
    "teamAccess",
    "widgetCustomization",
    "integrations",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const PLAN_HIERARCHY: Plan[] = ["free", "pro", "enterprise"];

/**
 * Thrown by every gated backend function. The `PLAN_REQUIRED:` prefix is a
 * contract — the widget matches on it to render the upgrade screen instead of
 * a generic error, so never reword the prefix.
 */
export const PLAN_REQUIRED_PREFIX = "PLAN_REQUIRED";

export class PlanRequiredError extends Error {
    readonly feature: string;

    constructor(feature: string, message?: string) {
        super(`${PLAN_REQUIRED_PREFIX}: ${message ?? `${feature} requires a Pro subscription`}`);
        this.name = "PlanRequiredError";
        this.feature = feature;
    }
}

export function isPlanRequiredError(error: unknown): boolean {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "";
    return message.includes(PLAN_REQUIRED_PREFIX);
}

type SubscriptionRow = {
    plan: Plan;
    status: SubscriptionStatus;
} | null;

export async function getOrgSubscription(
    ctx: QueryCtx | MutationCtx,
    organizationId: string | undefined,
): Promise<SubscriptionRow> {
    if (!organizationId) return null;

    const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
        .first();

    return subscription as SubscriptionRow;
}

/**
 * A plan only grants features while the subscription is in good standing.
 * `canceled` / `past_due` fall back to free — a lapsed Pro org must not keep
 * Pro entitlements forever just because the `plan` column still says "pro".
 */
export function isSubscriptionActive(status: SubscriptionStatus | undefined): boolean {
    return status === "active" || status === "trialing";
}

export function resolvePlan(subscription: SubscriptionRow): Plan {
    if (!subscription) return "free";
    if (!isSubscriptionActive(subscription.status)) return "free";
    return subscription.plan;
}

export function hasFeature(plan: Plan, feature: string): boolean {
    return (SUBSCRIPTION_PLANS[plan].features as readonly string[]).includes(feature);
}

export function planSatisfies(plan: Plan, requiredPlan: Plan): boolean {
    return PLAN_HIERARCHY.indexOf(plan) >= PLAN_HIERARCHY.indexOf(requiredPlan);
}

export function getPlanFeatures(plan: Plan): string[] {
    return [...SUBSCRIPTION_PLANS[plan].features];
}

export async function getOrgPlan(
    ctx: QueryCtx | MutationCtx,
    organizationId: string | undefined,
): Promise<Plan> {
    return resolvePlan(await getOrgSubscription(ctx, organizationId));
}

export async function requirePlan(
    ctx: QueryCtx | MutationCtx,
    organizationId: string | undefined,
    requiredPlan: Plan,
    errorMessage?: string,
) {
    if (!organizationId) {
        throw new PlanRequiredError(
            requiredPlan,
            errorMessage ?? `This feature requires a ${SUBSCRIPTION_PLANS[requiredPlan].name} subscription`,
        );
    }

    const subscription = await getOrgSubscription(ctx, organizationId);
    const currentPlan = resolvePlan(subscription);

    if (!planSatisfies(currentPlan, requiredPlan)) {
        throw new PlanRequiredError(
            requiredPlan,
            errorMessage ?? `This feature requires a ${SUBSCRIPTION_PLANS[requiredPlan].name} subscription`,
        );
    }

    return subscription;
}

export async function requireFeature(
    ctx: QueryCtx | MutationCtx,
    organizationId: string | undefined,
    feature: string,
    errorMessage?: string,
) {
    if (!organizationId) {
        throw new PlanRequiredError(feature, errorMessage);
    }

    const subscription = await getOrgSubscription(ctx, organizationId);
    const currentPlan = resolvePlan(subscription);

    if (!hasFeature(currentPlan, feature)) {
        throw new PlanRequiredError(
            feature,
            errorMessage ?? `This feature requires a Pro subscription`,
        );
    }

    return subscription;
}

/**
 * Query/mutation-side check for org-scoped features. Returns the plan so
 * callers can branch (e.g. list reads can degrade to empty instead of
 * throwing, which would break the whole page render).
 */
export async function canUseFeature(
    ctx: QueryCtx | MutationCtx,
    organizationId: string | undefined,
    feature: string,
): Promise<boolean> {
    if (!organizationId) return false;
    const plan = await getOrgPlan(ctx, organizationId);
    return hasFeature(plan, feature);
}

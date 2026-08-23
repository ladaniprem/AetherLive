import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Starter",
    price: 0,
    maxAgents: 1,
    maxConversationsPerMonth: 100,
    features: [],
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
    ],
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
    ],
  },
} as const;

export type Plan = keyof typeof SUBSCRIPTION_PLANS;

export async function getOrgSubscription(ctx: QueryCtx | MutationCtx, organizationId: string) {
  const subscription = await ctx.db
    .query("subscriptions")
    .filter((q) => q.eq(q.field("organizationId"), organizationId))
    .first();

  return subscription;
}

export function hasFeature(plan: Plan, feature: string): boolean {
  return (SUBSCRIPTION_PLANS[plan].features as readonly string[]).includes(feature);
}

export async function requirePlan(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  requiredPlan: Plan,
  errorMessage?: string,
) {
  const subscription = await getOrgSubscription(ctx, organizationId);
  const currentPlan = subscription?.plan ?? "free";

  const planHierarchy: Plan[] = ["free", "pro", "enterprise"];
  const currentIndex = planHierarchy.indexOf(currentPlan);
  const requiredIndex = planHierarchy.indexOf(requiredPlan);

  if (currentIndex < requiredIndex) {
    throw new Error(errorMessage ?? `This feature requires a ${SUBSCRIPTION_PLANS[requiredPlan].name} subscription`);
  }

  return subscription;
}

export async function requireFeature(
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  feature: string,
  errorMessage?: string,
) {
  const subscription = await getOrgSubscription(ctx, organizationId);
  const currentPlan: Plan = (subscription?.plan as Plan) ?? "free";

  if (!hasFeature(currentPlan, feature)) {
    throw new Error(errorMessage ?? `This feature requires a Pro subscription`);
  }

  return subscription;
}

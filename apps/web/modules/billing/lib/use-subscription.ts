"use client";

import { useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";

export type Plan = "free" | "pro" | "enterprise";

export interface SubscriptionInfo {
  plan: Plan;
  status: string;
  name: string;
  price: number;
  maxAgents: number;
  maxConversationsPerMonth: number;
  features: string[];
  isActive: boolean;
  currentPeriodEnd: number | null;
}

/**
 * `undefined` means "not loaded yet" — callers MUST distinguish that from
 * "loaded and not entitled", otherwise every guarded page flashes the paywall
 * on first paint while the plan query is still in flight.
 */
export function useSubscription(): SubscriptionInfo | undefined {
  const { organization } = useOrganization();

  // Clerk's active org resolves asynchronously. Querying before it does would
  // return a default "free" and flash the paywall at paying customers.
  const data = useQuery(
    api.private.subscriptions.getOrgPlan,
    organization?.id ? { organizationId: organization.id } : "skip",
  );

  if (!data) return undefined;

  return {
    plan: data.plan,
    status: data.status,
    name: data.name,
    price: data.price,
    maxAgents: data.maxAgents,
    maxConversationsPerMonth: data.maxConversationsPerMonth,
    features: data.features,
    isActive: data.status === "active" || data.status === "trialing",
    currentPeriodEnd: data.currentPeriodEnd,
  };
}

/**
 * `null` = still loading, `true`/`false` = known. The paywall renders only
 * on an explicit `false`.
 */
export function useFeature(feature: string): boolean | null {
  const subscription = useSubscription();
  if (!subscription) return null;
  return subscription.features.includes(feature);
}

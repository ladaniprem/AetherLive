// @ts-nocheck
"use client";

import { useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";

export type Plan = "free" | "pro" | "enterprise";

interface SubscriptionInfo {
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

export function useSubscription(): SubscriptionInfo | undefined {
  const { organization } = useOrganization();

  const data = useQuery(
    api.private.subscriptions.getOrgPlan,
    { organizationId: organization?.id },
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

export function useFeature(feature: string): boolean {
  const subscription = useSubscription();
  if (!subscription) return false;
  return subscription.features.includes(feature);
}

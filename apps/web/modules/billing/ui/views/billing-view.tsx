"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { PricingTable } from "../components/pricing-table";
import { useSubscription } from "../../lib/use-subscription";
import { Badge } from "@workspace/ui/components/badge";

export const BillingView = () => {
  const subscription = useSubscription();
  const { organization } = useOrganization();
  const usage = useQuery(api.private.subscriptions.getMonthlyUsage, {
    organizationId: organization?.id,
  });

  return (
    <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className="mx-auto w-full max-w-screen-md">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-4xl">Plans & Billing</h1>
            {subscription && (
              <Badge variant={subscription.isActive ? "default" : "secondary"}>
                {subscription.name}
              </Badge>
            )}
          </div>
          <p>
            Choose the plan that&apos;s right for you
          </p>

          {subscription && (
            <div className="mt-4 rounded-lg border bg-background p-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="font-semibold">{subscription.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{subscription.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Agents</p>
                  <p className="font-semibold">
                    {subscription.maxAgents === Infinity ? "Unlimited" : subscription.maxAgents}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Conversations</p>
                  <p className="font-semibold">
                    {subscription.maxConversationsPerMonth === Infinity
                      ? "Unlimited"
                      : subscription.maxConversationsPerMonth.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {subscription?.plan === "free" && (
            <p className="mt-3 text-muted-foreground text-sm">
              The free plan is a preview — AI replies, voice, knowledge base,
              customization and integrations are all Pro-only. Upgrade below to
              switch the product on.
            </p>
          )}

          {subscription && subscription.plan !== "free" && !subscription.isActive && (
            <p className="mt-3 text-muted-foreground text-sm">
              Your subscription is {subscription.status}. Pro features are
              paused until it is active again.
            </p>
          )}
        </div>

        {usage && (
          <div className="mt-4 rounded-lg border bg-background p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">Conversations this month</p>
              <p className="text-sm font-semibold">
                {usage.used.toLocaleString()}
                {usage.limit !== null && (
                  <span className="font-normal text-muted-foreground">
                    {" "}/ {usage.limit.toLocaleString()} included
                  </span>
                )}
                {usage.limit === null && (
                  <span className="font-normal text-muted-foreground"> · Unlimited</span>
                )}
              </p>
            </div>
            {usage.limit !== null && (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}

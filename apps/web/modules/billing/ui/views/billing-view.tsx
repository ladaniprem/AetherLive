"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { api } from "@workspace/backend/_generated/api";
import { PricingTable } from "../components/pricing-table";
import { useSubscription } from "../../lib/use-subscription";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";

export const BillingView = () => {
  const subscription = useSubscription();
  const { organization } = useOrganization();
  const setPlan = useMutation(api.private.subscriptions.setPlan);
  const searchParams = useSearchParams();

  const orgId = organization?.id;
  const synced = searchParams.get("synced") === "true";

  useEffect(() => {
    if (synced && orgId && subscription?.plan === "free") {
      setPlan({ plan: "pro", status: "active", organizationId: orgId })
        .then(() => toast.success("Subscription synced! All features unlocked."))
        .catch(() => {});
    }
  }, [synced, orgId, subscription?.plan]);

  const handleActivatePro = async () => {
    if (!orgId) { toast.error("No organization found"); return; }
    try {
      await setPlan({ plan: "pro", status: "active", organizationId: orgId });
      toast.success("Pro plan activated! All features unlocked.");
    } catch {
      toast.error("Failed to activate Pro plan");
    }
  };

  const handleResetFree = async () => {
    if (!orgId) { toast.error("No organization found"); return; }
    try {
      await setPlan({ plan: "free", status: "active", organizationId: orgId });
      toast.success("Reset to Free plan");
    } catch {
      toast.error("Failed to reset plan");
    }
  };

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

          {subscription && subscription.plan !== "free" && (
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

          <div className="flex gap-2 pt-2">
            <Button variant="default" size="sm" onClick={handleActivatePro}>
              Activate Pro (Demo)
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetFree}>
              Reset to Free
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}

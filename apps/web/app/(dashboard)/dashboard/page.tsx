"use client";

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { GemIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/modules/billing/lib/use-subscription";

export default function DashboardHome() {
  const subscription = useSubscription();
  const usage = useQuery(api.private.subscriptions.getMonthlyUsage, {});

  if (!subscription) {
    return (
      <div className="flex min-h-svh flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const isPro = subscription.plan !== "free";
  const used = usage?.used ?? 0;
  const limit = usage?.limit ?? null;
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {isPro
            ? "Your workspace is live. Conversations, voice and integrations are all enabled."
            : "You're on the free plan. Upgrade to Pro to switch on the whole product."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Current plan</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs">
              {isPro ? <GemIcon className="size-3" /> : <LockIcon className="size-3" />}
              {subscription.name}
            </span>
          </div>
          <p className="mt-2 font-semibold text-xl">
            {subscription.maxConversationsPerMonth === Infinity
              ? "Unlimited"
              : subscription.maxConversationsPerMonth.toLocaleString()}{" "}
            <span className="font-normal text-muted-foreground text-sm">
              conversations / month
            </span>
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Usage this month</p>
          <p className="mt-2 font-semibold text-xl">
            {used.toLocaleString()}
            <span className="font-normal text-muted-foreground text-sm">
              {limit === null ? " used" : ` / ${limit.toLocaleString()}`}
            </span>
          </p>
          {limit !== null && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {!isPro && (
        <div className="rounded-xl border border-dashed p-6">
          <h2 className="font-medium">What Pro unlocks</h2>
          <ul className="text-muted-foreground mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <li>AI replies in the chat widget, 24/7</li>
            <li>AI voice agent and phone number</li>
            <li>Knowledge base uploads</li>
            <li>Widget customization and branding</li>
            <li>Team access and shared inbox</li>
            <li>Vapi and other integrations</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Button asChild>
              <Link href="/billing">Upgrade to Pro</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/docs">Read the docs</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

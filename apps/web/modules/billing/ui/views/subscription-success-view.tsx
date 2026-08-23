"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import { Loader2Icon } from "lucide-react";

const SubscriptionSuccessInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { organization } = useOrganization();
  const setPlan = useMutation(api.private.subscriptions.setPlan);
  const [status, setStatus] = useState<"syncing" | "success" | "error">("syncing");

  useEffect(() => {
    const orgId = organization?.id;

    if (!orgId) {
      setStatus("error");
      return;
    }

    setPlan({
      plan: "pro",
      status: "active",
      organizationId: orgId,
    })
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/billing?synced=true"), 2000);
      })
      .catch(() => {
        setStatus("error");
      });
  }, [organization?.id]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        {status === "syncing" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Setting up your subscription...</p>
          </div>
        )}
        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl text-green-600">✓</span>
            </div>
            <h1 className="text-2xl font-bold">Pro Active!</h1>
            <p className="text-muted-foreground">All features are now unlocked.</p>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Still working...</h1>
            <p className="text-muted-foreground">
              Click the button below to activate your Pro plan.
            </p>
            <button
              className="text-primary underline"
              onClick={() => router.push("/billing")}
            >
              Go to Billing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SubscriptionSuccessView = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SubscriptionSuccessInner />
    </Suspense>
  );
};

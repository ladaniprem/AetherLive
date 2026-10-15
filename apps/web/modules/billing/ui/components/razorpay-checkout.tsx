"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { useSubscription } from "../../lib/use-subscription";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export const RazorpayCheckout = () => {
  const subscription = useSubscription();
  const config = useQuery(api.private.razorpay.getCheckoutConfig);
  const createSubscription = useAction(api.private.razorpay.createSubscription);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [loading, setLoading] = useState(false);

  const price = currency === "INR" ? "₹499" : "$20";

  const handleBuyPro = async () => {
    setLoading(true);
    try {
      await loadRazorpay();
      const { subscriptionId, keyId } = await createSubscription({ currency });
      const rzp = new window.Razorpay({
        key: keyId ?? config?.keyId,
        subscription_id: subscriptionId,
        name: "AetherLive",
        description: `Pro plan (${currency})`,
        theme: { color: "#3b82f6" },
        handler: () => {
          toast.success("Payment started! Pro activates automatically in a few seconds.");
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
      setLoading(false);
    }
  };

  if (subscription?.plan === "pro" && subscription.isActive) {
    return (
      <div className="rounded-lg border bg-background p-4 text-center text-sm">
        You are on <strong>Pro ({subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "active"})</strong>.
        Manage or cancel from your Razorpay dashboard email receipt.
      </div>
    );
  }

  if (config && !config.configured) {
    return (
      <div className="rounded-lg border border-dashed bg-background p-4 text-center text-sm text-muted-foreground">
        Live payments are not configured yet. Set <code>RAZORPAY_KEY_ID</code>,{" "}
        <code>RAZORPAY_KEY_SECRET</code>, <code>RAZORPAY_PRO_INR_PLAN_ID</code> and{" "}
        <code>RAZORPAY_PRO_USD_PLAN_ID</code> in the Convex deployment environment.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex rounded-full border p-1 text-sm">
        {(["INR", "USD"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
              currency === c ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {c === "INR" ? "₹ INR" : "$ USD"}
          </button>
        ))}
      </div>
      <div className="rounded-xl border bg-background p-6 text-center shadow-sm">
        <p className="text-lg font-semibold">Pro</p>
        <p className="mt-1 text-4xl font-bold">
          {price}
          <span className="ml-1 text-sm font-normal text-muted-foreground">/month</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          15 AI agents · 10,000 conversations/mo · AI replies + voice agent ·
          knowledge base · widget themes · team access
        </p>
        <Button onClick={handleBuyPro} disabled={loading} className="mt-4 w-full" size="lg">
          {loading ? "Opening Razorpay…" : `Buy Pro with Razorpay (${currency})`}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          {currency === "INR"
            ? "UPI Autopay · Credit/Debit Cards · Netbanking (e-mandate)"
            : "International cards · Visa · Mastercard · Amex"}
        </p>
      </div>
    </div>
  );
};

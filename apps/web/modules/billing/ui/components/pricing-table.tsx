"use client";

import { RazorpayCheckout } from "./razorpay-checkout";

// Razorpay replaces Clerk Billing (Clerk charges per-seat + Stripe-only).
// Plans live in Razorpay Dashboard; webhook at /api/razorpay-webhook
// auto-upgrades the org to Pro in Convex.
export const PricingTable = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <RazorpayCheckout />
    </div>
  );
};

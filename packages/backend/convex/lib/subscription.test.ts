import { describe, it, expect } from "vitest";
import {
  FEATURE_KEYS,
  PLAN_HIERARCHY,
  PlanRequiredError,
  SUBSCRIPTION_PLANS,
  getPlanFeatures,
  hasFeature,
  isPlanRequiredError,
  isSubscriptionActive,
  planSatisfies,
  resolvePlan,
} from "./subscription";

describe("resolvePlan", () => {
  it("defaults to free when there is no subscription row", () => {
    expect(resolvePlan(null)).toBe("free");
  });

  it("grants the plan while active or trialing", () => {
    expect(resolvePlan({ plan: "pro", status: "active" })).toBe("pro");
    expect(resolvePlan({ plan: "pro", status: "trialing" })).toBe("pro");
    expect(resolvePlan({ plan: "enterprise", status: "active" })).toBe("enterprise");
  });

  // A lapsed subscription must not keep Pro entitlements forever just because
  // the `plan` column still says "pro".
  it("downgrades to free when the subscription is canceled or past due", () => {
    expect(resolvePlan({ plan: "pro", status: "canceled" })).toBe("free");
    expect(resolvePlan({ plan: "pro", status: "past_due" })).toBe("free");
    expect(resolvePlan({ plan: "enterprise", status: "past_due" })).toBe("free");
  });
});

describe("isSubscriptionActive", () => {
  it("treats only active and trialing as good standing", () => {
    expect(isSubscriptionActive("active")).toBe(true);
    expect(isSubscriptionActive("trialing")).toBe(true);
    expect(isSubscriptionActive("canceled")).toBe(false);
    expect(isSubscriptionActive("past_due")).toBe(false);
    expect(isSubscriptionActive(undefined)).toBe(false);
  });
});

describe("SUBSCRIPTION_PLANS", () => {
  it("gives the free plan no features at all — a full paywall", () => {
    expect(SUBSCRIPTION_PLANS.free.features).toEqual([]);
    for (const feature of FEATURE_KEYS) {
      expect(hasFeature("free", feature)).toBe(false);
    }
  });

  it("gives Pro every gated feature", () => {
    for (const feature of FEATURE_KEYS) {
      expect(hasFeature("pro", feature)).toBe(true);
    }
  });

  it("keeps Enterprise a superset of Pro", () => {
    for (const feature of SUBSCRIPTION_PLANS.pro.features) {
      expect(hasFeature("enterprise", feature)).toBe(true);
    }
  });

  it("only caps conversation counts on the paid tiers", () => {
    expect(SUBSCRIPTION_PLANS.pro.maxConversationsPerMonth).toBeGreaterThan(
      SUBSCRIPTION_PLANS.free.maxConversationsPerMonth,
    );
    expect(SUBSCRIPTION_PLANS.enterprise.maxConversationsPerMonth).toBe(Infinity);
  });
});

describe("planSatisfies", () => {
  it("orders free < pro < enterprise", () => {
    expect(planSatisfies("pro", "free")).toBe(true);
    expect(planSatisfies("enterprise", "pro")).toBe(true);
    expect(planSatisfies("pro", "enterprise")).toBe(false);
    expect(planSatisfies("free", "pro")).toBe(false);
    expect(PLAN_HIERARCHY).toEqual(["free", "pro", "enterprise"]);
  });
});

describe("getPlanFeatures", () => {
  it("returns a copy so callers cannot mutate the plan table", () => {
    const features = getPlanFeatures("pro");
    features.push("mutated");
    expect(getPlanFeatures("pro")).not.toContain("mutated");
  });
});

describe("PlanRequiredError", () => {
  it("always carries the PLAN_REQUIRED prefix the clients match on", () => {
    const error = new PlanRequiredError("aiCustomerSupport");
    expect(error.message.startsWith("PLAN_REQUIRED")).toBe(true);
    expect(error.feature).toBe("aiCustomerSupport");
    expect(isPlanRequiredError(error)).toBe(true);
  });

  it("uses a custom message when provided", () => {
    const error = new PlanRequiredError("knowledgeBase", "Custom copy");
    expect(error.message).toBe("PLAN_REQUIRED: Custom copy");
  });

  it("detects the prefix on plain strings and unrelated errors", () => {
    expect(isPlanRequiredError("PLAN_REQUIRED: nope")).toBe(true);
    expect(isPlanRequiredError(new Error("Something else"))).toBe(false);
    expect(isPlanRequiredError(null)).toBe(false);
    expect(isPlanRequiredError(undefined)).toBe(false);
  });
});

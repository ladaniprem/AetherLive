"use client";

import { useFeature } from "../../lib/use-subscription";
import { PremiumFeatureOverlay } from "./premium-feature-overlay";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature: string;
}

export const SubscriptionGuard = ({ children, feature }: SubscriptionGuardProps) => {
  return (
    <PremiumFeatureOverlay feature={feature}>
      {children}
    </PremiumFeatureOverlay>
  );
};

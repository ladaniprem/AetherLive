"use client";

import { useEffect, useState } from "react";
import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";

export const PricingTable = () => {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <ClerkPricingTable
        for="organization"
        redirectURL={`${origin}/billing/success`}
        appearance={{
          elements: {
            pricingTableCard: "shadow-none! border! rounded-lg!",
            pricingTableCardHeader: "bg-background!",
            pricingTableCardBody: "bg-background!",
            pricingTableCardFooter: "bg-background!",
          }
        }}
      />
    </div>
  )
};

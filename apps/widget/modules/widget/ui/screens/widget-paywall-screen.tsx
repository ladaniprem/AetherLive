"use client";

import { LockIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import { canChatAtom, widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

/**
 * Shown instead of the product when the org's plan has no `aiCustomerSupport`
 * entitlement. Visitors never see a broken chat or a raw error — this is the
 * whole free-plan experience.
 */
export const WidgetPaywallScreen = () => {
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const canChat = useAtomValue(canChatAtom);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">
            {widgetSettings?.greetMessage || "Hi there!"}
          </p>
          <p className="text-lg">
            Let&apos;s get you started
          </p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-center text-muted-foreground">
        <div className="flex size-12 items-center justify-center rounded-full border bg-background">
          <LockIcon className="size-5" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Live chat is unavailable right now
        </p>
        <p className="max-w-xs text-sm">
          {canChat === false
            ? "This team is on the free plan. Upgrade to Pro to turn on AI replies, voice, and the knowledge base."
            : "Please try again in a moment, or leave your message and we'll follow up by email."}
        </p>
      </div>
    </>
  );
};

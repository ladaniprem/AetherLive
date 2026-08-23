"use client";

import {
  type LucideIcon,
  BookOpenIcon,
  BotIcon,
  CheckCircle2Icon,
  GemIcon,
  Loader2Icon,
  MicIcon,
  PaletteIcon,
  PhoneIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";
import { useMutation } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useFeature } from "../../lib/use-subscription";
import { useState } from "react";

interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
  featureKey: string;
};

interface PremiumFeatureOverlayProps {
  children: React.ReactNode;
  feature: string;
};

const features: Feature[] = [
  {
    icon: BotIcon,
    label: "AI Customer Support",
    description: "Intelligent automated responses 24/7",
    featureKey: "aiCustomerSupport",
  },
  {
    icon: MicIcon,
    label: "AI Voice Agent",
    description: "Natural voice conversations with customers",
    featureKey: "aiVoiceAgent",
  },
  {
    icon: PhoneIcon,
    label: "Phone System",
    description: "Inbound & outbound calling capabilities",
    featureKey: "phoneSystem",
  },
  {
    icon: BookOpenIcon,
    label: "Knowledge Base",
    description: "Train AI on your documentation",
    featureKey: "knowledgeBase",
  },
  {
    icon: UsersIcon,
    label: "Team Access",
    description: "Up to 5 operators per organization",
    featureKey: "teamAccess",
  },
  {
    icon: PaletteIcon,
    label: "Widget Customization",
    description: "Customize your chat widget appearance",
    featureKey: "widgetCustomization",
  },
];

export const PremiumFeatureOverlay = ({
  children,
  feature,
}: PremiumFeatureOverlayProps) => {
  const hasFeature = useFeature(feature);
  const { organization } = useOrganization();
  const setPlan = useMutation(api.private.subscriptions.setPlan);
  const [activating, setActivating] = useState(false);
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");

  if (hasFeature) {
    return <>{children}</>;
  }

  const handleActivate = async () => {
    const orgId = organization?.id;
    if (!orgId) {
      setResult("error");
      console.error("No organization ID available from Clerk");
      return;
    }
    setActivating(true);
    setResult("idle");
    try {
      await setPlan({ plan: "pro", status: "active", organizationId: orgId });
      setResult("success");
    } catch (err) {
      console.error("Activate Pro failed:", err);
      setResult("error");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-muted">
      <div className="pointer-events-none select-none blur-[2px]">
        {children}
      </div>

      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                <GemIcon className="size-6 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl">Premium Feature</CardTitle>
            <CardDescription>
              This feature requires a Pro subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg border bg-muted">
                    <f.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{f.label}</p>
                    <p className="text-muted-foreground text-xs">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {result === "success" && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <CheckCircle2Icon className="size-4" />
                Pro activated! Refreshing...
              </div>
            )}
            {result === "error" && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-500">
                <XCircleIcon className="size-4" />
                Failed to activate. Check console or try again.
              </div>
            )}

            <Button
              className="w-full"
              disabled={activating}
              onClick={handleActivate}
              size="lg"
            >
              {activating ? <Loader2Icon className="size-4 animate-spin" /> : "Activate Pro"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already subscribed through Clerk? Click the button above to sync your plan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

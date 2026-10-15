"use client";

import {
  type LucideIcon,
  BookOpenIcon,
  BotIcon,
  GemIcon,
  MessageSquareTextIcon,
  MicIcon,
  PaletteIcon,
  PhoneIcon,
  PlugIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { LoaderIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useFeature } from "../../lib/use-subscription";

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
    icon: MessageSquareTextIcon,
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
    description: "Shared inbox for your whole team",
    featureKey: "teamAccess",
  },
  {
    icon: PaletteIcon,
    label: "Widget Customization",
    description: "Customize your chat widget appearance",
    featureKey: "widgetCustomization",
  },
  {
    icon: PlugIcon,
    label: "Integrations",
    description: "Connect Vapi and your existing stack",
    featureKey: "integrations",
  },
];

export const PremiumFeatureOverlay = ({
  children,
  feature,
}: PremiumFeatureOverlayProps) => {
  const hasFeature = useFeature(feature);

  // Still resolving the plan. Rendering the paywall here would flash it on
  // every page load for paying customers.
  if (hasFeature === null) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hasFeature) {
    return <>{children}</>;
  }

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
            <CardTitle className="text-xl">Upgrade to Pro</CardTitle>
            <CardDescription>
              Everything in AetherLive — AI replies, voice, knowledge base and
              integrations — is a Pro feature. The free plan is a preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg border bg-muted">
                    <f.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{f.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link href="/billing">Upgrade to Pro</Link>
            </Button>

            <Button className="w-full" size="lg" variant="ghost" asChild>
              <Link href="/docs">Read the docs</Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Secure recurring payment via Razorpay — UPI Autopay, cards, netbanking (e-mandate) & international cards.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { features as PRO_FEATURES };

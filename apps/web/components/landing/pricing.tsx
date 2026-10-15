"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import Link from "next/link"

type Currency = "INR" | "USD"

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: { INR: "Free", USD: "Free" } as Record<Currency, string>,
    description: "Try the dashboard and embed the widget on your site",
    popular: false,
    features: [
      "1 AI agent",
      "100 conversations/month",
      "Embeddable chat widget",
      "Conversation inbox",
    ],
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: { INR: "₹499", USD: "$20" } as Record<Currency, string>,
    description:
      "For teams supporting real customers — UPI Autopay & cards in India, international cards worldwide",
    popular: true,
    features: [
      "Up to 15 AI agents",
      "10,000 conversations/month",
      "AI auto-replies, 24/7",
      "Voice agent + phone system",
      "Knowledge base (train on your docs)",
      "Widget themes & customization",
      "Website integrations (HTML, React, Next.js)",
      "Team access",
    ],
    cta: "Get Started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { INR: "Custom", USD: "Custom" } as Record<Currency, string>,
    description: "For organizations that need full control",
    popular: false,
    features: [
      "Unlimited AI agents",
      "Unlimited conversations",
      "Everything in Pro",
      "SSO",
      "Audit logs",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
  },
]

export function Pricing() {
  const [currency, setCurrency] = useState<Currency>("INR")

  return (
    <section id="pricing" className="py-6 md:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 md:px-8">
        <h2 className="pt-4 text-center text-2xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground md:text-base lg:text-lg">
          Choose a plan that works best for you and your team. No hidden fees.
        </p>
        <div className="mt-6 flex justify-center">
          <div className="flex rounded-full border p-1 text-sm">
            {(["INR", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-full px-5 py-1.5 font-medium transition-colors ${
                  currency === c ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {c === "INR" ? "₹ INR" : "$ USD"}
              </button>
            ))}
          </div>
        </div>
        <div className="py-4 md:py-10">
          <div className="relative grid w-full grid-cols-1 gap-2 p-0 sm:gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl p-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  plan.popular
                    ? "bg-card border shadow-lg"
                    : "bg-transparent"
                }`}
              >
                {plan.popular && (
                  <div className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background absolute -top-3 left-4">
                    Popular
                  </div>
                )}
                <div className="flex h-full flex-col justify-start gap-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-medium text-card-foreground sm:text-lg">
                        {plan.name}
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="my-6">
                    <div className="flex items-end">
                      {plan.price[currency] === "Custom" || plan.price[currency] === "Free" ? (
                        <span className="text-3xl font-medium text-card-foreground md:text-4xl">
                          {plan.price[currency]}
                        </span>
                      ) : (
                        <>
                          <span className="text-3xl font-medium text-card-foreground md:text-4xl">
                            {plan.price[currency]}
                          </span>
                          <span className="mb-1 ml-1 text-sm text-muted-foreground">
                            /month
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link
                    href={plan.id === "enterprise" ? "#" : "/sign-up"}
                    className={`relative inline-flex cursor-pointer items-center justify-center rounded-md px-6 py-3 text-base font-medium transition-all duration-200 active:scale-[0.98] will-change-transform w-full ${
                      plan.popular
                        ? "bg-linear-to-b from-blue-500 to-blue-600 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_3px_5px_rgba(30,144,255,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]"
                        : "bg-card text-card-foreground ring-1 ring-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-accent hover:ring-border"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <div className="mt-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="my-5 flex items-start justify-start gap-2">
                        <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary">
                          <Check className="size-3 stroke-[4px] text-primary-foreground" />
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                          {feature}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    description: "Perfect for exploring AI agent capabilities",
    popular: false,
    features: [
      "1 AI agent",
      "100 conversations/month",
      "Basic analytics",
      "API Access",
    ],
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$20",
    description: "For teams automating complex workflows",
    popular: true,
    features: [
      "Up to 15 AI agents",
      "10,000 conversations/month",
      "Advanced analytics",
      "API Access",
      "Team Collaboration",
      "Custom integrations",
    ],
    cta: "Get Started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For organizations that need full autonomy",
    popular: false,
    features: [
      "Unlimited AI agents",
      "Unlimited conversations",
      "Dedicated Account Manager",
      "SSO & SAML",
      "Audit Logs",
      "Custom SLA",
    ],
    cta: "Contact Sales",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-6 md:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 md:px-8">
        <h2 className="pt-4 text-center text-2xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground md:text-base lg:text-lg">
          Choose a plan that works best for you and your team. No hidden fees.
        </p>
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
                      {plan.price === "Custom" ? (
                        <span className="text-3xl font-medium text-card-foreground md:text-4xl">
                          Custom
                        </span>
                      ) : (
                        <>
                          <span className="text-3xl font-medium text-card-foreground md:text-4xl">
                            {plan.price}
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

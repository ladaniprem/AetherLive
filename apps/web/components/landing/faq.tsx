"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

const faqs = [
  {
    category: "Product",
    questions: [
      {
        q: "What is AetherLive?",
        a: "AetherLive is an AI-powered customer support platform that lets you build, deploy, and orchestrate intelligent AI agents to automate customer conversations across your website, email, and messaging channels.",
      },
      {
        q: "How does the AI support agent work?",
        a: "When a customer sends a message, our AI agent instantly understands the query, searches your knowledge base for the best answer, and responds in real-time. If it can't resolve the issue, it escalates to your human team.",
      },
      {
        q: "Can I customize how the widget looks?",
        a: "Yes. You can fully customize the widget's colors, position, branding, and behavior to match your website's design — all from the dashboard without writing any code.",
      },
      {
        q: "What channels does AetherLive support?",
        a: "AetherLive works across website chat widget, email, Slack, and popular messaging platforms. All conversations are unified in a single inbox.",
      },
    ],
  },
  {
    category: "Setup & Integration",
    questions: [
      {
        q: "How do I add AetherLive to my website?",
        a: "Just add a single script tag to your site. You can also integrate via NPM package or connect directly to platforms like Shopify, WordPress, and Webflow.",
      },
      {
        q: "How long does it take to set up?",
        a: "Most users go live in under 10 minutes. Connect your knowledge base, customize the widget, and deploy — no coding required.",
      },
      {
        q: "Can I connect my existing knowledge base?",
        a: "Yes. AetherLive integrates with your docs, FAQs, help center articles, and internal wikis so the AI always gives accurate answers based on your content.",
      },
      {
        q: "Does it work with my existing tools?",
        a: "AetherLive integrates with Zendesk, Intercom, Salesforce, HubSpot, Slack, and 100+ other tools out of the box.",
      },
    ],
  },
  {
    category: "Security & Support",
    questions: [
      {
        q: "Is my customer data secure?",
        a: "Enterprise-grade security with end-to-end encryption, SOC2 Type II certification, and HIPAA compliance. Your data never leaves your control.",
      },
      {
        q: "What happens if the AI can't answer a question?",
        a: "The AI intelligently escalates to your human team with full conversation context, so your team can pick up right where the AI left off.",
      },
      {
        q: "Do you offer human support?",
        a: "Yes. All plans include email support. Pro and Enterprise plans include priority chat support, and Enterprise plans come with a dedicated account manager.",
      },
    ],
  },
]

export function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggle = (key: string) => {
    setOpenItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  return (
    <section id="faq" className="py-6 md:py-12">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-2xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base lg:text-lg">
            Everything you need to know about AetherLive.
          </p>
        </div>
        <div className="mt-12 space-y-10">
          {faqs.map((group) => (
            <div key={group.category}>
              <h3 className="mb-6 text-lg font-medium text-foreground">
                {group.category}
              </h3>
              <div className="flex flex-col gap-3">
                {group.questions.map((faq) => {
                  const key = `${group.category}-${faq.q}`
                  const isOpen = openItems.includes(key)
                  return (
                    <div
                      key={key}
                      className="relative rounded-xl border bg-card transition-all duration-200 hover:shadow-sm"
                    >
                      <button
                        className="flex w-full items-center justify-between px-4 py-4 text-left"
                        onClick={() => toggle(key)}
                      >
                        <span className="text-sm font-medium text-foreground md:text-base">
                          {faq.q}
                        </span>
                        <div className={`ml-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>
                          <Plus className="size-5 text-muted-foreground" />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

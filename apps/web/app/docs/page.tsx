import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Documentation — AetherLive",
  description:
    "How AetherLive works: embedding the chat widget, connecting the Vapi voice agent, and plans & billing.",
};

function Section({
  id,
  step,
  title,
  children,
}: {
  id: string;
  step?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <p className="text-sm font-medium text-primary">{step}</p>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-primary underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <p className="text-sm font-medium text-primary">Docs</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          How AetherLive works
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Embed a chat widget, answer from one inbox, and optionally talk to
          customers by voice. One organization = one subscription = one
          snippet.
        </p>

        <div className="mt-10 space-y-12">
          <Section id="embed" step="Step 1" title="Embed the chat widget">
            <p>
              Go to <DocLink href="/integrations" label="Setup & Integrations" />{" "}
              in your dashboard, pick your framework (HTML, React, Next.js, or
              plain JavaScript), and copy the snippet. It contains your
              organization ID — that ID decides which workspace receives the
              chats. Paste it just before the closing{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                {"</body>"}
              </code>{" "}
              tag of every page where the widget should appear:
            </p>
            <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-xs leading-6">
{`<!-- AetherLive Chat Widget -->
<script
  src="https://widget.aetherlive.live/embed/widget.js"
  data-organization-id="YOUR_ORGANIZATION_ID"
></script>`}
            </pre>
            <p>
              Optional: add{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                data-position=&quot;bottom-left&quot;
              </code>{" "}
              to move the launcher to the left corner. Each organization has
              its own snippet — if you run two brands, embed each
              site with its own org&apos;s snippet.
            </p>
          </Section>

          <Section id="inbox" step="Step 2" title="Answer from the inbox">
            <p>
              Visitor messages arrive in{" "}
              <DocLink href="/conversations" label="Conversations" /> in real
              time. The AI assistant drafts replies instantly from your
              conversation context; your team can step in at any point. Upload
              guides and FAQs under <DocLink href="/files" label="Files" /> so
              answers stay grounded in your own documentation, and match the
              widget to your brand under{" "}
              <DocLink href="/customization" label="Customization" /> (theme
              color + chat background).
            </p>
          </Section>

          <Section id="vapi" step="Step 3" title="Connect the voice agent (Vapi)">
            <p>
              Voice calls are powered by Vapi and work in both the widget and
              the dashboard conversation view, sharing one assistant:
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Create a free account at{" "}
                <DocLink href="https://vapi.ai" label="vapi.ai" /> and open
                Dashboard → API Keys.
              </li>
              <li>
                Copy your <strong className="text-foreground">public</strong>{" "}
                and <strong className="text-foreground">private</strong> API
                keys.
              </li>
              <li>
                In AetherLive go to{" "}
                <DocLink href="/plugins/vapi" label="Plugins → Vapi" /> and
                paste both keys, then Connect. Keys are stored per
                organization — every org connects its own Vapi account.
              </li>
              <li>
                A voice button now appears in the widget and in the
                conversation header. Call transcripts are saved back into the
                chat thread automatically.
              </li>
            </ol>
            <p>
              Two Vapi billing notes: voice calls consume your Vapi credits,
              and Vapi&apos;s <em>text-chat</em> API stays locked until a card
              is on file in your Vapi dashboard. Until then the widget answers
              with its built-in AI agent automatically — nothing breaks.
            </p>
          </Section>

          <Section id="billing" step="Step 4" title="Plans & billing (Razorpay)">
            <p>
              Subscriptions are <strong className="text-foreground">per organization</strong>,
              paid through Razorpay, and activate automatically a few seconds
              after payment via a verified webhook — there is nothing to paste
              or confirm manually:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Starter (Free)</strong> — 1
                AI agent, 100 included conversations/month, widget + inbox
                included.
              </li>
              <li>
                <strong className="text-foreground">Pro</strong> — ₹499/month
                billed in INR, or $20/month billed in USD. Up to 15 AI agents,
                10,000 included conversations/month, AI auto-replies, voice
                agent + phone system, knowledge base, widget themes,
                integrations, and team access. 10,000/month is roughly 330
                chats a day — comfortably within platform capacity; higher
                volumes run on Enterprise.
              </li>
            </ul>
            <p>
              Track included usage anytime in{" "}
              <DocLink href="/billing" label="Plans & Billing" /> — the meter
              shows conversations used this month against your plan quota.
            </p>
            <p>
              <strong className="text-foreground">India (₹ INR):</strong> UPI
              Autopay, credit/debit cards with standing instructions, or
              netbanking via e-mandate — these are the methods that support
              automatic monthly renewal.{" "}
              <strong className="text-foreground">Outside India ($ USD):</strong>{" "}
              international Visa, Mastercard, or Amex cards — no UPI needed.
              (Wallets, EMI, and Paylater don&apos;t support auto-renewal, so
              Razorpay doesn&apos;t offer them for subscriptions.)
            </p>
            <p>
              Manage or cancel anytime from the email receipt Razorpay sends
              you; access continues until the end of the paid period and the
              workspace then returns to the Free plan. Questions? See{" "}
              <DocLink href="/billing" label="Plans & Billing" /> in your
              dashboard.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

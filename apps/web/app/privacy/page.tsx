import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — AetherLive",
  description:
    "How AetherLive collects, uses, and protects your data across the dashboard, chat widget, and integrations.",
};

const UPDATED = "September 28, 2026";

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <p className="text-sm font-medium text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {UPDATED}
        </p>

        <div className="mt-10 space-y-10">
          <Section title="Overview">
            <p>
              AetherLive (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides an AI
              customer-support platform: a dashboard for support teams and an
              embeddable chat widget for their websites. This policy explains
              what data we collect, why, and the choices you have.
            </p>
          </Section>

          <Section title="Data we collect">
            <p>
              <strong className="text-foreground">Account data.</strong>{" "}
              Authentication is handled by Clerk. We receive your name, email
              address, and organization membership so you can sign in and manage
              your workspace.
            </p>
            <p>
              <strong className="text-foreground">Support conversations.</strong>{" "}
              Messages, contact details, and files shared in support chats are
              stored in our Convex database so your support team can respond and
              keep conversation history. Widget visitors are identified by an
              anonymous session until they share contact details.
            </p>
            <p>
              <strong className="text-foreground">Voice calls.</strong> If you
              enable voice support, call audio and transcripts are processed by
              Vapi, our voice-AI provider, and transcripts may be saved to the
              conversation thread.
            </p>
            <p>
              <strong className="text-foreground">Billing data.</strong>{" "}
              Subscriptions are processed by Razorpay. We store subscription
              status and plan details; full card numbers never touch our
              servers.
            </p>
            <p>
              <strong className="text-foreground">Diagnostics.</strong> Crash
              reports and performance data are collected via Sentry to keep the
              service reliable.
            </p>
          </Section>

          <Section title="How we use data">
            <p>
              We use collected data to operate the service (hosting chats,
              generating AI replies, routing conversations), to bill
              subscriptions, to provide support, and to improve reliability and
              quality. We do not sell personal data.
            </p>
          </Section>

          <Section id="cookies" title="Cookies">
            <p>
              We use strictly necessary cookies for sign-in sessions (Clerk),
              theme preferences, and security. We do not use third-party
              advertising cookies. The embedded chat widget runs inside an
              iframe on your website and stores a visitor session so
              conversations persist across page loads.
            </p>
          </Section>

          <Section title="Data sharing">
            <p>
              We share data only with the subprocessors needed to run the
              service: Clerk (identity), Convex (database/hosting), Vapi
              (voice AI), Razorpay (billing), and Sentry (error tracking). Each
              processes data under its own terms and only on our instructions.
            </p>
          </Section>

          <Section title="Retention & deletion">
            <p>
              Conversation data is retained while your workspace is active so
              support history stays available. You can delete individual
              conversations from the dashboard at any time. To delete your
              workspace and all associated data, contact us at the address
              below.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              Depending on your jurisdiction you may request access, correction,
              export, or deletion of your personal data. We respond to verified
              requests within 30 days.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy? Reach us via the dashboard support
              chat or email us at{" "}
              <Link
                href="mailto:privacy@aetherlive.live"
                className="text-primary underline-offset-4 hover:underline"
              >
                privacy@aetherlive.live
              </Link>
              .
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

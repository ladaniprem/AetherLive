import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

async function verifyRazorpaySignature(raw: string, signature: string, secret: string): Promise<boolean> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(raw));
    const expected = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return expected === signature;
}

const http = httpRouter();

http.route({
    path: "/api/razorpay-webhook",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) return new Response("webhook not configured", { status: 500 });

        const raw = await req.text();
        const signature = req.headers.get("x-razorpay-signature") ?? "";
        const valid = await verifyRazorpaySignature(raw, signature, secret);
        if (!valid) {
            return new Response("invalid signature", { status: 401 });
        }

        const event = JSON.parse(raw) as {
            event: string;
            payload: any;
        };

        const notes = event.payload?.subscription?.entity?.notes
            ?? event.payload?.payment?.entity?.notes;
        const organizationId: string | undefined = notes?.organizationId;
        if (!organizationId) return new Response(null, { status: 200 });

        if (
            event.event === "subscription.authenticated" ||
            event.event === "subscription.charged"
        ) {
            const entity = event.payload.subscription.entity;
            await ctx.runMutation("private/razorpay:activateFromWebhook" as any, {
                organizationId,
                razorpaySubscriptionId: entity.id,
                razorpayCustomerId: entity.customer_id,
                currentPeriodEnd: entity.current_end
                    ? entity.current_end * 1000
                    : undefined,
            });
        }

        if (
            event.event === "subscription.cancelled" ||
            event.event === "subscription.completed"
        ) {
            await ctx.runMutation("private/razorpay:cancelFromWebhook" as any, {
                organizationId,
            });
        }

        return new Response(null, { status: 200 });
    }),
});

export default http;

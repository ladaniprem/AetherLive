import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
    path: "/api/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        const body = await req.json();
        const { type, data } = body;

        if (type === "organization.subscription.created" || type === "organization.subscription.updated") {
            const { id, plan, status, organization_id, current_period_end } = data;

            await ctx.runMutation("private/subscriptions:setPlan" as any, {
                plan: plan ?? "pro",
                status: status ?? "active",
                stripeSubscriptionId: id,
                currentPeriodEnd: current_period_end ? current_period_end * 1000 : undefined,
                organizationId: organization_id,
            });
        }

        if (type === "organization.subscription.deleted" || type === "organization.subscription.canceled") {
            const { organization_id } = data;

            await ctx.runMutation("private/subscriptions:setPlan" as any, {
                plan: "free",
                status: "canceled",
                organizationId: organization_id,
            });
        }

        return new Response(null, { status: 200 });
    }),
});

export default http;

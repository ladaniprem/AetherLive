import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "../lib/auth";
import { canUseFeature, requireFeature } from "../lib/subscription";

export const upsert = mutation({
    args: {
        service: v.string(),
        value: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);
        if (!organizationId) {
            throw new Error("Missing organization");
        }

        await requireFeature(ctx, organizationId, "integrations");

        const existing = await ctx.db
            .query("secrets")
            .withIndex("by_service_and_organizationId", (q) =>
                q.eq("service", args.service).eq("organizationId", organizationId),
            )
            .first();

        if (existing) {
            await ctx.db.patch("secrets", existing._id, {
                value: args.value,
            });
        } else {
            await ctx.db.insert("secrets", {
                service: args.service,
                organizationId,
                value: args.value,
            });
        }
    },
});

/**
 * The widget needs the Vapi *public* key to place a voice call. On a free
 * org it returns null instead of throwing so the widget still boots — the
 * paywall screen (driven by `public.organizations.getAccess`) is what stops
 * the visitor, not a crashed loader.
 */
export const getVapiSecrets = query({
    args: {
        organizationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        if (!(await canUseFeature(ctx, organizationId, "aiVoiceAgent"))) {
            return null;
        }

        const secret = organizationId
            ? await ctx.db
                  .query("secrets")
                  .withIndex("by_service_and_organizationId", (q) =>
                      q.eq("service", "vapi").eq("organizationId", organizationId),
                  )
                  .first()
            : await ctx.db
                  .query("secrets")
                  .filter((q) =>
                      q.and(
                          q.eq(q.field("service"), "vapi"),
                          q.eq(q.field("organizationId"), undefined),
                      ),
                  )
                  .first();

        if (!secret) {
            return null;
        }

        const value = secret.value as { publicApiKey?: string };
        return value.publicApiKey ? { publicApiKey: value.publicApiKey } : null;
    },
});

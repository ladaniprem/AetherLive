import { query } from "../_generated/server";
import { v } from "convex/values";
import { canUseFeature } from "../lib/subscription";

/**
 * The widget reads this before the paywall check, so a free org must still
 * get its branding/greeting back rather than an error — the upgrade screen
 * needs the header to render.
 */
export const getByOrganizationId = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        const entitled = await canUseFeature(ctx, organizationId, "widgetCustomization");

        const settings = await ctx.db
            .query("widgetSettings")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
            .first();

        if (!settings) {
            return null;
        }

        if (entitled) {
            return settings;
        }

        // Free plan: greeting/branding only. Vapi wiring is a Pro capability
        // and must not be handed to an unentitled widget.
        return {
            ...settings,
            vapiSettings: { assistantId: undefined, phoneNumber: undefined },
        };
    },
});

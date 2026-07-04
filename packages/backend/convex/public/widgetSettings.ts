import { query } from "../_generated/server";
import { v } from "convex/values";

export const getByOrganizationId = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        const settings = await ctx.db
            .query("widgetSettings")
            .filter((q) => q.eq(q.field("organizationId"), organizationId))
            .first();

        return settings;
    },
});

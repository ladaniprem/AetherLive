import { query } from "../_generated/server";
import { v } from "convex/values";
import { checkRateLimitQuery } from "../lib/rateLimit";

export const validate = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.organizationId) {
            return { valid: false, reason: "Missing organization ID" };
        }

        await checkRateLimitQuery(ctx, "organizationValidate", args.organizationId);

        return { valid: true };
    },
});

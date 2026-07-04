import { action } from "../_generated/server";
import { v } from "convex/values";

export const validate = action({
    args: {
        organizationId: v.string(),
    },
    handler: async (_ctx, args) => {
        if (!args.organizationId) {
            return { valid: false, reason: "Missing organization ID" };
        }

        return { valid: true };
    },
});

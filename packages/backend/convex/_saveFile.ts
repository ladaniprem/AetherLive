import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveFile = mutation({
    args: {
        name: v.string(),
        type: v.string(),
        size: v.number(),
        storageId: v.id("_storage"),
        category: v.string(),
        organizationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("files", {
            name: args.name,
            type: args.type,
            size: args.size,
            storageId: args.storageId,
            category: args.category,
            ...(args.organizationId ? { organizationId: args.organizationId } : {}),
        });
    },
});

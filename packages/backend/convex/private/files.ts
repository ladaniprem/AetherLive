import { query, mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { Doc, Id } from "../_generated/dataModel";
import { getOrganizationId } from "../lib/auth";
import { requireFeature } from "../lib/subscription";

export type PublicFile = {
    id: Id<"files">;
    name: string;
    type: string;
    size: number;
    storageId: Id<"_storage">;
    category: string;
    organizationId?: string;
};

export const list = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);

        if (!organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "knowledgeBase");

        const result = await ctx.db
            .query("files")
            .filter((q) =>
                organizationId
                    ? q.eq(q.field("organizationId"), organizationId)
                    : q.eq(q.field("organizationId"), undefined),
            )
            .order("desc")
            .paginate(args.paginationOpts);

        return {
            ...result,
            page: result.page.map((doc) => ({
                id: doc._id,
                name: doc.name,
                type: doc.type,
                size: doc.size,
                storageId: doc.storageId,
                category: doc.category,
                organizationId: doc.organizationId,
            })),
        };
    },
});

export const addFile = action({
    args: {
        bytes: v.bytes(),
        filename: v.string(),
        mimeType: v.string(),
        category: v.string(),
    },
    handler: async (ctx, args) => {
        const { bytes, filename, mimeType, category } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);
        if (!organizationId) {
            throw new Error("Not authorized");
        }

        const { internal } = await import("../_generated/api");
        await ctx.runQuery(internal.entitlements.assertFeature, {
            organizationId,
            feature: "knowledgeBase",
        });

        const blob = new Blob([bytes], { type: mimeType });
        const storageId = await ctx.storage.store(blob);

        const fileId = await ctx.runMutation("_saveFile:saveFile" as any, {
            name: filename,
            type: mimeType,
            size: bytes.byteLength,
            storageId,
            category,
            organizationId,
        });

        return fileId;
    },
});

export const deleteFile = mutation({
    args: {
        entryId: v.id("files"),
    },
    handler: async (ctx, args) => {
        const { entryId } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);
        if (!organizationId) {
            throw new Error("Not authorized");
        }

        const file = await ctx.db.get("files", entryId);
        if (!file) {
            throw new Error("File not found");
        }

        if (file.organizationId !== organizationId) {
            throw new Error("Not authorized");
        }

        await requireFeature(ctx, organizationId, "knowledgeBase");

        await ctx.storage.delete(file.storageId);
        await ctx.db.delete("files", entryId);
    },
});

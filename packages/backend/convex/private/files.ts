import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { Doc, Id } from "../_generated/dataModel";

export type PublicFile = {
    id: Id<"files">;
    name: string;
    type: string;
    size: number;
    storageId: Id<"_storage">;
    category: string;
    organizationId: string;
};

export const list = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const result = await ctx.db
            .query("files")
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

export const addFile = mutation({
    args: {
        bytes: v.bytes(),
        filename: v.string(),
        mimeType: v.string(),
        category: v.string(),
    },
    handler: async (ctx, args) => {
        const { bytes, filename, mimeType, category } = args;

        const storageId = await ctx.storage.store(bytes);

        const fileId = await ctx.db.insert("files", {
            name: filename,
            type: mimeType,
            size: bytes.byteLength,
            storageId,
            category,
            organizationId: "",
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
        const file = await ctx.db.get("files", entryId);
        if (!file) {
            throw new Error("File not found");
        }

        await ctx.storage.delete(file.storageId);
        await ctx.db.delete("files", entryId);
    },
});

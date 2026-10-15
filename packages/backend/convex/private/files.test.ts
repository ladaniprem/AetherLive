import { describe, it, expect, vi, beforeEach } from "vitest";
import { withFreePlan, withLapsedPro, withSubscription } from "../../test-utils/subscription";

vi.mock("../_generated/server", () => ({
  query: (def: any) => def,
  mutation: (def: any) => def,
  action: (def: any) => def,
}));

vi.mock("convex/server", () => ({
  paginationOptsValidator: { kind: "pagination" },
}));

vi.mock("../_generated/api", () => ({
  components: { agent: {} },
  internal: {
    entitlements: {
      assertFeature: "entitlements:assertFeature",
      getPlanState: "entitlements:getPlanState",
    },
  },
}));

const MOCK_USER = { subject: "user-1", orgId: "org-123" };

function mockCtx(overrides: any = {}) {
  return {
    db: {
      query: vi.fn(),
      get: vi.fn(),
      insert: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      ...overrides.db,
    },
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue(MOCK_USER),
      ...overrides.auth,
    },
    storage: {
      store: vi.fn().mockResolvedValue("st-1"),
      delete: vi.fn(),
      ...overrides.storage,
    },
    runMutation: vi.fn().mockResolvedValue("file-id-1"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("files.list", () => {
  it("rejects unauthenticated requests", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { list } = await import("./files");
    await expect((list as any).handler(ctx, { paginationOpts: { numItems: 10, cursor: null } }))
      .rejects.toThrow("Not authenticated");
  });

  it("filters files by org ID", async () => {
    const mockEq = vi.fn(() => ({ eq: mockEq }));
    const mockFilter = vi.fn(() => ({ order: () => ({ paginate: vi.fn().mockResolvedValue({ page: [], isDone: true, continueCursor: null }) }) }));
    const ctx = withSubscription(mockCtx({ db: { query: vi.fn(() => ({ filter: mockFilter })) } }));

    const { list } = await import("./files");
    await (list as any).handler(ctx, { paginationOpts: { numItems: 10, cursor: null } });

    expect(mockFilter).toHaveBeenCalled();
  });

  it("returns only files belonging to the users org", async () => {
    const mockPaginate = vi.fn().mockResolvedValue({
      page: [{ _id: "f1", name: "my.pdf", organizationId: "org-123" }],
      isDone: true, continueCursor: null,
    });
    const mockEq = vi.fn(() => ({ eq: mockEq }));
    const ctx = withSubscription(mockCtx({
      db: {
        query: vi.fn(() => ({ filter: () => ({ order: () => ({ paginate: mockPaginate }) }) })),
      },
    }));

    const { list } = await import("./files");
    const result = await (list as any).handler(ctx, { paginationOpts: { numItems: 10, cursor: null } });
    expect(result.page).toHaveLength(1);
    expect(result.page[0].name).toBe("my.pdf");
  });

  it("throws PLAN_REQUIRED on the free plan", async () => {
    const ctx = withFreePlan(mockCtx());
    const { list } = await import("./files");
    await expect((list as any).handler(ctx, { paginationOpts: { numItems: 10, cursor: null } }))
      .rejects.toThrow(/PLAN_REQUIRED/);
  });

  it("throws PLAN_REQUIRED when a Pro subscription has lapsed", async () => {
    const ctx = withLapsedPro(mockCtx());
    const { list } = await import("./files");
    await expect((list as any).handler(ctx, { paginationOpts: { numItems: 10, cursor: null } }))
      .rejects.toThrow(/PLAN_REQUIRED/);
  });
});

describe("files.addFile", () => {
  it("rejects unauthenticated requests", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { addFile } = await import("./files");
    await expect((addFile as any).handler(ctx, { bytes: new ArrayBuffer(10), filename: "t.pdf", mimeType: "application/pdf", category: "docs" }))
      .rejects.toThrow("Not authenticated");
  });

  it("stores file and inserts db entry with org ID", async () => {
    const mockRunMutation = vi.fn().mockResolvedValue("file-id-1");
    const ctx = withSubscription(mockCtx({
      runMutation: mockRunMutation,
      runQuery: vi.fn().mockResolvedValue({ plan: "pro" }),
    }));

    const { addFile } = await import("./files");
    const result = await (addFile as any).handler(ctx, { bytes: new ArrayBuffer(10), filename: "doc.pdf", mimeType: "application/pdf", category: "support" });

    expect(result).toBe("file-id-1");
    expect(mockRunMutation).toHaveBeenCalledWith("_saveFile:saveFile", expect.objectContaining({
      organizationId: "org-123",
      name: "doc.pdf",
    }));
  });

  it("blocks the upload before touching storage on the free plan", async () => {
    const store = vi.fn().mockResolvedValue("st-1");
    const runQuery = vi.fn().mockRejectedValue(new Error("PLAN_REQUIRED: knowledgeBase requires a Pro subscription"));
    const ctx = withFreePlan(mockCtx({ storage: { store }, runQuery }));

    const { addFile } = await import("./files");
    await expect((addFile as any).handler(ctx, { bytes: new ArrayBuffer(10), filename: "doc.pdf", mimeType: "application/pdf", category: "support" }))
      .rejects.toThrow(/PLAN_REQUIRED/);
    expect(store).not.toHaveBeenCalled();
  });
});

describe("files.deleteFile", () => {
  const OWN_FILE = { _id: "f1", name: "test.pdf", storageId: "st-1", organizationId: "org-123" };
  const OTHER_FILE = { _id: "f2", name: "other.pdf", storageId: "st-2", organizationId: "org-999" };

  it("rejects unauthenticated requests", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { deleteFile } = await import("./files");
    await expect((deleteFile as any).handler(ctx, { entryId: "f1" }))
      .rejects.toThrow("Not authenticated");
  });

  it("allows deleting own org file", async () => {
    const ctx = withSubscription(mockCtx({ db: { get: vi.fn().mockResolvedValue(OWN_FILE), delete: vi.fn().mockResolvedValue(null) }, storage: { delete: vi.fn().mockResolvedValue(null) } }));
    const { deleteFile } = await import("./files");
    await expect((deleteFile as any).handler(ctx, { entryId: "f1" })).resolves.not.toThrow();
  });

  it("rejects deleting file from other org", async () => {
    const ctx = mockCtx({ db: { get: vi.fn().mockResolvedValue(OTHER_FILE) } });
    const { deleteFile } = await import("./files");
    await expect((deleteFile as any).handler(ctx, { entryId: "f2" })).rejects.toThrow("Not authorized");
  });

  it("rejects deleting nonexistent file", async () => {
    const ctx = mockCtx({ db: { get: vi.fn().mockResolvedValue(null) } });
    const { deleteFile } = await import("./files");
    await expect((deleteFile as any).handler(ctx, { entryId: "missing" })).rejects.toThrow("File not found");
  });

  it("deletes storage and db entry on success", async () => {
    const mockDelete = vi.fn();
    const mockStorageDelete = vi.fn();
    const ctx = withSubscription(mockCtx({
      db: { get: vi.fn().mockResolvedValue(OWN_FILE), delete: mockDelete },
      storage: { delete: mockStorageDelete },
    }));

    const { deleteFile } = await import("./files");
    await (deleteFile as any).handler(ctx, { entryId: "f1" });

    expect(mockStorageDelete).toHaveBeenCalledWith("st-1");
    expect(mockDelete).toHaveBeenCalledWith("files", "f1");
  });
});

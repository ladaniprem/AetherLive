import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../_generated/server", () => ({
  query: (def: any) => def,
  mutation: (def: any) => def,
}));

vi.mock("../_generated/api", () => ({
  components: { agent: {} },
}));

vi.mock("convex/server", () => ({
  paginationOptsValidator: { kind: "pagination" },
}));

vi.mock("@convex-dev/agent", () => ({
  listMessages: vi.fn().mockResolvedValue({ page: [], isDone: true, continueCursor: null }),
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
      ...(overrides.db || {}),
    },
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue(MOCK_USER),
      ...(overrides.auth || {}),
    },
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("conversations.getOne", () => {
  it("rejects unauthenticated", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { getOne } = await import("./conversations");
    await expect((getOne as any).handler(ctx, { conversationId: "c1" })).rejects.toThrow("Not authenticated");
  });

  it("returns conversation for own org", async () => {
    const cs = { _id: "cs-1", organizationId: "org-123" };
    const conv = { _id: "c1", contactSessionId: "cs-1", threadId: "t-1" };
    const ctx = mockCtx({ db: { get: vi.fn((_t: any, id: string) => id === "c1" ? conv : cs) } });

    const { getOne } = await import("./conversations");
    const result = await (getOne as any).handler(ctx, { conversationId: "c1" });
    expect(result).toEqual(conv);
  });

  it("returns null for other org conversation", async () => {
    const cs = { _id: "cs-1", organizationId: "org-999" };
    const conv = { _id: "c1", contactSessionId: "cs-1" };
    const ctx = mockCtx({ db: { get: vi.fn((_t: any, id: string) => id === "c1" ? conv : cs) } });

    const { getOne } = await import("./conversations");
    const result = await (getOne as any).handler(ctx, { conversationId: "c1" });
    expect(result).toBeNull();
  });

  it("returns null if conversation not found", async () => {
    const ctx = mockCtx({ db: { get: vi.fn().mockResolvedValue(null) } });
    const { getOne } = await import("./conversations");
    const result = await (getOne as any).handler(ctx, { conversationId: "c1" });
    expect(result).toBeNull();
  });

  it("returns null if contact session missing", async () => {
    const conv = { _id: "c1", contactSessionId: "cs-missing" };
    const ctx = mockCtx({ db: { get: vi.fn((_t: any, id: string) => id === "c1" ? conv : null) } });
    const { getOne } = await import("./conversations");
    const result = await (getOne as any).handler(ctx, { conversationId: "c1" });
    expect(result).toBeNull();
  });
});

describe("conversations.updateStatus", () => {
  it("rejects unauthenticated", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { updateStatus } = await import("./conversations");
    await expect((updateStatus as any).handler(ctx, { conversationId: "c1", status: "resolved" })).rejects.toThrow("Not authenticated");
  });

  it("allows status update for own org", async () => {
    const cs = { _id: "cs-1", organizationId: "org-123" };
    const conv = { _id: "c1", contactSessionId: "cs-1" };
    const ctx = mockCtx({ db: { get: vi.fn((_t: any, id: string) => id === "c1" ? conv : cs) } });
    const { updateStatus } = await import("./conversations");
    await expect((updateStatus as any).handler(ctx, { conversationId: "c1", status: "resolved" })).resolves.not.toThrow();
  });

  it("rejects status update for other org", async () => {
    const cs = { _id: "cs-1", organizationId: "org-999" };
    const conv = { _id: "c1", contactSessionId: "cs-1" };
    const ctx = mockCtx({ db: { get: vi.fn((_t: any, id: string) => id === "c1" ? conv : cs) } });
    const { updateStatus } = await import("./conversations");
    await expect((updateStatus as any).handler(ctx, { conversationId: "c1", status: "resolved" })).rejects.toThrow("Not authorized");
  });

  it("throws if conversation not found", async () => {
    const ctx = mockCtx({ db: { get: vi.fn().mockResolvedValue(null) } });
    const { updateStatus } = await import("./conversations");
    await expect((updateStatus as any).handler(ctx, { conversationId: "c1", status: "resolved" })).rejects.toThrow("Conversation not found");
  });
});

describe("conversations.getMany", () => {
  function makePaginateResult(items: any[]) {
    return { page: items, isDone: true, continueCursor: "c" };
  }

  it("rejects unauthenticated", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { getMany } = await import("./conversations");
    await expect((getMany as any).handler(ctx, { paginationOpts: { numItems: 10, cursor: null } })).rejects.toThrow("Not authenticated");
  });

  function makeQueryMock(convs: any[], mockGet: any) {
    const mockPaginate = vi.fn().mockResolvedValue(makePaginateResult(convs));
    const mockOrder = vi.fn(() => ({ paginate: mockPaginate }));
    const mockWithIndex = vi.fn(() => ({ order: () => ({ first: vi.fn().mockResolvedValue(null) }) }));

    return vi.fn((table: string) => {
      if (table === "messages") return { withIndex: mockWithIndex };
      if (table === "conversations") return { order: mockOrder, filter: () => ({ order: mockOrder }) };
      return {};
    });
  }

  it("filters to own org conversations", async () => {
    const myCs = { _id: "cs-1", organizationId: "org-123" };
    const otherCs = { _id: "cs-2", organizationId: "org-999" };
    const convs = [
      { _id: "c1", contactSessionId: "cs-1", threadId: "t-1", status: "unresolved" },
      { _id: "c2", contactSessionId: "cs-2", threadId: "t-2", status: "unresolved" },
    ];

    const mockGet = vi.fn((_t: any, id: string) => id === "cs-1" ? myCs : id === "cs-2" ? otherCs : null);
    const ctx = mockCtx({ db: { query: makeQueryMock(convs, mockGet), get: mockGet } });

    const { getMany } = await import("./conversations");
    const result = await (getMany as any).handler(ctx, { paginationOpts: { numItems: 10, cursor: null } });
    expect(result.page).toHaveLength(1);
    expect(result.page[0]._id).toBe("c1");
  });

  it("excludes conversations with missing contact session", async () => {
    const convs = [{ _id: "c1", contactSessionId: "cs-missing", threadId: "t-1" }];
    const mockGet = vi.fn().mockResolvedValue(null);
    const ctx = mockCtx({ db: { query: makeQueryMock(convs, mockGet), get: mockGet } });

    const { getMany } = await import("./conversations");
    const result = await (getMany as any).handler(ctx, { paginationOpts: { numItems: 10, cursor: null } });
    expect(result.page).toHaveLength(0);
  });
});

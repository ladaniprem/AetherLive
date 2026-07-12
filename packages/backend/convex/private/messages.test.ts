import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../_generated/server", () => ({
  query: (def: any) => def,
  mutation: (def: any) => def,
  action: (def: any) => def,
}));

vi.mock("../_generated/api", () => ({
  components: { agent: {} },
}));

vi.mock("convex/server", () => ({
  paginationOptsValidator: { kind: "pagination" },
}));

vi.mock("../lib/rateLimit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(undefined),
  checkRateLimitAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@convex-dev/agent", () => ({
  listMessages: vi.fn().mockResolvedValue({ page: [], isDone: true, continueCursor: null }),
  saveMessage: vi.fn().mockResolvedValue(undefined),
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
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("messages.getMany", () => {
  it("rejects unauthenticated", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { getMany } = await import("./messages");
    await expect((getMany as any).handler(ctx, { threadId: "t-1", paginationOpts: { numItems: 10, cursor: null } }))
      .rejects.toThrow("Not authenticated");
  });

  it("returns messages for authenticated user", async () => {
    const ctx = mockCtx();
    const { getMany } = await import("./messages");
    const result = await (getMany as any).handler(ctx, { threadId: "t-1", paginationOpts: { numItems: 10, cursor: null } });
    expect(result).toBeDefined();
  });
});

describe("messages.create", () => {
  const CONV = { _id: "c1", threadId: "t-1", contactSessionId: "cs-1" };
  const CS = { _id: "cs-1", organizationId: "org-123" };

  it("rejects unauthenticated", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { create } = await import("./messages");
    await expect((create as any).handler(ctx, { conversationId: "c1", prompt: "Hi" })).rejects.toThrow("Not authenticated");
  });

  it("throws if conversation not found", async () => {
    const ctx = mockCtx({ db: { get: vi.fn().mockResolvedValue(null) } });
    const { create } = await import("./messages");
    await expect((create as any).handler(ctx, { conversationId: "c1", prompt: "Hi" })).rejects.toThrow("Conversation not found");
  });

  it("rejects if contact session belongs to other org", async () => {
    const otherCs = { _id: "cs-1", organizationId: "org-999" };
    const ctx = mockCtx({ db: { get: vi.fn((_t: any, id: string) => id === "c1" ? CONV : otherCs) } });
    const { create } = await import("./messages");
    await expect((create as any).handler(ctx, { conversationId: "c1", prompt: "Hi" })).rejects.toThrow("Not authorized");
  });

  it("allows message creation for own org", async () => {
    const ctx = mockCtx({ db: { get: vi.fn((_t: any, id: string) => id === "c1" ? CONV : CS) } });
    const { create } = await import("./messages");
    await expect((create as any).handler(ctx, { conversationId: "c1", prompt: "Hi" })).resolves.not.toThrow();
  });
});

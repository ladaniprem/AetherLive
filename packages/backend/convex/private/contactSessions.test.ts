import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../_generated/server", () => ({
  query: (def: any) => def,
  mutation: (def: any) => def,
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
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("contactSessions.getOneByConversationId", () => {
  it("rejects unauthenticated", async () => {
    const ctx = mockCtx({ auth: { getUserIdentity: vi.fn().mockResolvedValue(null) } });
    const { getOneByConversationId } = await import("./contactSessions");
    await expect((getOneByConversationId as any).handler(ctx, { conversationId: "c1" })).rejects.toThrow("Not authenticated");
  });

  it("returns contact session for own org", async () => {
    const cs = { _id: "cs-1", organizationId: "org-123", name: "John" };
    const mockEq = vi.fn(() => ({ eq: mockEq }));
    const mockFirst = vi.fn().mockResolvedValue(cs);
    const ctx = mockCtx({ db: { query: vi.fn(() => ({ filter: () => ({ first: mockFirst }) })) } });

    const { getOneByConversationId } = await import("./contactSessions");
    const result = await (getOneByConversationId as any).handler(ctx, { conversationId: "c1" });
    expect(result).toEqual(cs);
  });

  it("returns null for other org contact session", async () => {
    const cs = { _id: "cs-1", organizationId: "org-999" };
    const mockEq = vi.fn(() => ({ eq: mockEq }));
    const mockFirst = vi.fn().mockResolvedValue(cs);
    const ctx = mockCtx({ db: { query: vi.fn(() => ({ filter: () => ({ first: mockFirst }) })) } });

    const { getOneByConversationId } = await import("./contactSessions");
    const result = await (getOneByConversationId as any).handler(ctx, { conversationId: "c1" });
    expect(result).toBeNull();
  });

  it("returns null if not found", async () => {
    const mockFirst = vi.fn().mockResolvedValue(null);
    const ctx = mockCtx({ db: { query: vi.fn(() => ({ filter: () => ({ first: mockFirst }) })) } });

    const { getOneByConversationId } = await import("./contactSessions");
    const result = await (getOneByConversationId as any).handler(ctx, { conversationId: "c1" });
    expect(result).toBeNull();
  });
});

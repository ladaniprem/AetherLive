import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkRateLimit, RATE_LIMITS } from "./rateLimit";

function createMockCtx(existingEntry: any = null) {
  const mockFirst = vi.fn();
  const mockEq = vi.fn(() => ({ eq: mockEq }));
  const mockWithIndex = vi.fn(() => ({ first: mockFirst }));
  const mockQuery = vi.fn(() => ({ withIndex: mockWithIndex }));
  const mockInsert = vi.fn();
  const mockPatch = vi.fn();

  mockFirst.mockResolvedValue(existingEntry);

  return {
    db: {
      query: mockQuery,
      insert: mockInsert,
      patch: mockPatch,
    },
    auth: { getUserIdentity: vi.fn() },
    storage: { store: vi.fn(), delete: vi.fn() },
    _mockFirst: mockFirst,
    _mockWithIndex: mockWithIndex,
    _mockEq: mockEq,
    _mockQuery: mockQuery,
    _mockInsert: mockInsert,
    _mockPatch: mockPatch,
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("checkRateLimit", () => {
  it("allows first request and inserts a new entry", async () => {
    const ctx = createMockCtx(null);
    await checkRateLimit(ctx as any, "contactSessionCreate", "org-123");

    expect(ctx._mockInsert).toHaveBeenCalledWith("rateLimits", {
      key: "contactSessionCreate:org-123",
      window: expect.any(Number),
      count: 1,
      expiresAt: expect.any(Number),
    });
  });

  it("increments count when under limit", async () => {
    const ctx = createMockCtx({ _id: "entry-1", count: 2 });
    await checkRateLimit(ctx as any, "contactSessionCreate", "org-123");

    expect(ctx._mockPatch).toHaveBeenCalledWith("entry-1", { count: 3 });
  });

  it("throws when exceeding max limit", async () => {
    const config = RATE_LIMITS.contactSessionCreate;
    const ctx = createMockCtx({ _id: "entry-1", count: config.max });

    await expect(
      checkRateLimit(ctx as any, "contactSessionCreate", "org-123"),
    ).rejects.toThrow("Too many requests");
  });

  it("rejects on the exact max+1 request", async () => {
    const ctx = createMockCtx({ _id: "entry-1", count: 5 });

    await expect(
      checkRateLimit(ctx as any, "contactSessionCreate", "org-123"),
    ).rejects.toThrow("Too many requests");
  });

  it("uses correct key format including identifier", async () => {
    const ctx = createMockCtx(null);
    await checkRateLimit(ctx as any, "enhanceResponse", "user-456");

    const insertCall = ctx._mockInsert.mock.calls[0][1];
    expect(insertCall.key).toBe("enhanceResponse:user-456");
  });

  it("uses deterministic window based on current time", async () => {
    const ctx = createMockCtx(null);
    const now = Date.now();
    const windowMs = RATE_LIMITS.contactSessionCreate.windowMs;
    const expectedWindow = Math.floor(now / windowMs);

    await checkRateLimit(ctx as any, "contactSessionCreate", "org-123");

    const insertCall = ctx._mockInsert.mock.calls[0][1];
    expect(insertCall.window).toBe(expectedWindow);
  });

  it("queries with correct index and key/window match", async () => {
    const ctx = createMockCtx(null);
    const now = Date.now();
    const windowMs = RATE_LIMITS.contactSessionCreate.windowMs;
    const expectedWindow = Math.floor(now / windowMs);

    await checkRateLimit(ctx as any, "contactSessionCreate", "org-123");

    expect(ctx._mockQuery).toHaveBeenCalledWith("rateLimits");
    expect(ctx._mockWithIndex).toHaveBeenCalledWith(
      "by_key_and_window",
      expect.any(Function),
    );
  });

  it("treats different rate limit keys independently", async () => {
    const ctx1 = createMockCtx({ _id: "entry-1", count: 5 });
    await expect(
      checkRateLimit(ctx1 as any, "contactSessionCreate", "org-123"),
    ).rejects.toThrow("Too many requests");

    const ctx2 = createMockCtx(null);
    await expect(
      checkRateLimit(ctx2 as any, "messageCreate", "org-123"),
    ).resolves.not.toThrow();
  });

  it("treats different identifiers independently", async () => {
    const ctx1 = createMockCtx({ _id: "entry-1", count: 5 });
    await expect(
      checkRateLimit(ctx1 as any, "contactSessionCreate", "org-A"),
    ).rejects.toThrow("Too many requests");

    const ctx2 = createMockCtx(null);
    await expect(
      checkRateLimit(ctx2 as any, "contactSessionCreate", "org-B"),
    ).resolves.not.toThrow();
  });

  it("sets expiresAt to end of current window", async () => {
    const ctx = createMockCtx(null);
    const windowMs = RATE_LIMITS.contactSessionCreate.windowMs;
    const now = Date.now();
    const window = Math.floor(now / windowMs);

    await checkRateLimit(ctx as any, "contactSessionCreate", "org-123");

    const insertCall = ctx._mockInsert.mock.calls[0][1];
    expect(insertCall.expiresAt).toBe((window + 1) * windowMs);
  });
});

describe("RATE_LIMITS configuration", () => {
  it("has all expected rate limit keys", () => {
    expect(RATE_LIMITS).toHaveProperty("contactSessionCreate");
    expect(RATE_LIMITS).toHaveProperty("publicMessageCreate");
    expect(RATE_LIMITS).toHaveProperty("messageCreate");
    expect(RATE_LIMITS).toHaveProperty("enhanceResponse");
  });

  it("has valid max values", () => {
    for (const config of Object.values(RATE_LIMITS)) {
      expect(config.max).toBeGreaterThan(0);
      expect(config.windowMs).toBeGreaterThan(0);
    }
  });

  it("has reasonable rate limits", () => {
    expect(RATE_LIMITS.contactSessionCreate.max).toBeLessThanOrEqual(10);
    expect(RATE_LIMITS.publicMessageCreate.max).toBeLessThanOrEqual(20);
    expect(RATE_LIMITS.messageCreate.max).toBeLessThanOrEqual(50);
    expect(RATE_LIMITS.enhanceResponse.max).toBeLessThanOrEqual(20);
  });
});

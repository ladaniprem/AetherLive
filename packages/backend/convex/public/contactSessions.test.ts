import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../_generated/server", () => ({
  query: (def: any) => def,
  mutation: (def: any) => def,
}));

vi.mock("../lib/rateLimit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../lib/csrf", () => ({
  validateCsrfToken: vi.fn().mockResolvedValue(undefined),
}));

function makeDb(overrides: Record<string, any> = {}) {
  const chain = { withIndex: vi.fn().mockReturnThis(), filter: vi.fn().mockReturnThis(), first: vi.fn().mockResolvedValue(null), collect: vi.fn().mockResolvedValue([]), order: vi.fn().mockReturnThis(), paginate: vi.fn() };
  return {
    query: vi.fn().mockReturnValue(chain),
    get: vi.fn(),
    insert: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

const SAMPLE_METADATA = {
  userAgent: "Mozilla/5.0",
  language: "en-US",
  languages: "en-US,en",
  platform: "Win32",
  vendor: "Google Inc.",
  screenResolution: "1920x1080",
  viewportSize: "1200x800",
  timezone: "America/New_York",
  timezoneOffset: -300,
  cookieEnabled: true,
  referrer: "https://example.com",
  currentUrl: "https://widget.example.com",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

const COMMON_ARGS = {
  name: "John", email: "john@test.com", organizationId: "org-123",
  csrfToken: "test-csrf-token", metadata: SAMPLE_METADATA,
};

describe("contactSessions.create", () => {
  it("creates a contact session successfully", async () => {
    const ctx = { db: makeDb({ insert: vi.fn().mockResolvedValue("cs-id-1") }), auth: { getUserIdentity: vi.fn() }, storage: { store: vi.fn(), delete: vi.fn() } };
    const { create } = await import("./contactSessions");
    const result = await (create as any).handler(ctx, COMMON_ARGS);
    expect(result).toBe("cs-id-1");
  });

  it("calls checkRateLimit with organizationId", async () => {
    const rateLimit = await import("../lib/rateLimit");
    const { create } = await import("./contactSessions");
    await (create as any).handler(
      { db: makeDb(), auth: { getUserIdentity: vi.fn() }, storage: { store: vi.fn(), delete: vi.fn() } } as any,
      COMMON_ARGS,
    );
    expect(rateLimit.checkRateLimit).toHaveBeenCalledWith(expect.anything(), "contactSessionCreate", "org-123");
  });

  it("calls validateCsrfToken", async () => {
    const csrf = await import("../lib/csrf");
    const { create } = await import("./contactSessions");
    await (create as any).handler(
      { db: makeDb(), auth: { getUserIdentity: vi.fn() }, storage: { store: vi.fn(), delete: vi.fn() } } as any,
      COMMON_ARGS,
    );
    expect(csrf.validateCsrfToken).toHaveBeenCalledWith(expect.anything(), "test-csrf-token", "org-123");
  });
});

describe("contactSessions.getOne", () => {
  it("returns session without PII fields", async () => {
    const session = { _id: "cs-1", _creationTime: 1000, name: "John", email: "john@test.com", organizationId: "org-1", conversationId: "conv-1", metadata: {} };
    const ctx = { db: makeDb({ get: vi.fn().mockResolvedValue(session) }), auth: { getUserIdentity: vi.fn() } };
    const { getOne } = await import("./contactSessions");
    const result = await (getOne as any).handler(ctx, { contactSessionId: "cs-1" });
    expect(result).toEqual({ _id: "cs-1", _creationTime: 1000, organizationId: "org-1", conversationId: "conv-1" });
  });

  it("returns null if not found", async () => {
    const ctx = { db: makeDb({ get: vi.fn().mockResolvedValue(null) }), auth: { getUserIdentity: vi.fn() } };
    const { getOne } = await import("./contactSessions");
    const result = await (getOne as any).handler(ctx, { contactSessionId: "cs-1" });
    expect(result).toBeNull();
  });
});

describe("contactSessions.validate", () => {
  it("returns valid true for existing session", async () => {
    const ctx = { db: makeDb({ get: vi.fn().mockResolvedValue({ _id: "cs-1" }) }), auth: { getUserIdentity: vi.fn() } };
    const { validate } = await import("./contactSessions");
    const result = await (validate as any).handler(ctx, { contactSessionId: "cs-1" });
    expect(result).toEqual({ valid: true });
  });

  it("returns valid false for missing session", async () => {
    const ctx = { db: makeDb({ get: vi.fn().mockResolvedValue(null) }), auth: { getUserIdentity: vi.fn() } };
    const { validate } = await import("./contactSessions");
    const result = await (validate as any).handler(ctx, { contactSessionId: "cs-1" });
    expect(result).toEqual({ valid: false });
  });
});

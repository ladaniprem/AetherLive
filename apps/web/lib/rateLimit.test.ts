import { describe, it, expect, vi, beforeEach } from "vitest";

const testModules = {
  rateLimit: {} as typeof import("./rateLimit"),
};

beforeEach(async () => {
  vi.resetModules();
  testModules.rateLimit = await import("./rateLimit");
});

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const { allowed, remaining } = testModules.rateLimit.checkRateLimit("sentryTunnel", "127.0.0.1");
    expect(allowed).toBe(true);
    expect(remaining).toBe(29);
  });

  it("decrements remaining on each request", () => {
    const rl = testModules.rateLimit.checkRateLimit;
    rl("sentryTunnel", "127.0.0.1");
    rl("sentryTunnel", "127.0.0.1");
    const result = rl("sentryTunnel", "127.0.0.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(27);
  });

  it("blocks when exceeding max limit", () => {
    const rl = testModules.rateLimit.checkRateLimit;
    for (let i = 0; i < 30; i++) {
      rl("sentryTunnel", "127.0.0.1");
    }
    const result = rl("sentryTunnel", "127.0.0.1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires via module reimport", async () => {
    const rl = testModules.rateLimit.checkRateLimit;
    for (let i = 0; i < 30; i++) {
      rl("sentryTunnel", "127.0.0.1");
    }

    let result = rl("sentryTunnel", "127.0.0.1");
    expect(result.allowed).toBe(false);

    vi.resetModules();
    const fresh = await import("./rateLimit");
    result = fresh.checkRateLimit("sentryTunnel", "127.0.0.1");
    expect(result.allowed).toBe(true);
  });

  it("treats different IPs independently", () => {
    const rl = testModules.rateLimit.checkRateLimit;
    for (let i = 0; i < 30; i++) {
      rl("sentryTunnel", "attacker");
    }

    expect(rl("sentryTunnel", "attacker").allowed).toBe(false);
    expect(rl("sentryTunnel", "legit-user").allowed).toBe(true);
  });

  it("treats different endpoints independently", () => {
    const rl = testModules.rateLimit.checkRateLimit;
    for (let i = 0; i < 30; i++) {
      rl("sentryTunnel", "127.0.0.1");
    }

    expect(rl("sentryTunnel", "127.0.0.1").allowed).toBe(false);
    expect(rl("health", "127.0.0.1").allowed).toBe(true);
  });

  it("returns resetIn as a positive number", () => {
    const result = testModules.rateLimit.checkRateLimit("sentryTunnel", "127.0.0.1");
    expect(result.resetIn).toBeGreaterThan(0);
    expect(result.resetIn).toBeLessThanOrEqual(60_000);
  });

  it("uses correct rate limits for health endpoint", () => {
    const rl = testModules.rateLimit.checkRateLimit;
    for (let i = 0; i < 60; i++) {
      rl("health", "127.0.0.1");
    }

    expect(rl("health", "127.0.0.1").allowed).toBe(false);
    expect(rl("health", "127.0.0.1").remaining).toBe(0);
  });
});

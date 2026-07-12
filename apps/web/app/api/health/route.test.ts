import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns status ok with 200", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("app", "AetherLive");
    expect(body).toHaveProperty("timestamp");
    expect(typeof body.timestamp).toBe("string");
  });
});

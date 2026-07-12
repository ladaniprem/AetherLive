import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/sentry-example-api", () => {
  it("throws an error", async () => {
    expect(() => GET()).toThrow("This error is raised on the backend called by the example page.");
  });

  it("throws SentryExampleAPIError", async () => {
    try {
      GET();
      // Should not reach here
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).name).toBe("SentryExampleAPIError");
      expect((e as Error).message).toBe(
        "This error is raised on the backend called by the example page.",
      );
    }
  });
});

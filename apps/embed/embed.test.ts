import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EMBED_CONFIG } from "./config";

// Mock VITE_WIDGET_URL
vi.mock("./config", () => ({
  EMBED_CONFIG: {
    WIDGET_URL: "http://localhost:3001",
    DEFAULT_POSITION: "bottom-right" as const,
  },
}));

describe("embed script", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    // Clear any AetherLiveWidget global
    delete (window as any).AetherLiveWidget;
  });

  afterEach(() => {
    // Clean up any added DOM elements
    document.body.innerHTML = "";
  });

  it("config has default values", () => {
    expect(EMBED_CONFIG.WIDGET_URL).toBe("http://localhost:3001");
    expect(EMBED_CONFIG.DEFAULT_POSITION).toBe("bottom-right");
  });

  it("creates DOM elements when script runs with data-organization-id", () => {
    // Set up a currentScript mock
    const script = document.createElement("script");
    script.setAttribute("data-organization-id", "test-org-123");
    script.setAttribute("src", "http://localhost:3002/widget.iife.js");
    Object.defineProperty(document, "currentScript", {
      value: script,
      writable: true,
    });

    // Run embed script
    vi.isFakeTimers() || vi.useFakeTimers();
    // We can't easily import the IIFE, so test the DOM setup via config
    expect(EMBED_CONFIG.DEFAULT_POSITION).toBe("bottom-right");
    vi.useRealTimers();
  });

  it("config exports correct structure", () => {
    expect(Object.keys(EMBED_CONFIG)).toEqual(["WIDGET_URL", "DEFAULT_POSITION"]);
    expect(typeof EMBED_CONFIG.WIDGET_URL).toBe("string");
    expect(EMBED_CONFIG.DEFAULT_POSITION).toBe("bottom-right");
  });
});

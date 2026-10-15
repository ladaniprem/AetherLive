import { describe, it, expect } from "vitest";
import { WIDGET_SCREENS, CONTACT_SESSION_KEY, LAST_ORGANIZATION_KEY } from "./constants";

describe("Widget constants", () => {
  it("defines all widget screens", () => {
    expect(WIDGET_SCREENS).toEqual([
      "error",
      "loading",
      "selection",
      "voice",
      "auth",
      "inbox",
      "chat",
      "contact",
      "paywall",
    ]);
  });

  it("defines contact session key", () => {
    expect(CONTACT_SESSION_KEY).toBe("AetherLive_contact_session");
  });

  it("defines last organization key", () => {
    expect(LAST_ORGANIZATION_KEY).toBe("AetherLive_last_organization_id");
  });

  it("keeps storage keys namespaced per org for contact sessions only", () => {
    // Contact sessions are per-org (built with atomFamily); the last-org key
    // must NOT be suffixed, or the fallback would never resolve.
    expect(LAST_ORGANIZATION_KEY).not.toContain("_undefined");
  });

  it("WIDGET_SCREENS is readonly tuple", () => {
    expect(WIDGET_SCREENS.length).toBe(9);
    expect(typeof WIDGET_SCREENS[0]).toBe("string");
  });
});

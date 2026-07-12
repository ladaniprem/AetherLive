import { describe, it, expect } from "vitest";
import { WIDGET_SCREENS, CONTACT_SESSION_KEY } from "./constants";

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
    ]);
  });

  it("defines contact session key", () => {
    expect(CONTACT_SESSION_KEY).toBe("AetherLive_contact_session");
  });

  it("WIDGET_SCREENS is readonly tuple", () => {
    expect(WIDGET_SCREENS.length).toBe(8);
    expect(typeof WIDGET_SCREENS[0]).toBe("string");
  });
});

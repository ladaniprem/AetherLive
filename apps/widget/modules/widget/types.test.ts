import { describe, it, expect } from "vitest";
import type { WidgetScreen } from "./types";
import { WIDGET_SCREENS } from "./constants";

describe("WidgetScreen type", () => {
  it("matches the constants array", () => {
    const screens: WidgetScreen[] = [...WIDGET_SCREENS];
    expect(screens.length).toBe(8);
  });

  it("only allows valid screen values", () => {
    const valid: WidgetScreen = "chat";
    const alsoValid: WidgetScreen = "loading";
    const alsoValid2: WidgetScreen = "error";
    expect(valid).toBe("chat");
    expect(alsoValid).toBe("loading");
    expect(alsoValid2).toBe("error");
  });
});

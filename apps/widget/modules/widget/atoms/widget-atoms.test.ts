import { describe, it, expect } from "vitest";
import { useAtomValue } from "jotai";
import {
  screenAtom,
  organizationIdAtom,
  errorMessageAtom,
  loadingMessageAtom,
  conversationIdAtom,
  widgetSettingsAtom,
  vapiSecretsAtom,
  hasVapiSecretsAtom,
} from "./widget-atoms";

describe("widget atoms", () => {
  it("screenAtom defaults to loading", () => {
    expect(screenAtom.init).toBe("loading");
  });

  it("organizationIdAtom defaults to null", () => {
    expect(organizationIdAtom.init).toBeNull();
  });

  it("errorMessageAtom defaults to null", () => {
    expect(errorMessageAtom.init).toBeNull();
  });

  it("loadingMessageAtom defaults to null", () => {
    expect(loadingMessageAtom.init).toBeNull();
  });

  it("conversationIdAtom defaults to null", () => {
    expect(conversationIdAtom.init).toBeNull();
  });

  it("widgetSettingsAtom defaults to null", () => {
    expect(widgetSettingsAtom.init).toBeNull();
  });

  it("vapiSecretsAtom defaults to null", () => {
    expect(vapiSecretsAtom.init).toBeNull();
  });

  it("hasVapiSecretsAtom is a derived atom", () => {
    // Derived atoms use `atom(get => ...)` and don't have a static .init value
    expect(hasVapiSecretsAtom).toBeDefined();
    expect(typeof hasVapiSecretsAtom).toBe("object");
    expect(hasVapiSecretsAtom).not.toBeNull();
  });
});

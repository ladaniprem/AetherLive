import { describe, it, expect } from "vitest";
import { chatBubbleIcon, closeIcon } from "./icons";

describe("embed icons", () => {
  it("chatBubbleIcon is a valid SVG", () => {
    expect(chatBubbleIcon).toContain("<svg");
    expect(chatBubbleIcon).toContain("</svg>");
    expect(chatBubbleIcon).toContain('viewBox="0 0 24 24"');
  });

  it("closeIcon is a valid SVG", () => {
    expect(closeIcon).toContain("<svg");
    expect(closeIcon).toContain("</svg>");
    expect(closeIcon).toContain('viewBox="0 0 24 24"');
  });

  it("chatBubbleIcon contains the chat path", () => {
    expect(chatBubbleIcon).toContain("path");
    expect(chatBubbleIcon).toContain("M21 15a2 2");
  });

  it("closeIcon contains X lines", () => {
    expect(closeIcon).toContain("x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"");
    expect(closeIcon).toContain("x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIMessage, AIMessageContent, AIMessageAvatar } from "./message";

describe("AIMessage", () => {
  it("renders user message with is-user class", () => {
    const { container } = render(
      <AIMessage from="user">
        <AIMessageContent>Hello</AIMessageContent>
      </AIMessage>,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain("is-user");
  });

  it("renders assistant message with is-assistant class", () => {
    const { container } = render(
      <AIMessage from="assistant">
        <AIMessageContent>Response</AIMessageContent>
      </AIMessage>,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain("is-assistant");
  });

  it("renders message content", () => {
    render(
      <AIMessage from="user">
        <AIMessageContent>Hello, world!</AIMessageContent>
      </AIMessage>,
    );
    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });

  it("renders AIMessageAvatar with fallback name initials", () => {
    render(<AIMessageAvatar src="https://example.com/avatar.png" name="JD" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders AIMessageAvatar fallback with full name initials", () => {
    render(
      <AIMessageAvatar src="https://example.com/avatar.png" name="John Doe" />,
    );
    expect(screen.getByText("Jo")).toBeInTheDocument();
  });

  it("AIMessageAvatar defaults to ME when no name", () => {
    render(<AIMessageAvatar src="https://example.com/avatar.png" />);
    expect(screen.getByText("ME")).toBeInTheDocument();
  });
});

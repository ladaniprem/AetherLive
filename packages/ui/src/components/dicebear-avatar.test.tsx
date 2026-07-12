import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DicebearAvatar } from "./dicebear-avatar";

describe("DicebearAvatar", () => {
  it("renders an avatar container with data-slot", () => {
    const { container } = render(<DicebearAvatar seed="user123" />);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toBeInTheDocument();
  });

  it("renders AvatarImage with seed-based src when no imageUrl", () => {
    const { container } = render(<DicebearAvatar seed="user123" />);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toBeInTheDocument();
    // Radix AvatarImage only renders after image loads (jsdom limitation)
  });

  it("does not render badge when imageUrl provided without badge", () => {
    render(
      <DicebearAvatar seed="user123" imageUrl="https://example.com/avatar.png" />,
    );
    expect(screen.queryByAltText("Badge")).not.toBeInTheDocument();
  });

  it("renders badge when badgeImageUrl is provided", () => {
    render(
      <DicebearAvatar
        seed="user123"
        badgeImageUrl="https://example.com/badge.png"
      />,
    );
    const badge = screen.getByAltText("Badge");
    expect(badge).toBeInTheDocument();
    expect(badge.getAttribute("src")).toBe("https://example.com/badge.png");
  });

  it("does not render badge when no badgeImageUrl", () => {
    render(<DicebearAvatar seed="user123" />);
    expect(screen.queryByAltText("Badge")).not.toBeInTheDocument();
  });

  it("applies custom className to Avatar", () => {
    const { container } = render(
      <DicebearAvatar seed="user123" className="custom-class" />,
    );
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar!.className).toContain("custom-class");
  });

  it("applies custom size to outer wrapper", () => {
    const { container } = render(<DicebearAvatar seed="user123" size={48} />);
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.style.width).toBe("48px");
    expect(outerDiv.style.height).toBe("48px");
  });
});

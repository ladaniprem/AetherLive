import { describe, it, expect } from "vitest";
import { add } from "./add";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("adds negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("adds zero", () => {
    expect(add(0, 5)).toBe(5);
  });

  it("adds floats", () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3);
  });
});

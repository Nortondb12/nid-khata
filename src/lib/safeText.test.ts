import { describe, it, expect } from "vitest";
import { safeText } from "./safeText";

describe("safeText", () => {
  it("returns empty string for null/undefined", () => {
    expect(safeText(null)).toBe("");
    expect(safeText(undefined)).toBe("");
  });

  it("converts non-strings", () => {
    expect(safeText(42)).toBe("42");
    expect(safeText(true)).toBe("true");
  });

  it("strips ASCII control characters", () => {
    expect(safeText("hel\u0000lo\u0007\u001Fworld")).toBe("helloworld");
  });

  it("strips DEL (0x7F)", () => {
    expect(safeText("ab\u007Fc")).toBe("abc");
  });

  it("trims whitespace", () => {
    expect(safeText("  hello  ")).toBe("hello");
  });

  it("truncates with ellipsis at maxLength", () => {
    const result = safeText("a".repeat(20), 10);
    expect(result.length).toBe(11);
    expect(result.endsWith("…")).toBe(true);
  });

  it("keeps Bengali characters intact", () => {
    expect(safeText("মোঃ রহিম উদ্দিন")).toBe("মোঃ রহিম উদ্দিন");
  });

  it("uses default cap of 500 characters", () => {
    const result = safeText("x".repeat(600));
    expect(result.length).toBe(501);
  });
});

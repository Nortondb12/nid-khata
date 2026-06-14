import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    warnSpy.mockClear();
    errorSpy.mockClear();
  });

  afterEach(() => {
    warnSpy.mockReset();
    errorSpy.mockReset();
  });

  it("redacts nid_number in warn", () => {
    logger.warn("ctx", { nid_number: "1234567890", name: "Rahim" });
    expect(warnSpy).toHaveBeenCalledWith("ctx", { nid_number: "[redacted]", name: "Rahim" });
  });

  it("redacts date_of_birth, dob, nid keys in error", () => {
    logger.error({ date_of_birth: "1990-01-01", dob: "1990-01-01", nid: "x", other: "ok" });
    expect(errorSpy).toHaveBeenCalledWith({
      date_of_birth: "[redacted]",
      dob: "[redacted]",
      nid: "[redacted]",
      other: "ok",
    });
  });

  it("recurses into nested objects and arrays", () => {
    logger.warn({ user: { nid_number: "111", profile: { name: "x" } }, list: [{ nid: "z" }] });
    expect(warnSpy).toHaveBeenCalledWith({
      user: { nid_number: "[redacted]", profile: { name: "x" } },
      list: [{ nid: "[redacted]" }],
    });
  });

  it("passes primitives through untouched", () => {
    logger.warn("plain string", 42);
    expect(warnSpy).toHaveBeenCalledWith("plain string", 42);
  });
});

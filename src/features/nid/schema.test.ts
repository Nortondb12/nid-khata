import { describe, it, expect } from "vitest";
import { nidLookupSchema } from "../schema";

describe("nidLookupSchema", () => {
  const validDob = "1990-01-15";

  it.each([10, 13, 17])("accepts %i-digit NID", (len) => {
    const nid = "1".repeat(len);
    const result = nidLookupSchema.safeParse({ nid_number: nid, date_of_birth: validDob });
    expect(result.success).toBe(true);
  });

  it.each([9, 11, 12, 14, 16, 18])("rejects %i-digit NID", (len) => {
    const result = nidLookupSchema.safeParse({
      nid_number: "1".repeat(len),
      date_of_birth: validDob,
    });
    expect(result.success).toBe(false);
  });

  it("rejects NID with non-digit characters", () => {
    const result = nidLookupSchema.safeParse({
      nid_number: "12345abcde",
      date_of_birth: validDob,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty DOB", () => {
    const result = nidLookupSchema.safeParse({
      nid_number: "1234567890",
      date_of_birth: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects future DOB", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10);
    const result = nidLookupSchema.safeParse({
      nid_number: "1234567890",
      date_of_birth: future,
    });
    expect(result.success).toBe(false);
  });

  it("rejects DOB before 1900", () => {
    const result = nidLookupSchema.safeParse({
      nid_number: "1234567890",
      date_of_birth: "1899-12-31",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed DOB string", () => {
    const result = nidLookupSchema.safeParse({
      nid_number: "1234567890",
      date_of_birth: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

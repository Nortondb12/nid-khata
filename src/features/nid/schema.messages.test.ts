import { describe, it, expect } from "vitest";
import { nidLookupSchema } from "./schema";

const validInput = { nid_number: "1234567890", date_of_birth: "1990-01-15" };

const errorsFor = (input: unknown, path: string) => {
  const res = nidLookupSchema.safeParse(input);
  if (res.success) return [];
  return res.error.issues.filter((i) => i.path[0] === path).map((i) => i.message);
};

describe("nidLookupSchema — accepted fields", () => {
  it("accepts only nid_number and date_of_birth", () => {
    const res = nidLookupSchema.safeParse(validInput);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(Object.keys(res.data).sort()).toEqual(["date_of_birth", "nid_number"]);
    }
  });

  it("strips unknown fields like full_name and father_name", () => {
    const res = nidLookupSchema.safeParse({
      ...validInput,
      full_name: "কেউ একজন",
      father_name: "কেউ",
      extra: 123,
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).not.toHaveProperty("full_name");
      expect(res.data).not.toHaveProperty("father_name");
      expect(res.data).not.toHaveProperty("extra");
    }
  });

  it("trims surrounding whitespace from nid_number", () => {
    const res = nidLookupSchema.safeParse({ ...validInput, nid_number: "  1234567890  " });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.nid_number).toBe("1234567890");
  });
});

describe("nidLookupSchema — error messages", () => {
  it("returns Bangla message for empty NID number", () => {
    const msgs = errorsFor({ ...validInput, nid_number: "" }, "nid_number");
    expect(msgs).toContain("শুধু সংখ্যা ব্যবহার করুন।");
  });

  it("returns Bangla message for non-digit NID", () => {
    const msgs = errorsFor({ ...validInput, nid_number: "12345abcde" }, "nid_number");
    expect(msgs).toContain("শুধু সংখ্যা ব্যবহার করুন।");
  });

  it("returns length message for wrong-length NID", () => {
    const msgs = errorsFor({ ...validInput, nid_number: "12345" }, "nid_number");
    expect(msgs).toContain("NID নম্বর ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে।");
  });

  it("returns Bangla message for empty date of birth", () => {
    const msgs = errorsFor({ ...validInput, date_of_birth: "" }, "date_of_birth");
    expect(msgs).toContain("জন্ম তারিখ দিন।");
  });

  it("returns Bangla message for malformed date of birth", () => {
    const msgs = errorsFor({ ...validInput, date_of_birth: "not-a-date" }, "date_of_birth");
    expect(msgs).toContain("সঠিক তারিখ দিন।");
  });

  it("returns Bangla message for future date of birth", () => {
    const future = new Date(Date.now() + 86_400_000 * 365).toISOString().slice(0, 10);
    const msgs = errorsFor({ ...validInput, date_of_birth: future }, "date_of_birth");
    expect(msgs).toContain("ভবিষ্যৎ তারিখ গ্রহণযোগ্য নয়।");
  });

  it("returns Bangla message for pre-1900 date of birth", () => {
    const msgs = errorsFor({ ...validInput, date_of_birth: "1899-12-31" }, "date_of_birth");
    expect(msgs).toContain("সঠিক জন্ম সাল দিন।");
  });

  it("reports errors for both fields when both empty", () => {
    const res = nidLookupSchema.safeParse({ nid_number: "", date_of_birth: "" });
    expect(res.success).toBe(false);
    if (!res.success) {
      const paths = res.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("nid_number");
      expect(paths).toContain("date_of_birth");
    }
  });
});

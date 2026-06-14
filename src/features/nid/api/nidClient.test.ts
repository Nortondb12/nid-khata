import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { lookupNid, NidLookupError } from "./nidClient";

const validPayload = {
  nid_number: "1234567890",
  date_of_birth: "1990-01-15",
};

const validResponse = {
  name_bn: "রহিম",
  name_en: "Rahim",
  father_name: "করিম",
  mother_name: "ফাতেমা",
  date_of_birth: "1990-01-15",
  nid_number: "1234567890",
  address: "ঢাকা",
};

describe("lookupNid", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed data on 200", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => validResponse,
    });
    const result = await lookupNid(validPayload);
    expect(result.name_bn).toBe("রহিম");
  });

  it.each([
    [400, "প্রদত্ত তথ্য সঠিক নয়"],
    [401, "অনুমতি নেই"],
    [403, "অনুমতি নেই"],
    [404, "খুঁজে পাওয়া যায়নি"],
    [429, "অনেক বেশি অনুরোধ"],
    [500, "সার্ভারে সমস্যা"],
    [503, "সার্ভারে সমস্যা"],
  ])("maps status %i to a Bengali message", async (status, fragment) => {
    fetchMock.mockResolvedValueOnce({ ok: false, status, json: async () => ({}) });
    await expect(lookupNid(validPayload)).rejects.toThrow(NidLookupError);
    try {
      await lookupNid(validPayload);
    } catch (err) {
      expect((err as Error).message).toContain(fragment);
    }
  });

  it("throws NidLookupError when response schema is invalid", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ foo: "bar" }),
    });
    await expect(lookupNid(validPayload)).rejects.toThrow(NidLookupError);
  });

  it("wraps network failures", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("network down"));
    await expect(lookupNid(validPayload)).rejects.toThrow(/নেটওয়ার্ক সমস্যা/);
  });

  it("maps AbortError to timeout message", async () => {
    const abortErr = Object.assign(new Error("aborted"), { name: "AbortError" });
    fetchMock.mockRejectedValueOnce(abortErr);
    await expect(lookupNid(validPayload)).rejects.toThrow(/সময় শেষ/);
  });
});

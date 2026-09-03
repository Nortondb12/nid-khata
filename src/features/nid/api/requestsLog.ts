import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

const maskNid = (nid: string) =>
  nid.length <= 4 ? "****" : `${"*".repeat(nid.length - 4)}${nid.slice(-4)}`;

/** Creates a pending request row. Returns the row id (or null on failure). */
export async function createNidRequest(
  nidNumber: string,
  dateOfBirth: string,
  email?: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("nid_requests")
      .insert({
        nid_masked: maskNid(nidNumber),
        dob_year: dateOfBirth?.slice(0, 4) ?? null,
        email: email?.trim().toLowerCase() ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;
    return data?.id ?? null;
  } catch (err) {
    logger.error("Failed to create NID request record", err);
    return null;
  }
}

export async function updateNidRequestStatus(
  id: string | null,
  status: "success" | "failed",
  failureReason?: string,
): Promise<void> {
  if (!id) return;
  try {
    const { error } = await supabase
      .from("nid_requests")
      .update({ status, failure_reason: failureReason ?? null })
      .eq("id", id);
    if (error) throw error;
  } catch (err) {
    logger.error("Failed to update NID request status", err);
  }
}

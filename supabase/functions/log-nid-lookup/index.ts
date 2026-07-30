import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { recordAuditEvent } from "../_shared/audit.ts";

const BodySchema = z.object({
  outcome: z.enum(["success", "failure"]),
  nid_number: z.string().trim().regex(/^\d{10}$|^\d{13}$|^\d{17}$/),
  date_of_birth: z.string().trim().max(32).optional(),
  failure_reason: z.string().trim().max(200).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") return json({ error: "অনুমোদিত নয়।" }, 405);

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "প্রদত্ত তথ্য সঠিক নয়।" }, 400);
    }

    await recordAuditEvent(req, { action: "lookup", ...parsed.data });
    return json({ logged: true });
  } catch (_err) {
    return json({ error: "লগ সংরক্ষণ করা যায়নি।" }, 500);
  }
});

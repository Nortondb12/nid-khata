
ALTER TABLE public.nid_audit_log ADD COLUMN IF NOT EXISTS issued_at text;
CREATE UNIQUE INDEX IF NOT EXISTS nid_audit_log_checksum_key
  ON public.nid_audit_log (checksum) WHERE checksum IS NOT NULL;

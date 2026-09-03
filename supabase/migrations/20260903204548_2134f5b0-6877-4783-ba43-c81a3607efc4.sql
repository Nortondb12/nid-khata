ALTER TABLE public.nid_requests ADD COLUMN IF NOT EXISTS email text;
CREATE INDEX IF NOT EXISTS nid_requests_email_idx ON public.nid_requests (lower(email));

DROP POLICY IF EXISTS "Anyone can update status of a request" ON public.nid_requests;

CREATE POLICY "Clients can view their own requests"
ON public.nid_requests
FOR SELECT
TO authenticated
USING (email IS NOT NULL AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

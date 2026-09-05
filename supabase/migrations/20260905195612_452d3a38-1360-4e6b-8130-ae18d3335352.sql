REVOKE UPDATE ON public.nid_requests FROM anon;

ALTER TABLE public.nid_requests
  ADD CONSTRAINT nid_requests_status_valid
  CHECK (status IN ('pending', 'success', 'failed'));

CREATE POLICY "Admins can update requests"
ON public.nid_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
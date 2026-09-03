CREATE TABLE public.nid_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nid_masked text NOT NULL,
  dob_year text,
  status text NOT NULL DEFAULT 'pending',
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT, SELECT, UPDATE ON public.nid_requests TO anon;
GRANT INSERT, SELECT, UPDATE ON public.nid_requests TO authenticated;
GRANT ALL ON public.nid_requests TO service_role;

ALTER TABLE public.nid_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request"
ON public.nid_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update status of a request"
ON public.nid_requests FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all requests"
ON public.nid_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_nid_requests_updated_at
BEFORE UPDATE ON public.nid_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
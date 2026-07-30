
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.nid_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL CHECK (action IN ('lookup','download')),
  outcome text NOT NULL CHECK (outcome IN ('success','failure')),
  nid_masked text NOT NULL,
  dob_year text,
  format text CHECK (format IN ('pdf','png')),
  checksum text,
  failure_reason text,
  actor_user_id uuid,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX nid_audit_log_created_at_idx ON public.nid_audit_log (created_at DESC);
CREATE INDEX nid_audit_log_action_idx ON public.nid_audit_log (action);

GRANT ALL ON public.nid_audit_log TO service_role;
GRANT SELECT ON public.nid_audit_log TO authenticated;
ALTER TABLE public.nid_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.nid_audit_log
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  source TEXT DEFAULT 'landing_sms',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_insert_waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "auth_can_select_waitlist" ON public.waitlist
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);

COMMENT ON TABLE public.waitlist IS 'Inscriptions à la liste d’attente prioritaire de Velianos.';
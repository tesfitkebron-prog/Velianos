CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  siret TEXT,
  phone TEXT,
  vapi_phone_number TEXT UNIQUE,
  vapi_assistant_id TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'FR',
  timezone TEXT DEFAULT 'Europe/Paris',
  working_hours JSONB DEFAULT '{}'::jsonb,
  subscription_plan TEXT DEFAULT 'solo',
  subscription_status TEXT DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ,
  billing_triggered_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  onboarding_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT company_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT role
  FROM public.users
  WHERE id = auth.uid()
    AND company_id = public.get_user_company_id()
  LIMIT 1
$$;

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'employee',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  notes TEXT,
  source TEXT DEFAULT 'nova_call',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  postal_code TEXT,
  radius_km INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  min_price_cents INTEGER,
  max_price_cents INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.company_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'text',
  title TEXT,
  content TEXT,
  file_url TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.external_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'ics',
  ics_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  calendar_id TEXT,
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  address TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'nova_call',
  estimated_price_min_cents INTEGER,
  estimated_price_max_cents INTEGER,
  urgency TEXT DEFAULT 'normal',
  call_id UUID,
  billing_triggered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  from_number TEXT,
  to_number TEXT,
  direction TEXT DEFAULT 'inbound',
  status TEXT DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  cost_cents INTEGER,
  recording_url TEXT,
  summary TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.nova_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  call_id UUID REFERENCES public.calls(id) ON DELETE SET NULL,
  tool_call_id TEXT,
  tool_name TEXT NOT NULL,
  input JSONB,
  output JSONB,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  to_number TEXT,
  from_number TEXT,
  body TEXT NOT NULL,
  direction TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  external_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.usage_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  minutes_used INTEGER DEFAULT 0,
  calls_count INTEGER DEFAULT 0,
  appointments_booked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (company_id, month)
);

CREATE TABLE public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  payload JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  metadata JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.trigger_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER companies_set_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER clients_set_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER appointments_set_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER usage_monthly_set_updated_at
BEFORE UPDATE ON public.usage_monthly
FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE INDEX IF NOT EXISTS idx_companies_vapi_phone
ON public.companies(vapi_phone_number);

CREATE INDEX IF NOT EXISTS idx_users_company
ON public.users(company_id);

CREATE INDEX IF NOT EXISTS idx_clients_company_phone
ON public.clients(company_id, phone);

CREATE INDEX IF NOT EXISTS idx_clients_company_created
ON public.clients(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_company_start
ON public.appointments(company_id, start_at)
WHERE status != 'canceled';

CREATE INDEX IF NOT EXISTS idx_appointments_company_status
ON public.appointments(company_id, status, start_at);

CREATE INDEX IF NOT EXISTS idx_appointments_assigned
ON public.appointments(assigned_user_id, start_at);

CREATE INDEX IF NOT EXISTS idx_calls_company_started
ON public.calls(company_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_calls_vapi_id
ON public.calls(vapi_call_id);

CREATE INDEX IF NOT EXISTS idx_transcripts_call
ON public.transcripts(call_id, timestamp_ms);

CREATE INDEX IF NOT EXISTS idx_nova_actions_call
ON public.nova_actions(call_id);

CREATE INDEX IF NOT EXISTS idx_nova_actions_company
ON public.nova_actions(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_company_sent
ON public.messages(company_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON public.notifications(user_id, read_at)
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_usage_company_month
ON public.usage_monthly(company_id, month);

CREATE INDEX IF NOT EXISTS idx_external_calendars_company
ON public.external_calendars(company_id)
WHERE is_active = true;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nova_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_company" ON public.companies
FOR SELECT
USING (id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.companies
FOR UPDATE
USING (id = public.get_user_company_id())
WITH CHECK (id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.users
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company_admin" ON public.users
FOR INSERT
WITH CHECK (
  company_id = public.get_user_company_id()
  AND public.get_user_role() = 'admin'
);

CREATE POLICY "update_own_company_admin_or_self" ON public.users
FOR UPDATE
USING (
  company_id = public.get_user_company_id()
  AND (id = auth.uid() OR public.get_user_role() = 'admin')
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (id = auth.uid() OR public.get_user_role() = 'admin')
);

CREATE POLICY "delete_own_company_admin" ON public.users
FOR DELETE
USING (
  company_id = public.get_user_company_id()
  AND public.get_user_role() = 'admin'
  AND id <> auth.uid()
);

CREATE POLICY "select_own_company" ON public.invitations
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.invitations
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.invitations
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.invitations
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.clients
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.clients
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.clients
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.clients
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.zones
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.zones
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.zones
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.zones
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.pricing_rules
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.pricing_rules
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.pricing_rules
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.pricing_rules
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.company_knowledge
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.company_knowledge
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.company_knowledge
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.company_knowledge
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.external_calendars
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.external_calendars
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.external_calendars
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.external_calendars
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.appointments
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.appointments
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.appointments
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.appointments
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.calls
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.calls
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.calls
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.calls
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.transcripts
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.transcripts
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.transcripts
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.transcripts
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.nova_actions
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.nova_actions
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.nova_actions
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.nova_actions
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.messages
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.messages
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.messages
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.messages
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.notifications
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.notifications
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.notifications
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.notifications
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE POLICY "select_own_company" ON public.usage_monthly
FOR SELECT
USING (company_id = public.get_user_company_id());

CREATE POLICY "insert_own_company" ON public.usage_monthly
FOR INSERT
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "update_own_company" ON public.usage_monthly
FOR UPDATE
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "delete_own_company" ON public.usage_monthly
FOR DELETE
USING (company_id = public.get_user_company_id());

CREATE OR REPLACE FUNCTION public.purge_old_transcripts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.transcripts
  WHERE created_at < now() - interval '12 months';
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_company_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_company_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.trigger_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_updated_at() TO service_role;

REVOKE ALL ON FUNCTION public.purge_old_transcripts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_transcripts() TO service_role;

COMMENT ON TABLE public.companies IS 'Entreprise cliente et tenant isolé de Velianos.';
COMMENT ON TABLE public.users IS 'Utilisateurs de Velianos rattachés à une entreprise.';
COMMENT ON TABLE public.invitations IS 'Invitations en attente pour rejoindre une équipe.';
COMMENT ON TABLE public.clients IS 'Clients enregistrés par une entreprise.';
COMMENT ON TABLE public.zones IS 'Zones d’intervention couvertes par une entreprise.';
COMMENT ON TABLE public.pricing_rules IS 'Fourchettes tarifaires utilisées par Nova.';
COMMENT ON TABLE public.company_knowledge IS 'Documents et connaissances propres à chaque entreprise.';
COMMENT ON TABLE public.external_calendars IS 'Agendas externes connectés en lecture seule.';
COMMENT ON TABLE public.appointments IS 'Rendez-vous gérés par les équipes Velianos.';
COMMENT ON TABLE public.calls IS 'Appels téléphoniques traités par Nova.';
COMMENT ON TABLE public.transcripts IS 'Transcriptions des appels passée par les équipes autorisées.';
COMMENT ON TABLE public.nova_actions IS 'Actions et appels d’outils effectués par Nova.';
COMMENT ON TABLE public.messages IS 'SMS entrants et sortants envoyés aux clients.';
COMMENT ON TABLE public.notifications IS 'Notifications internes destinées aux utilisateurs.';
COMMENT ON TABLE public.usage_monthly IS 'Consommation mensuelle agrégée par entreprise.';
COMMENT ON TABLE public.billing_events IS 'Événements de facturation réservés aux services de confiance.';
COMMENT ON TABLE public.audit_logs IS 'Journal d’audit réservé aux services de confiance.';

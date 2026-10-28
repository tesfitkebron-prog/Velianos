-- ============================================
-- VELIANOS - 006 - ARCHITECTURE & PERFORMANCE
-- Index manquants et idempotence des webhooks
-- ============================================
--
-- Note : dans le schéma Velianos, la colonne tenant est `company_id`
-- (et non `user_id`) sur les tables clients, messages et calls. Elle est
-- déjà couverte par les index composites du schéma initial :
--   idx_clients_company_phone, idx_clients_company_created,
--   idx_messages_company_sent, idx_calls_company_started.
-- Les index ci-dessous couvrent les jointures et les filtres réellement
-- utilisés par l'application mais absents du schéma initial.

CREATE INDEX IF NOT EXISTS idx_appointments_company_created
ON public.appointments(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_client
ON public.appointments(client_id);

CREATE INDEX IF NOT EXISTS idx_messages_company_client_sent
ON public.messages(company_id, client_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_calls_client
ON public.calls(client_id);

CREATE INDEX IF NOT EXISTS idx_company_knowledge_company_type
ON public.company_knowledge(company_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_company
ON public.pricing_rules(company_id)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_zones_company
ON public.zones(company_id)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_notifications_company_created
ON public.notifications(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_events_company_created
ON public.billing_events(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created
ON public.audit_logs(company_id, created_at DESC);

-- Table d'idempotence : un événement Stripe/Twilio ne doit être traité
-- qu'une seule fois, même s'il est relivré plusieurs fois.
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'twilio')),
  event_id TEXT NOT NULL,
  event_type TEXT,
  payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT webhook_events_provider_event_id_key UNIQUE (provider, event_id)
);

COMMENT ON TABLE public.webhook_events IS
  'Événements webhook déjà traités, pour garantir l''idempotence des relivraisons.';

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at
ON public.webhook_events(created_at DESC);

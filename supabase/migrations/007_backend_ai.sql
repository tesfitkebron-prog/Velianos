-- ============================================
-- VELIANOS - 007 - BACKEND IA, TWILIO, PUSH & RLS
-- ============================================
--
-- Cette migration ajoute :
--   1. la base de connaissances PDF des entreprises ;
--   2. le numéro Twilio de chaque entreprise ;
--   3. les abonnements Web Push ;
--   4. un renforcement explicite des politiques RLS multi-locataires.
--
-- Rappel : la colonne tenant de `clients`, `messages` et `calls` est
-- `company_id` (et non `user_id`). Un utilisateur ne doit accéder qu'aux
-- lignes de son entreprise, via `public.get_user_company_id()`.

-- 1. Base de connaissances extraite des PDF
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS knowledge_base TEXT;

COMMENT ON COLUMN public.companies.knowledge_base IS
  'Texte agrégé des PDF de l''entreprise, injecté dans le prompt système de l''IA.';

-- 2. Numéro Twilio utilisé pour recevoir les SMS
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT;

COMMENT ON COLUMN public.companies.twilio_phone_number IS
  'Numéro Twilio (E.164) auquel les clients envoient leurs SMS.';

CREATE UNIQUE INDEX IF NOT EXISTS companies_twilio_phone_number_key
  ON public.companies (twilio_phone_number)
  WHERE twilio_phone_number IS NOT NULL;

-- 3. Idempotence applicative des messages Twilio
CREATE INDEX IF NOT EXISTS idx_messages_external_id
  ON public.messages (external_id)
  WHERE external_id IS NOT NULL;

-- 4. Abonnements Web Push (un par appareil/navigateur)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint)
);

COMMENT ON TABLE public.push_subscriptions IS
  'Abonnements Web Push des appareils, pour notifier les artisans des nouveaux clients.';

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_company
  ON public.push_subscriptions (company_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON public.push_subscriptions (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
REVOKE ALL ON public.push_subscriptions FROM anon;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subscriptions_select_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_insert_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_update_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_delete_own" ON public.push_subscriptions;

CREATE POLICY "push_subscriptions_select_own" ON public.push_subscriptions
FOR SELECT TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND user_id = auth.uid()
);

CREATE POLICY "push_subscriptions_insert_own" ON public.push_subscriptions
FOR INSERT TO authenticated
WITH CHECK (
  company_id = public.get_user_company_id()
  AND user_id = auth.uid()
);

CREATE POLICY "push_subscriptions_update_own" ON public.push_subscriptions
FOR UPDATE TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND user_id = auth.uid()
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND user_id = auth.uid()
);

CREATE POLICY "push_subscriptions_delete_own" ON public.push_subscriptions
FOR DELETE TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND user_id = auth.uid()
);

-- 5. RLS strict sur les données clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.messages FROM anon;
REVOKE ALL ON public.calls FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calls TO authenticated;

DROP POLICY IF EXISTS "select_own_company" ON public.clients;
DROP POLICY IF EXISTS "insert_own_company" ON public.clients;
DROP POLICY IF EXISTS "update_own_company" ON public.clients;
DROP POLICY IF EXISTS "delete_own_company" ON public.clients;
DROP POLICY IF EXISTS "clients_select_tenant" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_tenant" ON public.clients;
DROP POLICY IF EXISTS "clients_update_tenant" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_tenant" ON public.clients;

CREATE POLICY "clients_select_tenant" ON public.clients
FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "clients_insert_tenant" ON public.clients
FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "clients_update_tenant" ON public.clients
FOR UPDATE TO authenticated
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "clients_delete_tenant" ON public.clients
FOR DELETE TO authenticated
USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "select_own_company" ON public.messages;
DROP POLICY IF EXISTS "insert_own_company" ON public.messages;
DROP POLICY IF EXISTS "update_own_company" ON public.messages;
DROP POLICY IF EXISTS "delete_own_company" ON public.messages;
DROP POLICY IF EXISTS "messages_select_tenant" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_tenant" ON public.messages;
DROP POLICY IF EXISTS "messages_update_tenant" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_tenant" ON public.messages;

CREATE POLICY "messages_select_tenant" ON public.messages
FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "messages_insert_tenant" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "messages_update_tenant" ON public.messages
FOR UPDATE TO authenticated
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "messages_delete_tenant" ON public.messages
FOR DELETE TO authenticated
USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "select_own_company" ON public.calls;
DROP POLICY IF EXISTS "insert_own_company" ON public.calls;
DROP POLICY IF EXISTS "update_own_company" ON public.calls;
DROP POLICY IF EXISTS "delete_own_company" ON public.calls;
DROP POLICY IF EXISTS "calls_select_tenant" ON public.calls;
DROP POLICY IF EXISTS "calls_insert_tenant" ON public.calls;
DROP POLICY IF EXISTS "calls_update_tenant" ON public.calls;
DROP POLICY IF EXISTS "calls_delete_tenant" ON public.calls;

CREATE POLICY "calls_select_tenant" ON public.calls
FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "calls_insert_tenant" ON public.calls
FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "calls_update_tenant" ON public.calls
FOR UPDATE TO authenticated
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "calls_delete_tenant" ON public.calls
FOR DELETE TO authenticated
USING (company_id = public.get_user_company_id());

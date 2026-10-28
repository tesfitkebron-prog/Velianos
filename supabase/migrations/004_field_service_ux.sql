-- ============================================
-- VELIANOS - 004 - FIELD SERVICE UX
-- Realtime, stockage des documents, assistant actif, RGPD
-- ============================================

-- 1. État de l'assistant (actif / en pause)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS assistant_active BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.companies.assistant_active IS
  'Indique si l''assistant vocal et SMS répond automatiquement.';

-- 2. Temps réel pour les nouveaux clients, rendez-vous et messages
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END;
$$;

-- 3. Bucket de stockage des PDF (10 Mo maximum)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-documents',
  'company-documents',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "company_documents_select" ON storage.objects;
DROP POLICY IF EXISTS "company_documents_insert" ON storage.objects;
DROP POLICY IF EXISTS "company_documents_update" ON storage.objects;
DROP POLICY IF EXISTS "company_documents_delete" ON storage.objects;

CREATE POLICY "company_documents_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'company-documents'
    AND (storage.foldername(name))[1] = (
      SELECT u.company_id::text FROM public.users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "company_documents_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'company-documents'
    AND (storage.foldername(name))[1] = (
      SELECT u.company_id::text FROM public.users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "company_documents_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'company-documents'
    AND (storage.foldername(name))[1] = (
      SELECT u.company_id::text FROM public.users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "company_documents_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'company-documents'
    AND (storage.foldername(name))[1] = (
      SELECT u.company_id::text FROM public.users u WHERE u.id = auth.uid()
    )
  );

-- 4. Suppression du compte (RGPD)
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_company UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  SELECT company_id INTO v_company
  FROM public.users
  WHERE id = v_user;

  DELETE FROM auth.users WHERE id = v_user;

  IF v_company IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.users WHERE company_id = v_company
  ) THEN
    DELETE FROM public.companies WHERE id = v_company;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

COMMENT ON FUNCTION public.delete_my_account() IS
  'Supprime le compte authentifié et les données de son entreprise si plus aucun utilisateur ne reste.';

-- 5. Index de lecture des notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

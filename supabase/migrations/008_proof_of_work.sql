-- ============================================
-- VELIANOS - 008 - PREUVE D'INTERVENTION
-- Photos et signatures des clients (bucket prive)
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-proofs',
  'client-proofs',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE
SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "client_proofs_select" ON storage.objects;
DROP POLICY IF EXISTS "client_proofs_insert" ON storage.objects;
DROP POLICY IF EXISTS "client_proofs_update" ON storage.objects;
DROP POLICY IF EXISTS "client_proofs_delete" ON storage.objects;

CREATE POLICY "client_proofs_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-proofs'
    AND (storage.foldername(name))[1] = (
      SELECT u.company_id::text FROM public.users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "client_proofs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'client-proofs'
    AND (storage.foldername(name))[1] = (
      SELECT u.company_id::text FROM public.users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "client_proofs_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'client-proofs'
    AND (storage.foldername(name))[1] = (
      SELECT u.company_id::text FROM public.users u WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "client_proofs_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'client-proofs'
    AND (storage.foldername(name))[1] = (
      SELECT u.company_id::text FROM public.users u WHERE u.id = auth.uid()
    )
  );

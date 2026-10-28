-- ============================================
-- VELIANOS - 005 - LIMITE DE TAILLE DES FICHIERS
-- Les documents de l'assistant sont limités à 5 Mo.
-- ============================================

UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'company-documents';

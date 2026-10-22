-- Ajout des champs profil entreprise (email professionnel, site web, description activité)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.companies.email IS 'Email professionnel utilisé par l''assistant';
COMMENT ON COLUMN public.companies.website IS 'Site web de l''entreprise';
COMMENT ON COLUMN public.companies.description IS 'Description de l''activité, utilisée par l''assistant pour répondre aux clients';
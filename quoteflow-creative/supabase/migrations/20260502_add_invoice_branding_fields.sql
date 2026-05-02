-- Add invoice branding fields to company_settings
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS signer_name text,
ADD COLUMN IF NOT EXISTS signer_title text,
ADD COLUMN IF NOT EXISTS signature_url text,
ADD COLUMN IF NOT EXISTS google_review_url text;

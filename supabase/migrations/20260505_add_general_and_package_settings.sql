-- Add general settings and package storage to company_settings

ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS workspace_name text,
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS date_format text,
ADD COLUMN IF NOT EXISTS currency_label text,
ADD COLUMN IF NOT EXISTS default_view text,
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS browser_notifications boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_packages jsonb DEFAULT '[]'::jsonb;

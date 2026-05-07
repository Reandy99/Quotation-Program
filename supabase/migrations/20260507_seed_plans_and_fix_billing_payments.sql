-- 1. Pastikan tabel plans punya kolom slug
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS price_idr INTEGER DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Seed plans (free_trial & pro) kalau belum ada
INSERT INTO public.plans (name, slug, price_idr, is_active)
VALUES ('Free Trial', 'free_trial', 0, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.plans (name, slug, price_idr, is_active)
VALUES ('Pro', 'pro', 49000, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Pastikan billing_payments punya kolom yang dibutuhkan
ALTER TABLE public.billing_payments ADD COLUMN IF NOT EXISTS gateway TEXT;
ALTER TABLE public.billing_payments ADD COLUMN IF NOT EXISTS gateway_payment_id TEXT;
ALTER TABLE public.billing_payments ADD COLUMN IF NOT EXISTS gateway_invoice_url TEXT;
ALTER TABLE public.billing_payments ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ;
ALTER TABLE public.billing_payments ADD COLUMN IF NOT EXISTS period_end TIMESTAMPTZ;
ALTER TABLE public.billing_payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.billing_payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.billing_payments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

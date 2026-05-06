-- Add Midtrans payment integration fields to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_url TEXT;

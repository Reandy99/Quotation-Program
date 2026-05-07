-- Rename midtrans_order_id to payment_order_id (gateway-agnostic)
ALTER TABLE public.invoices
  RENAME COLUMN midtrans_order_id TO payment_order_id;

-- Payments Table for Invoice Payment History

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric not null,
  method text not null check (method in ('Transfer', 'Cash', 'QRIS')),
  date date not null,
  notes text,
  created_at timestamptz default now() not null
);

alter table public.payments enable row level security;

create policy "Users can manage own payments"
  on public.payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index payments_invoice_id_idx on public.payments(invoice_id);
create index payments_user_id_idx on public.payments(user_id);

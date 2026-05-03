-- ============================================================
-- QUOTEFLOW CREATIVE — DB Fix & Seed
-- Run all at once in Supabase SQL Editor
-- ============================================================

-- 1️⃣ SEED PLANS (kalo belum ada)
insert into public.plans (id, name, price_idr, interval, features) values
  ('free_trial', 'Free Trial', 0, 'month', '["All features for 14 days", "Unlimited leads", "PDF export", "Follow-up tracker"]'),
  ('studio', 'Studio', 99000, 'month', '["All core features", "Unlimited leads & quotations", "PDF export", "Follow-up tracker", "Priority support"]'),
  ('pro', 'Pro', 199000, 'month', '["Everything in Studio", "Advanced reports", "Multiple workspaces", "API access", "Dedicated support"]')
on conflict (id) do nothing;

-- 2️⃣ BACKFILL SUBSCRIPTION — biar akun kamu & user lain ada data
insert into public.subscriptions (user_id, plan_id, status, trial_end, current_period_end)
select 
  id as user_id,
  'free_trial' as plan_id,
  'trialing' as status,
  now() + interval '14 days' as trial_end,
  now() + interval '14 days' as current_period_end
from auth.users
where id not in (select user_id from public.subscriptions)
on conflict (user_id) do nothing;

-- 3️⃣ AUDIT LOGS INSERT POLICY
drop policy if exists "Users can insert own audit logs" on public.audit_logs;
create policy "Users can insert own audit logs"
  on public.audit_logs for insert with check (auth.uid() = user_id);

-- 4️⃣ PAYMENTS TABLE (invoice payment history)
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
drop policy if exists "Users can manage own payments" on public.payments;
create policy "Users can manage own payments"
  on public.payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index if not exists payments_invoice_id_idx on public.payments(invoice_id);
create index if not exists payments_user_id_idx on public.payments(user_id);

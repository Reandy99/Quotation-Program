-- QuoteFlow Creative — Full Database Schema
-- Run this in your Supabase SQL editor

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COMPANY SETTINGS
-- ============================================================
create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  business_name text,
  logo_url text,
  email text,
  phone text,
  website text,
  address text,
  default_terms text,
  default_payment_terms text,
  signer_name text,
  signer_title text,
  signature_url text,
  google_review_url text,
  workspace_name text,
  timezone text,
  language text,
  date_format text,
  currency_label text,
  default_view text,
  email_notifications boolean default true,
  browser_notifications boolean default false,
  service_packages jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.company_settings enable row level security;

create policy "Users can manage own company settings"
  on public.company_settings for all using (auth.uid() = user_id);

-- ============================================================
-- LEADS
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  company_name text,
  email text,
  phone text,
  project_type text,
  event_date date,
  location text,
  estimated_budget numeric(15,2),
  notes text,
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Quoted', 'Follow Up', 'Won', 'Lost')),
  follow_up_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.leads enable row level security;

create policy "Users can manage own leads"
  on public.leads for all using (auth.uid() = user_id);

create index leads_user_id_idx on public.leads(user_id);
create index leads_status_idx on public.leads(status);
create index leads_follow_up_date_idx on public.leads(follow_up_date);

-- ============================================================
-- QUOTATIONS
-- ============================================================
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  quote_number text not null,
  project_title text not null,
  project_type text,
  event_date date,
  location text,
  valid_until date,
  discount_type text not null default 'flat' check (discount_type in ('flat', 'percent')),
  discount_value numeric(15,2) not null default 0,
  tax_percent numeric(5,2) not null default 0,
  subtotal numeric(15,2) not null default 0,
  grand_total numeric(15,2) not null default 0,
  notes text,
  terms text,
  status text not null default 'Draft'
    check (status in ('Draft', 'Sent', 'Accepted', 'Rejected')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, quote_number)
);

alter table public.quotations enable row level security;

create policy "Users can manage own quotations"
  on public.quotations for all using (auth.uid() = user_id);

create index quotations_user_id_idx on public.quotations(user_id);
create index quotations_lead_id_idx on public.quotations(lead_id);

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_type text not null
    check (event_type in ('shoot', 'meeting', 'reminder', 'personal')),
  date date not null,
  location text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.calendar_events enable row level security;

create policy "Users can manage own calendar events"
  on public.calendar_events for all using (auth.uid() = user_id);

create index calendar_events_user_id_idx on public.calendar_events(user_id);
create index calendar_events_date_idx on public.calendar_events(date);

-- ============================================================
-- AUTOMATION DISMISSALS
-- ============================================================
create table if not exists public.automation_dismissals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  suggestion_key text not null,
  dismissed_at timestamptz default now() not null,
  unique(user_id, suggestion_key)
);

alter table public.automation_dismissals enable row level security;

create policy "Users can manage own automation dismissals"
  on public.automation_dismissals for all using (auth.uid() = user_id);

create index automation_dismissals_user_id_idx on public.automation_dismissals(user_id);

-- ============================================================
-- QUOTATION ITEMS
-- ============================================================
create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  description text,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(15,2) not null default 0,
  total_price numeric(15,2) not null default 0,
  sort_order int not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.quotation_items enable row level security;

create policy "Users can manage own quotation items"
  on public.quotation_items for all using (auth.uid() = user_id);

create index quotation_items_quotation_id_idx on public.quotation_items(quotation_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Bucket for company logos and signatures
-- Structure: {user_id}/logo-{timestamp}.{ext} for logos
--            {user_id}/signatures/signature-{timestamp}.{ext} for signatures
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

create policy "Users can upload own logo"
  on storage.objects for insert
  with check (bucket_id = 'company-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own logo"
  on storage.objects for update
  using (bucket_id = 'company-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can view logos"
  on storage.objects for select
  using (bucket_id = 'company-logos');

-- ============================================================
-- BILLING: PLANS
-- ============================================================
create table if not exists public.plans (
  id text primary key, -- 'free_trial', 'studio', 'pro'
  name text not null,
  price_idr numeric(15,2) not null default 0,
  interval text not null default 'month' check (interval in ('month', 'year')),
  features jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

insert into public.plans (id, name, price_idr, interval, features) values
  ('free_trial', 'Free Trial', 0, 'month', '["All features for 14 days", "Unlimited leads", "PDF export", "Follow-up tracker"]'),
  ('studio', 'Studio', 99000, 'month', '["All core features", "Unlimited leads & quotations", "PDF export", "Follow-up tracker", "Priority support"]'),
  ('pro', 'Pro', 199000, 'month', '["Everything in Studio", "Advanced reports", "Multiple workspaces", "API access", "Dedicated support"]')
on conflict (id) do nothing;

-- ============================================================
-- BILLING: SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  plan_id text not null references public.plans(id),
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'expired', 'cancelled', 'past_due')),
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  -- Payment gateway fields (for future Xendit/Midtrans integration)
  gateway text, -- 'xendit', 'midtrans', 'manual'
  gateway_subscription_id text,
  gateway_customer_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all using (auth.role() = 'service_role');

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_status_idx on public.subscriptions(status);

-- ============================================================
-- BILLING: PAYMENTS
-- ============================================================
create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  plan_id text not null references public.plans(id),
  amount_idr numeric(15,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  -- Payment gateway fields
  gateway text,
  gateway_payment_id text,
  gateway_invoice_url text,
  notes text,
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);

alter table public.billing_payments enable row level security;

create policy "Users can view own payments"
  on public.billing_payments for select using (auth.uid() = user_id);

create policy "Service role can manage payments"
  on public.billing_payments for all using (auth.role() = 'service_role');

create index billing_payments_user_id_idx on public.billing_payments(user_id);
create index billing_payments_subscription_id_idx on public.billing_payments(subscription_id);

-- ============================================================
-- AUTO-CREATE TRIAL SUBSCRIPTION ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.subscriptions (user_id, plan_id, status, trial_end)
  values (
    new.id,
    'free_trial',
    'trialing',
    now() + interval '14 days'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute procedure public.handle_new_user_subscription();

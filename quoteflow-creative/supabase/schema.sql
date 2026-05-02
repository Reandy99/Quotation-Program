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

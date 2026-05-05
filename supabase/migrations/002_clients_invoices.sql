-- Clients and Invoices Tables
-- Run this in your Supabase SQL editor after running schema.sql

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  total_projects int not null default 0,
  total_revenue numeric(15,2) not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.clients enable row level security;

create policy "Users can manage own clients"
  on public.clients for all using (auth.uid() = user_id);

create index clients_user_id_idx on public.clients(user_id);

-- ============================================================
-- INVOICES
-- ============================================================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quotation_id uuid references public.quotations(id) on delete set null,
  invoice_number text not null,
  client_name text not null,
  project_title text not null,
  issue_date date not null,
  due_date date not null,
  subtotal numeric(15,2) not null default 0,
  discount numeric(15,2) not null default 0,
  tax numeric(15,2) not null default 0,
  grand_total numeric(15,2) not null default 0,
  paid_amount numeric(15,2) not null default 0,
  status text not null default 'Draft'
    check (status in ('Draft', 'Sent', 'Partial', 'Paid', 'Overdue')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, invoice_number)
);

alter table public.invoices enable row level security;

create policy "Users can manage own invoices"
  on public.invoices for all using (auth.uid() = user_id);

create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_quotation_id_idx on public.invoices(quotation_id);
create index invoices_status_idx on public.invoices(status);

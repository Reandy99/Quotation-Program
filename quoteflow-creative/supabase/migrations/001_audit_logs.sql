-- Audit Logs Table
-- Run this in your Supabase SQL editor after running schema.sql

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz default now() not null
);

alter table public.audit_logs enable row level security;

create policy "Users can view own audit logs"
  on public.audit_logs for select using (auth.uid() = user_id);

create index audit_logs_user_id_idx on public.audit_logs(user_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);

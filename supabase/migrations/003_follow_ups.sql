-- Follow-ups Table
-- Run this in your Supabase SQL editor

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  type text not null check (type in ('call', 'email', 'meeting', 'whatsapp', 'other')),
  scheduled_date date not null,
  notes text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.follow_ups enable row level security;

create policy "Users can manage own follow-ups"
  on public.follow_ups for all using (auth.uid() = user_id);

create index follow_ups_user_id_idx on public.follow_ups(user_id);
create index follow_ups_lead_id_idx on public.follow_ups(lead_id);
create index follow_ups_scheduled_date_idx on public.follow_ups(scheduled_date);
create index follow_ups_completed_idx on public.follow_ups(completed);

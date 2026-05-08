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

create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
create index if not exists calendar_events_date_idx on public.calendar_events(date);

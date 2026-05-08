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

create index if not exists automation_dismissals_user_id_idx on public.automation_dismissals(user_id);

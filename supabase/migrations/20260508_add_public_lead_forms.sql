create table if not exists public.lead_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null default 'Request Event Documentation',
  description text,
  button_text text not null default 'Submit Inquiry',
  thank_you_message text default 'Thank you! Your inquiry has been received.',
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id)
);

alter table public.lead_forms enable row level security;

create policy "Users can manage own lead forms"
  on public.lead_forms for all using (auth.uid() = user_id);

alter table public.leads
  add column if not exists event_name text,
  add column if not exists event_time text,
  add column if not exists lead_source text default 'Manual',
  add column if not exists source_detail text,
  add column if not exists lead_form_id uuid references public.lead_forms(id);

create index if not exists lead_forms_user_id_idx on public.lead_forms(user_id);
create index if not exists lead_forms_slug_idx on public.lead_forms(slug);
create index if not exists leads_lead_form_id_idx on public.leads(lead_form_id);
create index if not exists leads_lead_source_idx on public.leads(lead_source);

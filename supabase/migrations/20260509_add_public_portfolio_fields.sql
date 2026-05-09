alter table public.lead_forms
  add column if not exists studio_intro text,
  add column if not exists portfolio_items jsonb default '[]'::jsonb,
  add column if not exists highlight_items jsonb default '[]'::jsonb;

update public.lead_forms
set
  studio_intro = coalesce(studio_intro, 'Professional photo and video documentation for weddings, events, brands, and special moments.'),
  portfolio_items = case
    when portfolio_items is null or jsonb_typeof(portfolio_items) <> 'array' then '[]'::jsonb
    else portfolio_items
  end,
  highlight_items = case
    when highlight_items is null or jsonb_typeof(highlight_items) <> 'array' then '["Fast response", "Professional quotation", "Flexible packages"]'::jsonb
    else highlight_items
  end,
  updated_at = now()
where studio_intro is null
   or portfolio_items is null
   or highlight_items is null;

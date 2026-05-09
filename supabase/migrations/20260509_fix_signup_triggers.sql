-- Fix signup triggers after the subscription trigger accidentally reused
-- the profile trigger name and referenced the old trial_ends_at column.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();

  return new;
end;
$$;

create or replace function public.handle_new_user_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  free_trial_plan_id text;
begin
  select id into free_trial_plan_id
  from public.plans
  where id = 'free_trial'
  limit 1;

  if free_trial_plan_id is null then
    insert into public.plans (id, name, price_idr, interval, features, is_active)
    values ('free_trial', 'Free Trial', 0, 'month', '["All features for 14 days"]'::jsonb, true)
    on conflict (id) do nothing;

    free_trial_plan_id := 'free_trial';
  end if;

  insert into public.subscriptions (user_id, plan_id, status, trial_end, created_at, updated_at)
  values (
    new.id,
    free_trial_plan_id,
    'trialing',
    now() + interval '14 days',
    now(),
    now()
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_subscription on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- Auto-create free_trial subscription when a new user signs up
-- Run this in Supabase SQL Editor

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_trial_plan_id UUID;
BEGIN
  -- Get the free_trial plan id
  SELECT id INTO free_trial_plan_id
  FROM public.plans
  WHERE slug = 'free_trial'
  LIMIT 1;

  -- Only insert if plan found and user doesn't already have a subscription
  IF free_trial_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, trial_ends_at, created_at, updated_at)
    VALUES (
      NEW.id,
      free_trial_plan_id,
      'trialing',
      NOW() + INTERVAL '14 days',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

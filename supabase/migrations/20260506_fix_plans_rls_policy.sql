-- Allow authenticated users to read active plans
-- Previously RLS was enabled on plans but no SELECT policy existed,
-- causing plan join data to return null for regular users.
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

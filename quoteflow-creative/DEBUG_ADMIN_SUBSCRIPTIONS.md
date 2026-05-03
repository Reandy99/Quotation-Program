# Debug Guide: Admin Subscriptions Page

## Problem
Halaman `/admin/subscriptions` menampilkan "No subscriptions found" meskipun data sudah ada di database.

## Root Cause Analysis

### 1. **RLS Policy Issue** (Most Likely)
Di `supabase/schema.sql`, policy untuk subscriptions adalah:

```sql
create policy "Service role can manage subscriptions"
  on public.subscriptions for all using (auth.role() = 'service_role');
```

Service role key harus digunakan dengan benar agar bisa bypass RLS.

### 2. **Environment Variables**
Pastikan di Netlify environment variables sudah set:
- `SUPABASE_SERVICE_ROLE_KEY` (bukan anon key!)
- `ADMIN_EMAILS` (comma-separated)

### 3. **Potential Issues**
- Service role key salah atau tidak ter-set
- Query error yang di-swallow (return empty array)
- Join dengan `profiles` table gagal karena RLS

## Debug Steps

### Step 1: Cek Environment Variables
Akses: `https://rndpro.netlify.app/api/debug/env`

Expected output:
```json
{
  "env_check": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "SET (hidden)",
    "SUPABASE_SERVICE_ROLE_KEY": "SET (hidden)",
    "ADMIN_EMAILS": "your@email.com",
    "NODE_ENV": "production"
  }
}
```

**Jika `SUPABASE_SERVICE_ROLE_KEY` = "NOT SET":**
- Pergi ke Netlify → Site settings → Environment variables
- Tambahkan `SUPABASE_SERVICE_ROLE_KEY` dengan value dari Supabase → Settings → API → service_role key
- Redeploy

### Step 2: Test Direct Query
Akses: `https://rndpro.netlify.app/api/admin/subscriptions`

Expected output:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "...",
      "user_id": "...",
      "plan_id": "free_trial",
      "status": "trialing",
      ...
    }
  ]
}
```

**Jika ada error:**
- Cek `error` field untuk detail
- Cek `env_check` untuk memastikan service role key ter-set

### Step 3: Cek Server Logs
Di Netlify:
1. Go to **Deploys** → Latest deploy → **Function logs**
2. Look for:
   - `[createAdminClient]` logs
   - `[getAdminSubscriptions]` logs
   - Any error messages

### Step 4: Verify Database
Di Supabase SQL Editor, run:

```sql
-- Check if subscriptions exist
SELECT * FROM subscriptions;

-- Check if profiles exist (needed for join)
SELECT * FROM profiles;

-- Test the exact query used by the app
SELECT 
  s.*,
  p.name as plan_name,
  pr.email,
  pr.full_name
FROM subscriptions s
LEFT JOIN plans p ON s.plan_id = p.id
LEFT JOIN profiles pr ON s.user_id = pr.id
ORDER BY s.created_at DESC
LIMIT 50;
```

## Solutions

### Solution 1: Fix Service Role Key
```bash
# In Netlify environment variables
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-actual-service-role-key
```

**Important:** Service role key berbeda dengan anon key. Harus yang `service_role`.

### Solution 2: Simplify Query (If Join Fails)
Jika join dengan `profiles` gagal, ubah query di `actions.ts`:

```typescript
const { data, error } = await supabase
  .from("subscriptions")
  .select("*, plan:plans(*)")  // Remove profile join
  .order("created_at", { ascending: false })
  .limit(50)
```

### Solution 3: Add RLS Policy for Admin
Jika service role tidak bekerja, tambahkan policy di Supabase SQL Editor:

```sql
-- Allow admin emails to view all subscriptions
CREATE POLICY "Admin can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    auth.email() IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );
```

Tapi ini memerlukan set config di Supabase:
```sql
ALTER DATABASE postgres SET app.admin_emails = 'admin@example.com,other@example.com';
```

### Solution 4: Use Direct SQL Query
Jika semua gagal, gunakan raw SQL:

```typescript
const { data, error } = await supabase.rpc('get_all_subscriptions')
```

Dan buat function di Supabase:
```sql
CREATE OR REPLACE FUNCTION get_all_subscriptions()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  plan_id text,
  status text,
  -- ... other fields
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT 
    s.id,
    s.user_id,
    s.plan_id,
    s.status,
    -- ... other fields
  FROM subscriptions s
  ORDER BY s.created_at DESC
  LIMIT 50;
$$;
```

## Changes Made

### 1. Added Error Logging
- `lib/supabase/server.ts`: Log when creating admin client
- `app/(app)/admin/subscriptions/actions.ts`: Log query errors
- `app/(app)/admin/subscriptions/page.tsx`: Display errors to user

### 2. Added Debug Endpoints
- `/api/debug/env`: Check environment variables
- `/api/admin/subscriptions`: Test direct query

### 3. Improved Error Handling
- Wrap `getAdminSubscriptions()` in try-catch
- Display error messages on page
- Show warning when no data returned

## Next Steps

1. **Test `/api/debug/env`** → Verify service role key is set
2. **Test `/api/admin/subscriptions`** → Verify query works
3. **Check Netlify function logs** → Look for error messages
4. **If still failing** → Try Solution 2 (simplify query) or Solution 4 (raw SQL)

## Files Modified
- `app/(app)/admin/subscriptions/page.tsx` - Added error handling
- `app/(app)/admin/subscriptions/actions.ts` - Added logging
- `lib/supabase/server.ts` - Added logging and auth config
- `app/api/admin/subscriptions/route.ts` - New debug endpoint
- `app/api/debug/env/route.ts` - New env check endpoint

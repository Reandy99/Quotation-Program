# Backend Integration Requirements

**Project**: QuoteFlow Creative  
**Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)  
**Status**: Partially integrated (auth + storage done, CRUD needs completion)

---

## Current Integration Status

### ✅ Already Integrated

| Component | Status | Location |
|---|---|---|
| Supabase client | ✅ Done | `lib/supabase/client.ts`, `lib/supabase/server.ts` |
| Authentication | ✅ Done | Email/password, session management |
| Middleware auth | ✅ Done | `middleware.ts` (route protection) |
| Storage (logos) | ✅ Done | `company-logos` bucket |
| Database schema | ✅ Done | `supabase/schema.sql` (all tables + RLS) |

### ⚠️ Partially Integrated (Needs Completion)

| Component | Current State | Required Action |
|---|---|---|
| Leads CRUD | Demo data in code | Replace with Supabase queries |
| Clients CRUD | Demo data in code | Replace with Supabase queries |
| Quotations CRUD | Demo data in code | Replace with Supabase queries |
| Follow-ups CRUD | Demo data in code | Replace with Supabase queries |
| Company settings | localStorage only | Add DB persistence |
| Dashboard stats | Calculated from demo data | Query from Supabase |

### ❌ Not Integrated (Future)

| Component | Priority | Notes |
|---|---|---|
| Email delivery | Phase 2 | Resend/SendGrid integration |
| Audit logs | Phase 1 | Basic activity tracking |
| Webhooks | Phase 3 | Quote accepted/rejected events |
| File attachments | Phase 2 | Additional storage buckets |

---

## Required Backend Components

### 1. Authentication (✅ Complete)

**Provider**: Supabase Auth  
**Method**: Email/password (magic link optional)

**Configuration**:
```typescript
// lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// lib/supabase/server.ts (server components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  )
}
```

**Required Supabase Settings**:
- Authentication → Providers → Email (enabled)
- Authentication → URL Configuration:
  - Site URL: `https://your-domain.com`
  - Redirect URLs: `https://your-domain.com/auth/callback`

**Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

### 2. Database (⚠️ Schema Done, CRUD Incomplete)

**Provider**: Supabase PostgreSQL  
**Schema**: `supabase/schema.sql` (already created)

**Tables**:
- `profiles` — User profile + company settings
- `leads` — Lead/client records
- `quotations` — Quote headers
- `quotation_items` — Quote line items
- `follow_ups` — Follow-up reminders
- `audit_logs` — Activity tracking (needs implementation)

**Row-Level Security (RLS)**: ✅ Enabled on all tables

**Required Actions**:

#### 2.1 Replace Demo Data with Real Queries

**Current** (demo data):
```typescript
// app/leads/page.tsx
const leads = [
  { id: 1, name: 'John Doe', ... }, // hardcoded
]
```

**Required** (Supabase query):
```typescript
// app/leads/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function LeadsPage() {
  const supabase = createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  
  return <LeadsList leads={leads || []} />
}
```

**Files to Update**:
- `app/leads/page.tsx` — List leads from DB
- `app/leads/new/page.tsx` — Insert lead to DB
- `app/leads/[id]/page.tsx` — Update lead in DB
- `app/quotations/page.tsx` — List quotations from DB
- `app/quotations/new/page.tsx` — Insert quotation + items to DB
- `app/quotations/[id]/page.tsx` — Update quotation in DB
- `app/follow-ups/page.tsx` — List follow-ups from DB
- `app/dashboard/page.tsx` — Query stats from DB

#### 2.2 Add Server Actions for Mutations

Create `app/actions/leads.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLead(formData: FormData) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      status: 'new',
    })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/leads')
  return data
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
  
  if (error) throw error
  
  revalidatePath('/leads')
  revalidatePath('/dashboard')
}
```

Repeat for quotations, follow-ups.

#### 2.3 Persist Company Settings in DB

**Current**: `localStorage` only (lost on device change)

**Required**: Store in `profiles` table

```typescript
// app/actions/settings.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateCompanySettings(settings: {
  company_name?: string
  company_address?: string
  company_phone?: string
  company_email?: string
  tax_rate?: number
  currency?: string
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('profiles')
    .update(settings)
    .eq('id', user.id)
  
  if (error) throw error
}

export async function getCompanySettings() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return data
}
```

Update `app/settings/page.tsx` to use these actions.

---

### 3. Storage (✅ Complete for Logos)

**Provider**: Supabase Storage  
**Bucket**: `company-logos` (public)

**Configuration**:
- Max file size: 2MB
- Allowed types: `image/png`, `image/jpeg`, `image/svg+xml`
- Public access: Yes

**Current Implementation**: ✅ Working in `app/settings/page.tsx`

**Future Buckets** (Phase 2):
- `quotation-attachments` (private, per-user RLS)
- `client-documents` (private, per-user RLS)

---

### 4. API Routes (⚠️ Needs Implementation)

**Current**: None (using server components + actions)

**Required for MVP**: None (server actions sufficient)

**Future** (Phase 2):
- `POST /api/quotations/[id]/send-email` — Email delivery
- `GET /api/quotations/[id]/pdf` — PDF generation endpoint
- `POST /api/webhooks/payment` — Payment provider webhook

---

### 5. Environment Variables

**Required**:
```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# App Config (required)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Email (Phase 2)
RESEND_API_KEY=re_xxx

# Monitoring (optional)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Validation**: Add to `lib/env.ts` (see DEPLOYMENT_GUIDE.md)

---

### 6. Row-Level Security (RLS) Policies

**Status**: ✅ Defined in `supabase/schema.sql`

**Policies Applied**:

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  USING (auth.uid() = user_id);
```

**Applied to**: `profiles`, `leads`, `quotations`, `quotation_items`, `follow_ups`

**Testing RLS**:
```sql
-- In Supabase SQL Editor, test as user:
SET request.jwt.claims.sub = 'user-uuid-here';
SELECT * FROM leads; -- Should only return that user's leads
```

---

### 7. Audit Logs (❌ Not Implemented)

**Required for MVP**: Basic activity tracking

**Schema** (already in `schema.sql`):
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Implementation**:

Create `lib/audit.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  })
}
```

**Usage**:
```typescript
// In server actions
await createLead(formData)
await logActivity('create', 'lead', leadId, { name: leadName })
```

**Priority**: Phase 1 (basic), Phase 2 (detailed)

---

### 8. Error Handling

**Required**:

#### 8.1 Toast Notifications

Install: `npm install sonner`

Add to `app/layout.tsx`:
```typescript
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

Use in client components:
```typescript
'use client'
import { toast } from 'sonner'

async function handleSubmit() {
  try {
    await createLead(formData)
    toast.success('Lead created successfully')
  } catch (error) {
    toast.error('Failed to create lead')
  }
}
```

#### 8.2 Error Boundaries

Add `app/error.tsx` (see DEPLOYMENT_GUIDE.md)

#### 8.3 Supabase Error Handling

```typescript
const { data, error } = await supabase.from('leads').select()

if (error) {
  console.error('Database error:', error)
  
  // User-friendly messages
  if (error.code === 'PGRST116') {
    throw new Error('No data found')
  } else if (error.code === '23505') {
    throw new Error('Duplicate entry')
  } else {
    throw new Error('Database error occurred')
  }
}
```

---

## Admin Dashboard & Database Access

### Option 1: Supabase Studio (Recommended)

**Access**: https://supabase.com/dashboard/project/xxxxx

**Features**:
- Table Editor (view/edit all data)
- SQL Editor (run queries)
- Authentication (manage users)
- Storage (manage files)
- Database (schema, indexes, backups)
- Logs (API, database, auth logs)

**Access Control**:
- **Owner**: Full access (you)
- **Collaborators**: Invite team members (Settings → Team)
- **Roles**: Owner, Admin, Developer, Read-only

**Best Practice**:
- Owner: Business owner (you)
- Admin: Technical lead (can modify schema)
- Developer: Engineers (can view data, run queries)
- Read-only: Support staff (view only)

### Option 2: Custom Admin Panel (Future)

Build in-app admin at `/admin`:
- User management
- Data export
- System health
- Audit log viewer

**Not needed for MVP** — Supabase Studio is sufficient.

### Option 3: Direct PostgreSQL Access

**Connection String**: Supabase → Settings → Database → Connection String

**Tools**:
- pgAdmin (GUI)
- psql (CLI)
- DBeaver (GUI)
- TablePlus (GUI, paid)

**Use Case**: Complex queries, bulk operations, migrations

**Security**: Only use from trusted IPs, never commit connection strings.

---

## Integration Checklist

### Phase 0: Deployment Scaffolding
- [x] Supabase project created
- [x] Database schema deployed
- [x] RLS policies enabled
- [x] Storage bucket configured
- [x] Environment variables set
- [ ] Smoke test passed

### Phase 1: MVP Backend Integration
- [ ] Replace leads demo data with Supabase queries
- [ ] Replace quotations demo data with Supabase queries
- [ ] Replace follow-ups demo data with Supabase queries
- [ ] Persist company settings in DB (not localStorage)
- [ ] Add server actions for all CRUD operations
- [ ] Implement basic audit logs
- [ ] Add toast notifications (sonner)
- [ ] Add error boundaries
- [ ] Test RLS policies with multiple users
- [ ] Dashboard stats query from DB

### Phase 2: Production Hardening
- [ ] Email delivery integration (Resend)
- [ ] File attachments storage bucket
- [ ] Webhook endpoints for external integrations
- [ ] Advanced audit logs (detailed metadata)
- [ ] Custom admin panel (optional)
- [ ] Database backups automated
- [ ] Monitoring alerts (Sentry)

---

## VPS Requirements

### Answer: No VPS Needed ✅

**Recommended Architecture**:
- **Frontend + API**: Vercel (serverless, auto-scaling)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (S3-compatible)
- **Auth**: Supabase Auth (managed)

**Why No VPS**:
1. Vercel handles Next.js deployment (serverless functions for API routes)
2. Supabase handles database, auth, storage (fully managed)
3. Auto-scaling included (no capacity planning)
4. Zero DevOps overhead (no server maintenance)
5. Cost-effective for Indonesia SMB ($0-50/month vs $50-200/month for VPS + managed DB)

**When You Might Need VPS**:
- Regulatory requirement to host in Indonesia (use AWS Jakarta + RDS)
- Need to self-host Supabase (not recommended)
- Integrating with on-premise systems (use VPS as bridge)

**For 99% of SaaS use cases**: Vercel + Supabase is the right choice.

---

## Cost Estimate (Backend)

### Free Tier (0-50 users)
- Supabase: $0/month (500MB DB, 1GB storage, 50K MAU)
- Vercel: $0/month (100GB bandwidth)
- **Total: $0/month**

### Growth Tier (50-500 users)
- Supabase Pro: $25/month (8GB DB, 100GB storage, 100K MAU)
- Vercel: $0-20/month (Pro optional)
- Resend: $0-20/month (email)
- **Total: $25-65/month**

### Scale Tier (500+ users)
- Supabase Pro: $25/month + overages (~$10-30/month)
- Vercel Pro: $20/month
- Resend Pro: $20/month
- **Total: $75-100/month**

**Indonesia Context**: Start free, upgrade at 50+ active users. Most SMB SaaS stay under $50/month for first year.

---

## Next Steps

1. **Complete Phase 1 CRUD integration** (see MVP_DEPLOYABLE_CHECKLIST.md)
2. **Test with real users** (5-10 beta testers)
3. **Monitor Supabase usage** (Dashboard → Usage)
4. **Plan Phase 2 features** (email, attachments, webhooks)

---

**Related Docs**:
- DEPLOYMENT_GUIDE.md — Step-by-step deployment
- MVP_DEPLOYABLE_CHECKLIST.md — Task breakdown
- PRODUCT_READINESS_AUDIT.md — Feature audit

# MVP Deployable Checklist

**Project**: QuoteFlow Creative  
**Target**: Production-ready MVP for Indonesia SMB market  
**Timeline**: Phase 0 (today) → Phase 1 (1-2 weeks) → Phase 2 (1-2 months)

---

## Phase 0: Deployment Scaffolding (Today, ~2 hours)

**Goal**: Get app deployed to production with smoke test passing

### Infrastructure Setup

- [ ] **Create Supabase project**
  - Region: Singapore (ap-southeast-1)
  - Save database password securely
  - Note: Free tier (500MB DB, 1GB storage, 50K MAU)

- [ ] **Deploy database schema**
  - Go to SQL Editor in Supabase
  - Run `supabase/schema.sql`
  - Verify tables created: profiles, leads, quotations, quotation_items, follow_ups, audit_logs
  - Verify RLS policies enabled (check Table Editor → RLS tab)

- [ ] **Configure storage bucket**
  - Create bucket: `company-logos`
  - Set public: Yes
  - Max file size: 2MB
  - Allowed MIME: image/png, image/jpeg, image/svg+xml

- [ ] **Get API credentials**
  - Settings → API
  - Copy Project URL
  - Copy anon/public key
  - Save to `.env.local`

### Deployment

- [ ] **Push to GitHub**
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin <your-repo-url>
  git push -u origin main
  ```

- [ ] **Deploy to Vercel**
  - Import from GitHub
  - Add environment variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
  - Deploy

- [ ] **Smoke test**
  - Visit production URL
  - Sign up with test email
  - Verify user appears in Supabase → Authentication
  - Create test lead (will be demo data for now)
  - Upload company logo
  - Verify file in Supabase → Storage → company-logos
  - Generate test PDF quotation
  - Logout and login again

**Exit Criteria**: All smoke tests pass ✅

---

## Phase 1: MVP Backend Integration (1-2 weeks)

**Goal**: Replace all demo data with real Supabase CRUD, persist settings, add error handling

### 1.1 Environment & Error Handling (~2 hours)

- [ ] **Create `lib/env.ts`**
  ```typescript
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ] as const;
  
  export function validateEnv() {
    const missing = required.filter(k => !process.env[k]);
    if (missing.length) throw new Error(`Missing: ${missing.join(', ')}`);
  }
  ```

- [ ] **Call `validateEnv()` in `app/layout.tsx`** (server component)

- [ ] **Add error boundary `app/error.tsx`**
  ```typescript
  'use client';
  export default function Error({ error, reset }) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <button onClick={reset}>Try again</button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Install toast library**
  ```bash
  npm install sonner
  ```

- [ ] **Add `<Toaster />` to `app/layout.tsx`**
  ```typescript
  import { Toaster } from 'sonner'
  // In body: <Toaster position="top-right" />
  ```

### 1.2 Leads CRUD (~4 hours)

- [ ] **Create `app/actions/leads.ts`**
  - `createLead(formData)` — Insert to DB
  - `updateLead(id, data)` — Update in DB
  - `updateLeadStatus(id, status)` — Update status
  - `deleteLead(id)` — Delete from DB
  - Add `revalidatePath('/leads')` after mutations

- [ ] **Update `app/leads/page.tsx`**
  - Remove demo data
  - Query from Supabase:
    ```typescript
    const supabase = createClient()
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    ```

- [ ] **Update `app/leads/new/page.tsx`**
  - Call `createLead()` server action
  - Add toast on success/error
  - Redirect to `/leads` on success

- [ ] **Update `app/leads/[id]/page.tsx`**
  - Fetch lead by ID from DB
  - Call `updateLead()` on form submit
  - Add toast notifications

- [ ] **Test**
  - Create new lead → verify in Supabase Table Editor
  - Edit lead → verify changes persist
  - Change status → verify update
  - Delete lead → verify removed from DB
  - Test with 2 different users → verify RLS (each sees only their leads)

### 1.3 Quotations CRUD (~6 hours)

- [ ] **Create `app/actions/quotations.ts`**
  - `createQuotation(data)` — Insert quotation + items (transaction)
  - `updateQuotation(id, data)` — Update quotation + items
  - `updateQuotationStatus(id, status)` — Update status
  - `deleteQuotation(id)` — Delete (cascade to items)
  - `getNextQuoteNumber()` — Generate QF-YYYY-NNN

- [ ] **Update `app/quotations/page.tsx`**
  - Query quotations with lead info:
    ```typescript
    const { data: quotations } = await supabase
      .from('quotations')
      .select('*, leads(name, company)')
      .order('created_at', { ascending: false })
    ```

- [ ] **Update `app/quotations/new/page.tsx`**
  - Fetch leads for dropdown (from DB)
  - Call `createQuotation()` with line items
  - Handle transaction (quotation + items inserted together)
  - Toast + redirect on success

- [ ] **Update `app/quotations/[id]/page.tsx`**
  - Fetch quotation with items:
    ```typescript
    const { data: quotation } = await supabase
      .from('quotations')
      .select('*, quotation_items(*), leads(*)')
      .eq('id', id)
      .single()
    ```
  - Call `updateQuotation()` on edit
  - Keep PDF generation working

- [ ] **Test**
  - Create quotation with 3 line items → verify in DB
  - Edit quotation → verify items updated
  - Change status to "sent" → verify update
  - Generate PDF → verify data from DB
  - Delete quotation → verify items cascade deleted
  - Test RLS with 2 users

### 1.4 Follow-ups CRUD (~3 hours)

- [ ] **Create `app/actions/follow-ups.ts`**
  - `createFollowUp(data)` — Insert to DB
  - `updateFollowUp(id, data)` — Update
  - `markFollowUpComplete(id)` — Set completed_at
  - `deleteFollowUp(id)` — Delete

- [ ] **Update `app/follow-ups/page.tsx`**
  - Query follow-ups with lead/quotation info:
    ```typescript
    const { data: followUps } = await supabase
      .from('follow_ups')
      .select('*, leads(name), quotations(quote_number)')
      .order('due_date', { ascending: true })
    ```
  - Group by overdue/today/upcoming (client-side)

- [ ] **Add follow-up creation in quotation flow**
  - After creating quotation, optionally create follow-up
  - Default due date: +3 days

- [ ] **Test**
  - Create follow-up → verify in DB
  - Mark complete → verify completed_at set
  - View overdue/today/upcoming → verify filtering
  - Test RLS

### 1.5 Company Settings Persistence (~2 hours)

- [ ] **Create `app/actions/settings.ts`**
  - `updateCompanySettings(settings)` — Update profiles table
  - `getCompanySettings()` — Fetch from profiles

- [ ] **Update `app/settings/page.tsx`**
  - Fetch settings from DB on load
  - Remove localStorage usage
  - Call `updateCompanySettings()` on save
  - Keep logo upload working (already uses Supabase Storage)

- [ ] **Update `profiles` table usage**
  - Ensure profile row created on signup (trigger in schema.sql already exists)
  - Verify default values set

- [ ] **Test**
  - Update company name → verify in DB
  - Logout and login → verify settings persist
  - Change device → verify settings available
  - Test with 2 users → verify isolation

### 1.6 Dashboard Stats from DB (~2 hours)

- [ ] **Update `app/dashboard/page.tsx`**
  - Query real stats:
    ```typescript
    // Total leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
    
    // Active quotations
    const { count: activeQuotes } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'sent'])
    
    // Pending follow-ups
    const { count: pendingFollowUps } = await supabase
      .from('follow_ups')
      .select('*', { count: 'exact', head: true })
      .is('completed_at', null)
    
    // Recent activity (last 10)
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    ```

- [ ] **Test**
  - Verify stats match Table Editor counts
  - Create new lead → verify dashboard updates
  - Test with empty state (new user)

### 1.7 Basic Audit Logs (~3 hours)

- [ ] **Create `lib/audit.ts`**
  ```typescript
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

- [ ] **Add logging to key actions**
  - Lead created/updated/deleted
  - Quotation created/updated/status changed
  - Follow-up created/completed
  - Settings updated

- [ ] **Create audit log viewer** (optional, can use Supabase Table Editor)
  - `app/admin/audit-logs/page.tsx`
  - List recent activity with filters

- [ ] **Test**
  - Perform actions → verify logs in audit_logs table
  - Check metadata captured correctly

### 1.8 Production Build & Security (~2 hours)

- [ ] **Update `next.config.js`**
  ```javascript
  module.exports = {
    images: {
      domains: ['xxxxx.supabase.co'],
    },
    compress: true,
    poweredByHeader: false,
  };
  ```

- [ ] **Add security headers to `middleware.ts`**
  ```typescript
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  ```

- [ ] **Test production build locally**
  ```bash
  npm run build
  npm run start
  ```
  - Check for TypeScript errors
  - Check for build warnings
  - Test all pages load
  - Test all CRUD operations

- [ ] **Deploy to Vercel**
  - Push to main branch
  - Verify auto-deploy succeeds
  - Run smoke test on production

- [ ] **Enable Vercel Analytics**
  - Project Settings → Analytics → Enable
  - Free tier: 2500 events/month

### 1.9 Testing & Validation (~4 hours)

- [ ] **Multi-user RLS testing**
  - Create 2 test accounts
  - User A creates lead → User B should NOT see it
  - User A creates quotation → User B should NOT see it
  - Verify all tables enforce RLS

- [ ] **Edge cases**
  - Empty states (new user, no data)
  - Large datasets (100+ leads)
  - Long text fields (descriptions, notes)
  - Special characters in names
  - Invalid email formats
  - Duplicate quote numbers (should not happen)

- [ ] **Error scenarios**
  - Network failure (offline)
  - Invalid form data
  - Database constraint violations
  - File upload failures
  - Session expiry

- [ ] **Performance**
  - Dashboard loads < 2s
  - Lead list loads < 1s
  - Quotation creation < 3s
  - PDF generation < 5s

**Exit Criteria**: All CRUD operations use real DB, settings persist, error handling works, RLS tested ✅

---

## Phase 2: Production Hardening (1-2 months)

**Goal**: Email delivery, multi-tenant, billing, advanced features

### 2.1 Email Quotation Delivery (~1 week)

- [ ] **Sign up for Resend** (free: 3000 emails/month)
- [ ] **Verify domain** in Resend dashboard
- [ ] **Add `RESEND_API_KEY` to environment**
- [ ] **Install Resend SDK**
  ```bash
  npm install resend
  ```
- [ ] **Create email template** (`emails/quotation.tsx`)
- [ ] **Create API route** `app/api/quotations/[id]/send/route.ts`
- [ ] **Add "Send Email" button** to quotation detail page
- [ ] **Test** email delivery with real email addresses

### 2.2 File Attachments (~3 days)

- [ ] **Create storage bucket** `quotation-attachments` (private)
- [ ] **Add RLS policies** for per-user access
- [ ] **Add file upload** to quotation form
- [ ] **Store file references** in quotation_items or new table
- [ ] **Include attachments** in PDF export
- [ ] **Test** upload, download, delete

### 2.3 Multi-Tenant & Team Access (~2 weeks)

- [ ] **Add `organizations` table**
- [ ] **Add `organization_members` table** (user-org mapping)
- [ ] **Update RLS policies** to check organization membership
- [ ] **Add team invitation** flow
- [ ] **Add role-based permissions** (owner, admin, member)
- [ ] **Test** multi-user collaboration

### 2.4 Billing Integration (~1 week)

- [ ] **Choose payment provider** (Stripe, Xendit for Indonesia)
- [ ] **Define pricing tiers** (free, pro, enterprise)
- [ ] **Add `subscriptions` table**
- [ ] **Implement checkout flow**
- [ ] **Add webhook handler** for payment events
- [ ] **Enforce usage limits** based on plan
- [ ] **Test** subscription lifecycle

### 2.5 Advanced Features (~2 weeks)

- [ ] **Quotation templates** (save reusable line item packages)
- [ ] **Client portal** (shareable link for quote view/accept)
- [ ] **Invoice generation** (convert accepted quotes)
- [ ] **Payment tracking** (mark invoices paid)
- [ ] **Analytics dashboard** (revenue charts, conversion rates)
- [ ] **Mobile-responsive sidebar**
- [ ] **Dark mode**

### 2.6 Monitoring & Alerts (~3 days)

- [ ] **Set up Sentry** (error tracking)
- [ ] **Configure Supabase alerts** (usage thresholds)
- [ ] **Add health check endpoint** `/api/health`
- [ ] **Set up uptime monitoring** (UptimeRobot, free)
- [ ] **Create runbook** for common issues

---

## Definition of Done: MVP

An MVP is deployable when:

### Functional Requirements
- ✅ Real authentication (email/password, session management)
- ✅ Protected routes (middleware enforces auth)
- ✅ All CRUD operations use Supabase (no demo data)
- ✅ Company settings persist in DB (not localStorage)
- ✅ RLS policies tested with multiple users
- ✅ Dashboard shows real stats from DB
- ✅ PDF generation works with DB data
- ✅ Logo upload works (Supabase Storage)
- ✅ Basic audit logs implemented

### Technical Requirements
- ✅ Environment variables validated on startup
- ✅ Error boundaries catch React errors
- ✅ Toast notifications for user feedback
- ✅ Production build succeeds with no errors
- ✅ Security headers configured
- ✅ Vercel Analytics enabled
- ✅ Supabase RLS enabled on all tables

### Testing Requirements
- ✅ Smoke test passes on production
- ✅ Multi-user RLS tested (data isolation verified)
- ✅ Edge cases handled (empty states, errors)
- ✅ Performance acceptable (< 3s page loads)

### Documentation Requirements
- ✅ DEPLOYMENT_GUIDE.md complete
- ✅ BACKEND_INTEGRATION_REQUIREMENTS.md complete
- ✅ MVP_DEPLOYABLE_CHECKLIST.md complete
- ✅ README.md updated with deployment instructions

---

## Estimated Effort

### Phase 0: Deployment Scaffolding
- **Time**: 2 hours
- **Complexity**: Low
- **Blockers**: None

### Phase 1: MVP Backend Integration
- **Time**: 25-30 hours (1-2 weeks part-time)
- **Complexity**: Medium
- **Blockers**: None (all dependencies available)

**Breakdown**:
- Environment & error handling: 2h
- Leads CRUD: 4h
- Quotations CRUD: 6h
- Follow-ups CRUD: 3h
- Settings persistence: 2h
- Dashboard stats: 2h
- Audit logs: 3h
- Production build: 2h
- Testing: 4h

### Phase 2: Production Hardening
- **Time**: 40-60 hours (1-2 months part-time)
- **Complexity**: High
- **Blockers**: Requires Phase 1 complete

---

## Success Metrics

### Phase 0
- [ ] Production URL accessible
- [ ] Smoke test passes

### Phase 1 (MVP)
- [ ] 5-10 beta users onboarded
- [ ] 50+ leads created in production
- [ ] 20+ quotations generated
- [ ] 0 critical bugs reported
- [ ] < 3s average page load time
- [ ] 99%+ uptime (Vercel + Supabase)

### Phase 2
- [ ] 100+ active users
- [ ] Email delivery 95%+ success rate
- [ ] 10+ paying customers (if billing implemented)
- [ ] < 1% error rate (Sentry)

---

## Risk Mitigation

### Risk: RLS policies too restrictive
- **Mitigation**: Test with 2+ users in Phase 1
- **Fallback**: Adjust policies in Supabase SQL Editor

### Risk: Supabase free tier limits exceeded
- **Mitigation**: Monitor usage in dashboard
- **Fallback**: Upgrade to Pro ($25/month) at 50+ users

### Risk: PDF generation fails with DB data
- **Mitigation**: Test PDF in Phase 1.3
- **Fallback**: Debug with sample data, check data types

### Risk: Performance issues with large datasets
- **Mitigation**: Add pagination (limit 50 per page)
- **Fallback**: Add database indexes on frequently queried columns

### Risk: Deployment fails on Vercel
- **Mitigation**: Test `npm run build` locally first
- **Fallback**: Check Vercel logs, verify environment variables

---

## Next Steps

1. **Start Phase 0 today** (2 hours)
   - Create Supabase project
   - Deploy schema
   - Deploy to Vercel
   - Run smoke test

2. **Begin Phase 1 this week** (1-2 weeks)
   - Start with environment validation + error handling
   - Then tackle CRUD in order: leads → quotations → follow-ups
   - Test RLS continuously

3. **Plan Phase 2** (after Phase 1 complete)
   - Gather user feedback from beta testers
   - Prioritize features based on demand
   - Consider billing integration timing

---

**Related Docs**:
- DEPLOYMENT_GUIDE.md — Step-by-step deployment instructions
- BACKEND_INTEGRATION_REQUIREMENTS.md — Detailed backend setup
- PRODUCT_READINESS_AUDIT.md — Feature audit and gaps

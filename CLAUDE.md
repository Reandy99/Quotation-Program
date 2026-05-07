# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type-check without emitting
```

No test suite is configured. Validate changes by running the dev server and testing in browser.

## Architecture

**QuoteFlow Creative** is a SaaS for creative vendors (photographers, videographers) to manage leads, quotations, invoices, follow-ups, and billing.

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase (Auth + PostgreSQL + Storage) · @react-pdf/renderer

### Route Groups

- `app/(app)/` — Protected routes (requires auth). Layout in `app/(app)/layout.tsx` wraps all pages with `Sidebar`, `SettingsHydrator`, and `NotificationBell`.
- `app/(auth)/` — Public routes: `/login`, `/signup`
- `app/api/` — Route handlers (admin subscriptions, notifications, debug env)

### Page Pattern

Every feature follows this consistent pattern:
```
app/(app)/<feature>/
  page.tsx          ← Server Component: fetches initial data, passes to Client
  *Client.tsx        ← Client Component: interactive UI, calls actions
  actions.ts         ← Server Actions ("use server"): mutations + queries
  loading.tsx        ← Suspense fallback
```

### Supabase Clients

- `lib/supabase/server.ts → createClient()` — Cookie-based SSR client for Server Components and Server Actions. Has a preview mode mock when `NEXT_PUBLIC_SUPABASE_URL` contains `localhost`.
- `lib/supabase/server.ts → createAdminClient()` — Service role client (bypasses RLS). Requires `SUPABASE_SERVICE_ROLE_KEY`. Only used in admin API routes.
- `lib/supabase/client.ts` — Browser client for Client Components.

All tables use `user_id = auth.uid()` RLS policies — data is always user-scoped. Never query without the RLS filter active.

### Settings Architecture

Settings have a two-layer caching design:
1. **Server source of truth**: `company_settings` table in Supabase (one row per user)
2. **Client-side cache**: `localStorage` via `lib/settings/storage.ts` (`quoteflow_general_settings`, `quoteflow_company_settings`, `quoteflow_packages`)

On each page load, the `(app)` layout fetches settings server-side and passes them to `SettingsHydrator`, which syncs them to `localStorage`. Client components then read from `localStorage` via `lib/settings/useLiveSettings.ts`. After mutations, dispatch `quoteflow:settings-updated` event to sync UI without reload.

### Billing / Feature Gating

- Subscriptions tracked in `subscriptions` table (`SubscriptionStatus`: `trialing | active | expired | cancelled | past_due`)
- `lib/billing/feature-gate.ts → canUseFeature()` — gates write operations; `trialing` and `active` are the only allowed statuses for mutations
- `components/billing/UpgradeBanner.tsx` — shown when subscription is expired/cancelled

### Key Utilities

- `lib/utils/audit.ts` — Logs all mutations to `audit_logs` table
- `lib/utils/quote-number.ts` — Generates quote numbers in `QF-YYYY-NNN` format
- `lib/utils/format.ts` — Currency (IDR), date formatting
- `lib/utils/whatsapp.ts` — WhatsApp deep-link template builder
- `lib/validations/` — Zod schemas for leads, quotations, company settings

### PDF Generation

`@react-pdf/renderer` components (`components/quotations/QuotationPDF.tsx`, `components/invoices/InvoicePDF.tsx`) are client-only. Wrap in `<PDFDownloadLink>` — never render on server.

### Database Migrations

Migrations live in `supabase/migrations/`. Run them in Supabase SQL Editor in order. The latest migrations add columns to `company_settings`:
- `20260502_add_invoice_branding_fields.sql` — signer/signature/google_review fields
- `20260505_add_general_and_package_settings.sql` — general settings + service_packages JSONB column

If you see `schema cache` or `Could not find the` errors in settings actions, the corresponding migration hasn't been applied yet.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Public anon key
SUPABASE_SERVICE_ROLE_KEY     # Service role key (server-only, admin ops)
```

See `.env.local.example` for the full template.

### Types

All shared types are in `types/index.ts`. Key domain types: `Lead`, `Quotation`, `QuotationItem`, `Invoice`, `Payment`, `FollowUp`, `Client`, `CompanySettings`, `GeneralSettings`, `ServicePackage`, `Subscription`, `Plan`.

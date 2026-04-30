# QuoteFlow Creative

A SaaS MVP for photographers, videographers, and creative service vendors to manage leads, create professional quotations, generate PDF exports, and follow up with clients.

---

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 2. Clone & Install

```bash
git clone <your-repo>
cd quoteflow-creative
npm install
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in your Supabase project: **Settings → API**.

### 4. Database Setup

1. Go to your Supabase project → **SQL Editor**
2. Run the contents of `supabase/schema.sql`
3. This creates all tables, RLS policies, and the storage bucket

### 5. Seed Sample Data (Optional)

1. Sign up in the app first to get your user ID
2. Find your user ID in Supabase → **Authentication → Users**
3. Replace `YOUR_USER_ID` in `supabase/seed.sql`
4. Run the seed SQL in the SQL Editor

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## Features Done ✅

| Feature | Status |
|---|---|
| Email/password authentication | ✅ |
| Protected routes with middleware | ✅ |
| Company profile settings | ✅ |
| Logo upload to Supabase Storage | ✅ |
| Leads CRUD (create, view, edit, delete) | ✅ |
| Lead status management | ✅ |
| Quotation builder with line items | ✅ |
| Auto-generated quote numbers (QF-YYYY-NNN) | ✅ |
| Discount (flat/percent) + tax calculation | ✅ |
| PDF quotation export | ✅ |
| Follow-up tracker (overdue/today/upcoming) | ✅ |
| WhatsApp message templates (3 templates) | ✅ |
| Dashboard with stats and recent activity | ✅ |
| Row-level security on all tables | ✅ |
| Sample seed data | ✅ |

## Features Not Yet Done ❌

| Feature | Notes |
|---|---|
| Email notifications | Send quotation via email directly |
| Quotation preview (in-browser) | Currently download-only |
| Lead import (CSV) | Bulk import leads |
| Multi-currency support | Currently IDR only |
| Client portal | Let clients view/accept quotes online |
| Invoice generation | Convert accepted quotes to invoices |
| Payment tracking | Mark invoices as paid |
| Mobile-responsive sidebar | Currently desktop-first |
| Dark mode | Not implemented |
| Team/multi-user per account | Single user per account |

---

## Recommended Next Improvements

1. **Email quotation delivery** — Integrate Resend or SendGrid to send PDF quotes directly from the app
2. **Client portal** — Generate a shareable link where clients can view and accept/reject quotations
3. **Invoice module** — Convert accepted quotations to invoices with payment status tracking
4. **Mobile layout** — Add a collapsible sidebar and mobile-optimized views
5. **Quotation templates** — Save reusable line item packages (e.g. "Wedding Package", "Corporate Event Package")
6. **Analytics** — Monthly revenue charts, conversion rate from lead to won

---

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (custom shadcn-style components)
- **Auth & Database**: Supabase (PostgreSQL + RLS)
- **Storage**: Supabase Storage
- **Forms**: React Hook Form + Zod
- **PDF**: @react-pdf/renderer
- **Deployment**: Vercel

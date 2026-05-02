# QuoteFlow Creative - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase project (free tier works fine)
- Git repository (for Vercel deployment)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd quoteflow-creative
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy the **Project URL** and **anon/public key**

### 3. Database Setup

Run the following SQL scripts in your Supabase SQL Editor (in order):

1. **Main Schema**: Run `supabase/schema.sql`
2. **Clients & Invoices**: Run `supabase/migrations/002_clients_invoices.sql`
3. **Follow-ups**: Run `supabase/migrations/003_follow_ups.sql`
4. **Audit Logs** (optional): Run `supabase/migrations/001_audit_logs.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build Verification

Before deploying, verify the build works:

```bash
npm run build
```

**Note:** The build will fail if environment variables are missing. This is expected and correct behavior.

## Production Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **"Deploy"**

### 3. Post-Deployment

1. Visit your deployed URL
2. Sign up for an account
3. Complete your company profile in Settings
4. Start adding leads and creating quotations

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public key |

## Database Migrations

All migrations are in `supabase/migrations/`:

- `001_audit_logs.sql` - Audit logging (optional)
- `002_clients_invoices.sql` - Clients and invoices tables
- `003_follow_ups.sql` - Follow-ups tracking

Run these in your Supabase SQL Editor after the main schema.

## Troubleshooting

### Build fails with "Environment validation failed"

This is expected if `.env.local` is missing or incomplete. Ensure you have:
- Created `.env.local` file
- Added both required environment variables
- Values are correct (no quotes, no trailing spaces)

### "Failed to fetch" errors in production

Check that:
- Environment variables are set in Vercel dashboard
- Supabase project is active
- RLS policies are correctly configured

### Authentication not working

Verify:
- Supabase URL and anon key are correct
- Email confirmation is disabled in Supabase Auth settings (for testing)
- Site URL is configured in Supabase Auth settings

## Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Use environment variables in Vercel for production
- Keep your Supabase service role key secret (not used in this app)
- RLS policies protect all data at the database level

## Support

For issues or questions:
- Check the README.md for feature documentation
- Review Supabase logs for database errors
- Check browser console for client-side errors

This guide covers deploying QuoteFlow Creative to production with Supabase and Vercel.

---

## Prerequisites

- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization
4. Enter project details:
   - **Name**: `quoteflow-creative` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
5. Click **Create new project** and wait for provisioning (~2 minutes)

### 1.2 Run Database Migrations

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the contents of `supabase/schema.sql` from your repository
4. Click **Run** to execute the schema
5. Repeat for `supabase/migrations/001_audit_logs.sql`
6. Repeat for `supabase/migrations/002_clients_invoices.sql`

You should see success messages. Your database tables, RLS policies, and storage bucket are now created.

### 1.3 Get Your Supabase Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

Keep these handy for the next step.

---

## Step 2: Deploy to Vercel

### 2.1 Import Your Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

### 2.2 Configure Environment Variables

Before deploying, add your environment variables:

1. In the **Environment Variables** section, add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |

2. Make sure these are set for **Production**, **Preview**, and **Development** environments

### 2.3 Deploy

1. Click **Deploy**
2. Wait for the build to complete (~2-3 minutes)
3. Once deployed, click **Visit** to open your live app

---

## Step 3: Test Your Deployment

### 3.1 Create Your First User

1. Visit your deployed app
2. Click **Sign up**
3. Enter your email and password (min. 8 characters)
4. You'll be redirected to the dashboard

### 3.2 Verify Database Connection

1. Go to **Settings** → **Company** in your app
2. Fill in your business details
3. Click **Save Settings**
4. Go back to Supabase → **Table Editor** → `company_settings`
5. You should see your saved data

### 3.3 Create Test Data

1. Create a lead from **Leads** → **New Lead**
2. Create a client from **Clients** → **New Client**
3. Verify data appears in Supabase **Table Editor**

---

## Step 4: Optional Seed Data

If you want to start with sample data:

1. In Supabase, go to **Authentication** → **Users**
2. Find your user ID (UUID)
3. Open `supabase/seed.sql` in your code editor
4. Replace `YOUR_USER_ID` with your actual user ID
5. Run the modified seed.sql in Supabase **SQL Editor**

---

## Environment Variables Reference

### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Where to Find Them

- **Supabase Dashboard** → **Settings** → **API**
- The `NEXT_PUBLIC_` prefix makes them available in the browser
- Never commit these to Git (they're in `.gitignore`)

---

## Troubleshooting

### Build Fails with "Environment validation failed"

**Cause**: Missing or invalid environment variables

**Fix**:
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Verify both variables are set correctly
3. Redeploy from **Deployments** tab

### "Unauthorized" or "RLS policy violation" errors

**Cause**: Row Level Security policies not applied

**Fix**:
1. Go to Supabase **SQL Editor**
2. Re-run `supabase/schema.sql` to ensure all policies are created
3. Check **Authentication** → **Policies** to verify RLS is enabled

### Users can't sign up

**Cause**: Email confirmation might be required

**Fix**:
1. Go to Supabase → **Authentication** → **Settings**
2. Under **Email Auth**, disable "Confirm email" for testing
3. Or configure an email provider (SendGrid, etc.) for production

### Data not saving

**Cause**: RLS policies or missing user session

**Fix**:
1. Check browser console for errors
2. Verify you're logged in (check sidebar for your email)
3. Check Supabase **Logs** → **Postgres Logs** for SQL errors

---

## Production Checklist

Before going live:

- [ ] Database schema applied (`schema.sql` + migrations)
- [ ] Environment variables set in Vercel
- [ ] Test signup/login flow
- [ ] Test creating leads, clients, quotations
- [ ] Test company settings save
- [ ] Enable email confirmation in Supabase (optional)
- [ ] Configure custom domain in Vercel (optional)
- [ ] Set up Supabase backups (automatic on paid plans)

---

## Next Steps

- **Email Notifications**: Integrate Resend or SendGrid to send quotations via email
- **File Uploads**: Enable Supabase Storage for logo and signature uploads
- **Custom Domain**: Add your domain in Vercel → **Settings** → **Domains**
- **Analytics**: Add Vercel Analytics or Google Analytics

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

For issues specific to QuoteFlow Creative, check the README.md or open an issue in your repository.

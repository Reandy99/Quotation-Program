# QuoteFlow Creative - Deployment Checklist

Use this checklist to verify your deployment is complete and functional.

---

## Pre-Deployment Checklist

### Code & Configuration
- [ ] `@netlify/plugin-nextjs` installed in devDependencies
- [ ] `netlify.toml` includes `[[plugins]]` section
- [ ] `.env.local` exists locally with Supabase credentials
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npm run lint`

### Netlify Setup
- [ ] Repository connected to Netlify
- [ ] Build command: `npm run build`
- [ ] Environment variables set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Netlify Next.js plugin enabled (auto-detected or manual)

### Supabase Setup
- [ ] Supabase project created
- [ ] Database migrations run (in order):
  - [ ] `supabase/schema.sql`
  - [ ] `supabase/migrations/002_clients_invoices.sql`
  - [ ] `supabase/migrations/003_follow_ups.sql`
  - [ ] `supabase/migrations/20260502_add_invoice_branding_fields.sql`
- [ ] Storage bucket `company-logos` created
- [ ] Storage bucket set to public
- [ ] RLS policies enabled on all tables

---

## Post-Deployment Verification

### Public Pages
- [ ] Landing page loads: `https://rndpro.netlify.app`
- [ ] Login page loads: `https://rndpro.netlify.app/login`
- [ ] Signup page loads: `https://rndpro.netlify.app/signup`
- [ ] No console errors on public pages

### Authentication
- [ ] Can create new account
- [ ] Receives confirmation email (if enabled)
- [ ] Can log in with credentials
- [ ] Redirects to dashboard after login
- [ ] Can log out
- [ ] Protected routes redirect to login when logged out

### Dashboard
- [ ] Dashboard loads without errors
- [ ] Stats cards display (even if zero)
- [ ] Recent activity section displays
- [ ] Navigation sidebar works
- [ ] User menu works
- [ ] Notification bell works

### Leads
- [ ] Can view leads list: `/leads`
- [ ] Can create new lead: `/leads/new`
- [ ] Lead form validation works
- [ ] Lead saves successfully
- [ ] Can view lead detail: `/leads/[id]`
- [ ] Can edit lead
- [ ] Can delete lead
- [ ] Can change lead status

### Clients
- [ ] Can view clients list: `/clients`
- [ ] Can create new client: `/clients/new`
- [ ] Client saves successfully
- [ ] Can view client detail: `/clients/[id]`
- [ ] Can edit client
- [ ] Can delete client

### Quotations
- [ ] Can view quotations list: `/quotations`
- [ ] Can create new quotation: `/quotations/new`
- [ ] Can add line items
- [ ] Subtotal calculates correctly
- [ ] Discount applies correctly (flat and percent)
- [ ] Tax calculates correctly
- [ ] Grand total is correct
- [ ] Quotation saves successfully
- [ ] Can view quotation detail: `/quotations/[id]`
- [ ] Can edit quotation
- [ ] Can delete quotation
- [ ] Can generate PDF
- [ ] PDF downloads successfully
- [ ] PDF contains correct data
- [ ] PDF includes logo (if uploaded)

### Quotation Templates
- [ ] Can view templates: `/quotations/templates`
- [ ] Templates display correctly
- [ ] Can use template to create quotation

### Invoices
- [ ] Can view invoices list: `/invoices`
- [ ] Can create new invoice: `/invoices/new`
- [ ] Can add line items
- [ ] Calculations work correctly
- [ ] Invoice saves successfully
- [ ] Can view invoice detail: `/invoices/[id]`
- [ ] Can edit invoice
- [ ] Can delete invoice
- [ ] Can generate PDF
- [ ] PDF downloads successfully

### Follow-ups
- [ ] Can view follow-ups: `/follow-ups`
- [ ] Overdue section displays correctly
- [ ] Today section displays correctly
- [ ] Upcoming section displays correctly
- [ ] Can mark follow-up as complete
- [ ] WhatsApp templates work

### Calendar
- [ ] Calendar loads: `/calendar`
- [ ] Events display correctly
- [ ] Can navigate months
- [ ] Event details show on click

### Reports
- [ ] Reports page loads: `/reports`
- [ ] Stats display correctly
- [ ] Charts render (if implemented)

### Settings
- [ ] General settings load: `/settings/general`
- [ ] Can update profile
- [ ] Changes save successfully

- [ ] Company settings load: `/settings/company`
- [ ] Can upload logo
- [ ] Logo displays in preview
- [ ] Can upload signature
- [ ] Signature displays in preview
- [ ] Can update company details
- [ ] Changes save successfully

- [ ] Packages settings load: `/settings/packages`
- [ ] Can create package
- [ ] Can edit package
- [ ] Can delete package

### Notifications
- [ ] Notification bell shows count
- [ ] Clicking bell opens panel
- [ ] Notifications display (or empty state)
- [ ] Clicking notification navigates to item
- [ ] Marking as read works
- [ ] Badge count updates

---

## Browser Console Check

Open DevTools (F12) → Console tab and check for:

- [ ] No red errors
- [ ] No 401 (Unauthorized) errors
- [ ] No 403 (Forbidden) errors
- [ ] No 500 (Server Error) errors
- [ ] No "Failed to fetch" errors
- [ ] No Supabase connection errors
- [ ] No missing environment variable warnings

---

## Network Tab Check

Open DevTools (F12) → Network tab and check:

- [ ] All API requests succeed (200 status)
- [ ] No failed requests to Supabase
- [ ] No failed requests to storage bucket
- [ ] Images load correctly
- [ ] PDF generation requests succeed

---

## Performance Check

- [ ] Pages load in < 3 seconds
- [ ] Navigation is smooth
- [ ] Forms submit quickly
- [ ] PDF generation completes in < 5 seconds
- [ ] No layout shift on page load

---

## Mobile Responsiveness

Test on mobile device or DevTools mobile view:

- [ ] Landing page is readable
- [ ] Login/signup forms work
- [ ] Dashboard is usable
- [ ] Tables are scrollable
- [ ] Forms are usable
- [ ] Buttons are tappable
- [ ] Navigation works

---

## Security Check

- [ ] Cannot access `/dashboard` without login
- [ ] Cannot access other users' data
- [ ] RLS policies prevent unauthorized access
- [ ] Passwords are not visible in network tab
- [ ] API keys are not exposed in client code

---

## Edge Cases

- [ ] Empty states display correctly (no data)
- [ ] Error messages are user-friendly
- [ ] Form validation prevents invalid data
- [ ] Cannot submit forms with missing required fields
- [ ] Cannot enter negative numbers where invalid
- [ ] Date pickers work correctly
- [ ] File uploads handle large files gracefully
- [ ] PDF generation handles missing data gracefully

---

## Known Limitations (Not Bugs)

These features are intentionally not implemented:

- Email notifications (send quotation via email)
- Quotation preview in browser (download-only)
- CSV import for leads
- Multi-currency support (IDR only)
- Client portal (shareable links)
- Payment tracking
- Dark mode
- Multi-user/team accounts

---

## If Something Fails

1. **Check browser console** for error messages
2. **Check Netlify function logs** in dashboard
3. **Check Supabase logs** in dashboard
4. **Verify environment variables** are set correctly
5. **Verify database migrations** were run
6. **Verify storage bucket** exists and is public
7. **Try in incognito mode** to rule out cache issues
8. **Try different browser** to rule out browser-specific issues

---

## Success Criteria

✅ **Minimum Viable Product**:
- Can sign up and log in
- Can create leads
- Can create quotations with line items
- Can generate PDF quotations
- Can view dashboard with stats

✅ **Fully Functional**:
- All CRUD operations work
- All pages load without errors
- PDF generation works
- File uploads work
- Notifications work
- Follow-ups work
- Settings work

---

## Deployment Status

Current status: **[ ] NOT VERIFIED** (awaiting fixes and testing)

After fixes applied: **[ ] PENDING VERIFICATION**

After testing complete: **[ ] FULLY FUNCTIONAL** or **[ ] ISSUES FOUND**

---

**Last Updated**: May 2, 2026  
**Next Review**: After deployment fixes are applied

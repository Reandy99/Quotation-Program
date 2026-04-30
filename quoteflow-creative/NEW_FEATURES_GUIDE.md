# QuoteFlow Creative — New Features Quick Guide

## 🎯 Leads Kanban Board

**Location:** `/leads` → Click "Kanban" button

**What it does:**
- Visual pipeline with 6 columns: New → Contacted → Quoted → Follow Up → Won → Lost
- Drag-and-drop style status updates (use dropdown on each card)
- See all leads organized by stage at a glance
- Perfect for daily pipeline review

**How to use:**
1. Go to Leads page
2. Click "Kanban" button (next to "List")
3. Each card shows: client name, project type, budget, event date
4. Use dropdown at bottom of card to change status
5. Search bar filters across all columns

---

## 📝 Enhanced Lead Form

**Location:** `/leads/new` or edit any lead

**New fields added:**
- **Lead Source** — Track where clients find you (Instagram, Google, Referral, etc.)
- **Number of Guests** — Estimate event scope
- **Venue Name** — Specific location (not just city)
- **Style Reference Link** — Pinterest/Instagram inspiration links
- **Internal Notes** — Private team notes (separate from client-facing notes)

**Why it matters:**
- Better client data = better service
- Track which marketing channels work
- Reference links help understand client vision
- Internal notes keep team aligned

---

## 📦 Packages & Pricing Manager

**Location:** `/settings/packages`

**What it does:**
- Create reusable service packages
- Each package contains multiple line items with prices
- Use as shortcuts when building quotations
- Calculate total package value automatically

**How to use:**
1. Go to Settings → Packages & Pricing
2. Click "New Package"
3. Enter package name and description
4. Add items: name, description, price
5. Click "Create Package"
6. Package is now saved and ready to use

**Example packages:**
- "Wedding Standard" — 8hr coverage + album + gallery
- "Corporate Half Day" — 4hr event documentation
- "Product Shoot Basic" — 10 products with white background

---

## 📊 Visual Reports Charts

**Location:** `/reports`

**New charts:**
1. **Monthly Revenue Trend** — Bar chart showing last 6 months
   - Hover to see exact amounts
   - Gradient colored bars
   
2. **Revenue by Project Type** — Horizontal bars
   - See which services generate most revenue
   - Helps focus marketing efforts

**How to use:**
- Select date range at top
- Charts update automatically
- Export CSV for detailed analysis

---

## 🔍 Lead Discovery (Demo Mode)

**Location:** `/lead-discovery` (new sidebar item)

**What it does:**
- Search for potential clients matching your target market
- Demo mode returns mock results (no real scraping)
- One-click "Add to Leads" conversion

**How to use:**
1. Select service type (Wedding, Corporate, etc.)
2. Enter target location
3. Choose B2C or B2B
4. Click "Search for Leads"
5. Review mock results
6. Click "Add to Leads" to create lead entry

**Important:**
- This is a DEMO with mock data
- Production version would integrate with Google Places API, LinkedIn, etc.
- Ethical disclaimer displayed on page
- No real data scraping occurs

---

## 📋 Quotation Templates

**Location:** `/quotations/templates` (click "New Quotation")

**10 templates available:**
1. Wedding Photography Standard (Rp 15.5M)
2. Wedding Photography Premium (Rp 41M)
3. Prewedding Session (Rp 6M)
4. Corporate Event (Rp 7.5M)
5. Product Photography (Rp 6.25M)
6. Fashion Editorial (Rp 12M)
7. Birthday & Social Event (Rp 4.8M)
8. Wedding Cinematic Video (Rp 23M)
9. Corporate Video Production (Rp 16.5M)
10. Photo + Video Combo (Rp 26M)

**How to use:**
1. Click "+ New Quotation"
2. Browse templates or use category filters
3. Click "Use This Template"
4. Form auto-fills with template data
5. Edit any field as needed
6. Save quotation

**Pro tip:** Templates save time but are fully editable!

---

## 📈 Enhanced Dashboard

**Location:** `/dashboard`

**New widgets:**
- **Unpaid Invoices** — Total outstanding amount
- **Shoots This Week** — Upcoming events in next 7 days
- **Conversion Rate** — Lead → Won percentage
- **Overdue Invoices** — Count of late payments
- **Today's Agenda** — Follow-ups, events, invoices due today
- **Pipeline Funnel** — Visual lead progression

**Quick actions:**
- "+ New Lead" button
- "+ New Quotation" button
- "+ New Invoice" button

---

## ✅ Bulk Lead Actions

**Location:** `/leads` (List view)

**What it does:**
- Select multiple leads with checkboxes
- Update status for all selected at once
- Saves time when processing many leads

**How to use:**
1. Go to Leads (List view)
2. Click checkboxes next to leads
3. Or click checkbox in header to select all
4. Click "Update Status" dropdown
5. Choose new status
6. Confirm bulk update

**Use cases:**
- Mark multiple leads as "Contacted" after email campaign
- Move lost leads to "Lost" status
- Bulk update after event

---

## 🎨 Dark Mode

**All new features support dark mode:**
- Automatic theme detection
- Toggle in top-right corner
- Consistent purple/indigo accents
- Easy on eyes for long work sessions

---

## 💾 Data Storage (Demo Mode)

**Important notes:**
- Packages stored in **localStorage**
- Template selection stored in **localStorage**
- Data persists in browser only
- Clear browser data = lose custom packages
- Production version would use database

---

## 🚀 Keyboard Shortcuts

**Leads page:**
- `Tab` — Navigate between elements
- `Enter` — Open lead detail
- `Space` — Toggle checkbox

**Forms:**
- `Tab` — Next field
- `Shift + Tab` — Previous field
- `Enter` — Submit (when on button)

---

## 📱 Mobile Responsive

**All new features work on mobile:**
- Kanban: 2 columns on mobile, 3 on tablet, 6 on desktop
- Forms: Stack vertically on small screens
- Charts: Scale to fit screen width
- Navigation: Sidebar collapses on mobile

---

## 🔧 Troubleshooting

**Kanban not showing leads?**
- Check if search filter is active
- Try "All" status filter
- Refresh page

**Package not saving?**
- Check browser localStorage not full
- Try different browser
- Clear old data

**Template not loading?**
- Clear localStorage
- Select template again
- Refresh quotation form

---

## 📞 Support

For questions or issues:
1. Check this guide first
2. Review ENHANCEMENT_IMPLEMENTATION.md for technical details
3. Check COMPLETION_SUMMARY.md for known limitations

---

**Last Updated:** April 30, 2026  
**Version:** 1.0  
**Build:** Successful ✅

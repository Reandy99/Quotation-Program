# QuoteFlow Creative — Requirements

## Product Overview
A SaaS MVP for photographers, videographers, and creative service vendors to manage leads, create professional quotations, generate PDF exports, and follow up with clients.

## Target Users
- Freelance photographers & videographers
- Small creative studios
- Corporate event documentation vendors
- Wedding/event vendors
- Interior/exterior photography providers

---

## Functional Requirements

### REQ-1: Authentication
- REQ-1.1: User can sign up with email + password
- REQ-1.2: User can log in
- REQ-1.3: User can log out
- REQ-1.4: Protected routes redirect unauthenticated users to /login
- REQ-1.5: Each user can only access their own data (RLS enforced)

### REQ-2: Company Profile Settings
- REQ-2.1: User can save business name, logo, email, phone/WhatsApp, website, address
- REQ-2.2: User can save default terms & conditions and default payment terms
- REQ-2.3: Logo is uploaded to Supabase Storage
- REQ-2.4: Settings are pre-filled into new quotations

### REQ-3: Leads Management
- REQ-3.1: User can create a lead with: client name, company name, email, phone, project type, event date, location, estimated budget, notes, status, follow-up date
- REQ-3.2: Lead status options: New, Contacted, Quoted, Follow Up, Won, Lost
- REQ-3.3: User can view a list of all leads with status badges
- REQ-3.4: User can edit a lead
- REQ-3.5: User can delete a lead
- REQ-3.6: User can view a single lead detail page

### REQ-4: Quotation Builder
- REQ-4.1: User can create a quotation linked to a lead
- REQ-4.2: Quotation number is auto-generated (e.g. QF-2026-001)
- REQ-4.3: Quotation fields: project title, project type, event date, location, valid until, notes, terms & conditions, status
- REQ-4.4: Line items: item name, description, quantity, unit price, total (auto-calculated)
- REQ-4.5: Discount (flat or %) and tax (%) applied to subtotal
- REQ-4.6: Grand total auto-calculated
- REQ-4.7: Quotation status: Draft, Sent, Accepted, Rejected
- REQ-4.8: User can view, edit, and delete quotations

### REQ-5: PDF Export
- REQ-5.1: User can generate a PDF from any quotation
- REQ-5.2: PDF includes: business logo, business info, client details, quotation number, project details, line item table, subtotal/discount/tax/grand total, notes, T&C, closing section with WhatsApp CTA
- REQ-5.3: PDF design is clean, modern, professional, minimalist

### REQ-6: Follow-up System
- REQ-6.1: Follow-up page shows: Today's follow-ups, Overdue follow-ups, Upcoming follow-ups
- REQ-6.2: Follow-ups are derived from lead follow-up dates
- REQ-6.3: Three copyable WhatsApp message templates:
  - Template 1: Polite follow-up after quotation sent
  - Template 2: Follow-up for warm lead
  - Template 3: Final follow-up before closing as lost

### REQ-7: Dashboard
- REQ-7.1: Show total leads, total quotations, total quotation value, won deals count
- REQ-7.2: Show pending follow-ups count
- REQ-7.3: Show recent leads (last 5)
- REQ-7.4: Show recent quotations (last 5)

### REQ-8: Seed Data
- REQ-8.1: Sample leads and quotations for: corporate event documentation, company profile video, interior photography, product launch, annual dinner

---

## Non-Functional Requirements
- NFR-1: Deployable to Vercel
- NFR-2: Supabase for auth, database, and storage
- NFR-3: Row-level security on all user-owned tables
- NFR-4: Responsive, desktop-first layout
- NFR-5: No over-engineering — MVP only

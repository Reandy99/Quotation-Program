# QuoteFlow Creative — Design

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth & DB | Supabase |
| Storage | Supabase Storage |
| Validation | Zod |
| Forms | React Hook Form |
| PDF | @react-pdf/renderer |
| Deployment | Vercel |

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | = auth.users.id |
| email | text | |
| full_name | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `company_settings`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → auth.users | unique |
| business_name | text | |
| logo_url | text | Supabase Storage URL |
| email | text | |
| phone | text | |
| website | text | |
| address | text | |
| default_terms | text | |
| default_payment_terms | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `leads`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| client_name | text | |
| company_name | text | |
| email | text | |
| phone | text | |
| project_type | text | |
| event_date | date | |
| location | text | |
| estimated_budget | numeric | |
| notes | text | |
| status | text | New/Contacted/Quoted/Follow Up/Won/Lost |
| follow_up_date | date | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `quotations`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| lead_id | uuid FK → leads | nullable |
| quote_number | text | auto-generated, unique per user |
| project_title | text | |
| project_type | text | |
| event_date | date | |
| location | text | |
| valid_until | date | |
| discount_type | text | flat / percent |
| discount_value | numeric | default 0 |
| tax_percent | numeric | default 0 |
| subtotal | numeric | computed |
| grand_total | numeric | computed |
| notes | text | |
| terms | text | |
| status | text | Draft/Sent/Accepted/Rejected |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `quotation_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| quotation_id | uuid FK → quotations | |
| user_id | uuid FK | for RLS |
| item_name | text | |
| description | text | |
| quantity | numeric | |
| unit_price | numeric | |
| total_price | numeric | computed |
| sort_order | int | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Row-Level Security
All tables: `user_id = auth.uid()` for SELECT, INSERT, UPDATE, DELETE.

---

## Application Routes

| Route | Description |
|---|---|
| `/login` | Login page |
| `/signup` | Sign up page |
| `/dashboard` | Main dashboard |
| `/leads` | Lead list |
| `/leads/new` | Create lead |
| `/leads/[id]` | Lead detail + edit |
| `/quotations` | Quotation list |
| `/quotations/new` | Create quotation |
| `/quotations/[id]` | Quotation detail + edit + PDF |
| `/follow-ups` | Follow-up tracker |
| `/settings/company` | Company profile settings |

---

## Component Architecture

```
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
  (app)/
    layout.tsx          ← sidebar + nav shell
    dashboard/page.tsx
    leads/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    quotations/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    follow-ups/page.tsx
    settings/
      company/page.tsx

components/
  ui/                   ← shadcn components
  leads/
    LeadForm.tsx
    LeadCard.tsx
    StatusBadge.tsx
  quotations/
    QuotationForm.tsx
    LineItemsEditor.tsx
    QuotationPDF.tsx
  follow-ups/
    FollowUpList.tsx
    WhatsAppTemplates.tsx
  dashboard/
    StatCard.tsx
  shared/
    PageHeader.tsx
    EmptyState.tsx

lib/
  supabase/
    client.ts           ← browser client
    server.ts           ← server client
    middleware.ts
  validations/
    lead.ts
    quotation.ts
    company.ts
  utils/
    format.ts           ← currency, date helpers
    quote-number.ts     ← auto-generate QF-YYYY-NNN

types/
  index.ts              ← shared TypeScript types
```

---

## PDF Layout (QuotationPDF)
- Header: logo (left) + business name/contact (right)
- Divider
- "QUOTATION" title + quote number + date + valid until
- Bill To: client name, company, email, phone
- Project: title, type, event date, location
- Line items table: #, Item, Description, Qty, Unit Price, Total
- Totals block: Subtotal, Discount, Tax, **Grand Total**
- Notes section
- Terms & Conditions section
- Footer: "Thank you" + WhatsApp CTA

---

## UI Design Tokens
- Font: Inter (system)
- Primary color: Indigo-600
- Background: Gray-50
- Cards: white, rounded-xl, shadow-sm
- Status badges: color-coded per status
- Sidebar: white, border-r, fixed width 240px

---

## Auto-generated Quote Number
Format: `QF-{YEAR}-{3-digit-sequence}`
Example: `QF-2026-001`
Sequence resets per year, scoped per user.

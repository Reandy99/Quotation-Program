# WhatsApp Reminder One-Click Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Munculkan tombol "Kirim Reminder WA" di Agenda Hari Ini dashboard untuk H-1 sebelum sesi dan H-2 sebelum invoice jatuh tempo.

**Architecture:** Server Component dashboard fetch data H-1 leads dan H-2 invoices, komputasikan wa.me URL dengan pesan pre-filled, render sebagai `<a href>` tag biasa — tidak butuh client component tambahan. Phone untuk invoice di-resolve via multi-step query: invoice → quotation → lead.

**Tech Stack:** Next.js 14 App Router (Server Components), Supabase, `lib/utils/whatsapp.ts`, `lib/utils/format.ts`

---

## File Map

| File | Aksi | Tanggung Jawab |
|---|---|---|
| `lib/utils/whatsapp.ts` | Modify | Tambah 2 fungsi template pesan |
| `app/(app)/dashboard/actions.ts` | Modify | Tambah `getWAReminderData()` |
| `app/(app)/dashboard/page.tsx` | Modify | Render reminder rows di Agenda |

---

### Task 1: Tambah fungsi template pesan ke `lib/utils/whatsapp.ts`

**Files:**
- Modify: `lib/utils/whatsapp.ts`

- [ ] **Step 1: Tambah import dan dua fungsi template**

Buka `lib/utils/whatsapp.ts` dan tambahkan di bagian paling bawah file (setelah `buildWhatsAppUrl`):

```typescript
import { formatCurrency, formatDateShort } from "@/lib/utils/format"

export function buildSessionReminderMessage(params: {
  clientName: string
  projectType: string | null
  eventDate: string
  businessName: string
}): string {
  const { clientName, projectType, eventDate, businessName } = params
  const dateFormatted = formatDateShort(eventDate)
  const projectLabel = projectType ?? "foto/video"
  const suffix = businessName ? ` – ${businessName}` : ""
  return `Halo ${clientName}! 👋 Mengingatkan bahwa sesi ${projectLabel} kita jadwalkan besok, ${dateFormatted}. Mohon konfirmasi kehadiran ya 🙏${suffix}`
}

export function buildInvoiceReminderMessage(params: {
  clientName: string
  invoiceNumber: string
  grandTotal: number
  dueDate: string
  businessName: string
}): string {
  const { clientName, invoiceNumber, grandTotal, dueDate, businessName } = params
  const dateFormatted = formatDateShort(dueDate)
  const amountFormatted = formatCurrency(grandTotal)
  const suffix = businessName ? ` – ${businessName}` : ""
  return `Halo ${clientName}! 👋 Mengingatkan bahwa invoice ${invoiceNumber} senilai ${amountFormatted} akan jatuh tempo pada ${dateFormatted}. Mohon segera dilunasi ya 🙏${suffix}`
}
```

- [ ] **Step 2: Type-check**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | grep "whatsapp"
```

Expected: tidak ada output (no errors).

- [ ] **Step 3: Commit**

```bash
git add lib/utils/whatsapp.ts
git commit -m "feat: add WA session and invoice reminder message builders"
```

---

### Task 2: Tambah `getWAReminderData()` ke `dashboard/actions.ts`

**Files:**
- Modify: `app/(app)/dashboard/actions.ts`

- [ ] **Step 1: Tambah return type interface dan fungsi di akhir file**

Buka `app/(app)/dashboard/actions.ts` dan tambahkan di bagian paling bawah:

```typescript
export interface SessionReminder {
  id: string
  clientName: string
  phone: string | null
  projectType: string | null
  eventDate: string
}

export interface InvoiceReminder {
  id: string
  invoiceNumber: string
  clientName: string
  grandTotal: number
  dueDate: string
  phone: string | null
}

export async function getWAReminderData(): Promise<{
  sessionReminders: SessionReminder[]
  invoiceReminders: InvoiceReminder[]
}> {
  try {
    const supabase = createClient()

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)

    const tomorrowStr = tomorrow.toISOString().split("T")[0]
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split("T")[0]

    const [leadsRes, invoicesRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, client_name, phone, project_type, event_date")
        .eq("event_date", tomorrowStr)
        .neq("status", "Lost"),
      supabase
        .from("invoices")
        .select("id, invoice_number, client_name, grand_total, due_date, quotation_id")
        .eq("due_date", dayAfterTomorrowStr)
        .neq("status", "Paid"),
    ])

    if (leadsRes.error) throw leadsRes.error
    if (invoicesRes.error) throw invoicesRes.error

    const sessionReminders: SessionReminder[] = (leadsRes.data ?? []).map((l) => ({
      id: l.id,
      clientName: l.client_name,
      phone: l.phone ?? null,
      projectType: l.project_type ?? null,
      eventDate: l.event_date ?? tomorrowStr,
    }))

    // Resolve phone via quotation_id → lead for invoices
    const invoices = invoicesRes.data ?? []
    const quotationIds = invoices.map((i) => i.quotation_id).filter(Boolean) as string[]

    let phoneByQuotationId: Record<string, string | null> = {}
    if (quotationIds.length > 0) {
      const { data: quotations } = await supabase
        .from("quotations")
        .select("id, lead_id")
        .in("id", quotationIds)

      const leadIds = (quotations ?? []).map((q) => q.lead_id).filter(Boolean) as string[]
      if (leadIds.length > 0) {
        const { data: leads } = await supabase
          .from("leads")
          .select("id, phone")
          .in("id", leadIds)

        const leadPhoneMap: Record<string, string | null> = {}
        ;(leads ?? []).forEach((l) => { leadPhoneMap[l.id] = l.phone ?? null })
        ;(quotations ?? []).forEach((q) => {
          if (q.lead_id) phoneByQuotationId[q.id] = leadPhoneMap[q.lead_id] ?? null
        })
      }
    }

    const invoiceReminders: InvoiceReminder[] = invoices.map((i) => ({
      id: i.id,
      invoiceNumber: i.invoice_number,
      clientName: i.client_name,
      grandTotal: Number(i.grand_total),
      dueDate: i.due_date,
      phone: i.quotation_id ? (phoneByQuotationId[i.quotation_id] ?? null) : null,
    }))

    return { sessionReminders, invoiceReminders }
  } catch (error) {
    console.error("Error fetching WA reminder data:", error)
    return { sessionReminders: [], invoiceReminders: [] }
  }
}
```

- [ ] **Step 2: Type-check**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | grep "dashboard/actions"
```

Expected: tidak ada output.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/dashboard/actions.ts
git commit -m "feat: add getWAReminderData for H-1 session and H-2 invoice reminders"
```

---

### Task 3: Render reminder rows di `dashboard/page.tsx`

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Tambah imports di bagian atas file**

Tambahkan ke baris import yang sudah ada di `app/(app)/dashboard/page.tsx`:

```typescript
// Tambahkan ke import yang sudah ada:
import { getDashboardStats, getRecentActivity, getWAReminderData } from "./actions"
import type { FollowUp, Invoice, Lead, Quotation } from "@/types"
import type { SessionReminder, InvoiceReminder } from "./actions"
import { buildWhatsAppUrl, buildSessionReminderMessage, buildInvoiceReminderMessage } from "@/lib/utils/whatsapp"
import { getCompanySettings } from "../settings/actions"
import { MessageCircle } from "lucide-react"
```

Catatan: `MessageCircle` ditambahkan ke destructure import lucide-react yang sudah ada.

- [ ] **Step 2: Tambah `getWAReminderData` dan `getCompanySettings` ke Promise.all**

Ubah baris Promise.all di `DashboardPage`:

```typescript
const [stats, { recentLeads, recentQuotations, recentInvoices }, allLeads, allInvoices, generalSettings, followUps, waReminders, companySettings] = await Promise.all([
  getDashboardStats(),
  getRecentActivity(),
  getLeads(),
  getInvoices(),
  getGeneralSettings(),
  getFollowUps(),
  getWAReminderData(),
  getCompanySettings(),
])
```

Lalu tambahkan variable `businessName` setelah Promise.all:

```typescript
const businessName = companySettings?.business_name ?? generalSettings.workspace_name ?? ""
```

- [ ] **Step 3: Render reminder rows di dalam section "Agenda Hari Ini"**

Temukan section `{/* Today's Agenda */}` di `page.tsx`. Ubah kondisi show dari:

```typescript
{(followUpsDueToday.length > 0 || shootsToday.length > 0 || invoicesDueToday.length > 0) && (
```

Menjadi:

```typescript
{(followUpsDueToday.length > 0 || shootsToday.length > 0 || invoicesDueToday.length > 0 || waReminders.sessionReminders.length > 0 || waReminders.invoiceReminders.length > 0) && (
```

Lalu tambahkan dua blok berikut di dalam `<div className="space-y-2">`, setelah blok `invoicesDueToday.map(...)` yang sudah ada:

```tsx
{waReminders.sessionReminders.map((reminder: SessionReminder) => {
  const waUrl = buildWhatsAppUrl(
    reminder.phone,
    buildSessionReminderMessage({
      clientName: reminder.clientName,
      projectType: reminder.projectType,
      eventDate: reminder.eventDate,
      businessName,
    })
  )
  return (
    <div
      key={`session-reminder-${reminder.id}`}
      className="flex items-center justify-between rounded-2xl px-4 py-3"
      style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <MessageCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            Sesi Besok: {reminder.clientName}
          </p>
          <p className="text-xs text-green-700">{reminder.projectType ?? "Foto/Video"} · Kirim konfirmasi</p>
        </div>
      </div>
      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          Kirim Reminder WA
        </a>
      ) : (
        <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-400">
          Nomor WA tidak ada
        </span>
      )}
    </div>
  )
})}

{waReminders.invoiceReminders.map((reminder: InvoiceReminder) => {
  const waUrl = buildWhatsAppUrl(
    reminder.phone,
    buildInvoiceReminderMessage({
      clientName: reminder.clientName,
      invoiceNumber: reminder.invoiceNumber,
      grandTotal: reminder.grandTotal,
      dueDate: reminder.dueDate,
      businessName,
    })
  )
  return (
    <div
      key={`invoice-reminder-${reminder.id}`}
      className="flex items-center justify-between rounded-2xl px-4 py-3"
      style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <MessageCircle className="w-4 h-4 flex-shrink-0 text-orange-500" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            Invoice Lusa: {reminder.clientName}
          </p>
          <p className="text-xs text-orange-700">{reminder.invoiceNumber} · Jatuh tempo lusa</p>
        </div>
      </div>
      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          Kirim Reminder WA
        </a>
      ) : (
        <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-400">
          Nomor WA tidak ada
        </span>
      )}
    </div>
  )
})}
```

- [ ] **Step 4: Type-check keseluruhan**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | head -30
```

Expected: tidak ada output (no errors).

- [ ] **Step 5: Verifikasi di browser**

Dev server sudah berjalan di `http://localhost:3000`. Untuk menguji:

1. Buka Supabase → tabel `leads` → tambah/edit row dengan `event_date = tanggal besok` (format `YYYY-MM-DD`), pastikan ada `phone` yang valid
2. Buka Supabase → tabel `invoices` → tambah/edit row dengan `due_date = lusa` dan `status = Sent`
3. Buka `http://localhost:3000/dashboard`
4. Pastikan section "Agenda Hari Ini" muncul dengan:
   - Row hijau "Sesi Besok: [nama klien]" + tombol "Kirim Reminder WA"
   - Row oranye "Invoice Lusa: [nama klien]" + tombol "Kirim Reminder WA"
5. Klik tombol → WhatsApp Web terbuka dengan pesan sudah terisi
6. Uji kasus tanpa phone: hapus `phone` dari lead → pastikan tombol berubah jadi teks abu "Nomor WA tidak ada"

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx
git commit -m "feat: render WA reminder rows in Dashboard Agenda for H-1 session and H-2 invoice"
```

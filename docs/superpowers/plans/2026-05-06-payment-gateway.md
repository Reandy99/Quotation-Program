# Payment Gateway (Midtrans) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrasi Midtrans Snap agar klien bisa bayar invoice via link publik `/pay/[id]`, dengan webhook otomatis dan tombol manual "Cek Status" sebagai fallback.

**Architecture:** Server Actions generate Snap redirect URL via Midtrans API, disimpan di database. Halaman publik `/pay/[id]` jadi landing page branded. Webhook `/api/midtrans/webhook` update status otomatis. Middleware diupdate agar `/pay` dan `/api/midtrans` bisa diakses tanpa auth.

**Tech Stack:** Next.js 14 App Router, Supabase (admin client untuk webhook & public page), Midtrans Snap API, Node.js `crypto` untuk webhook signature verification.

---

## File Map

| File | Aksi | Tanggung Jawab |
|---|---|---|
| `supabase/migrations/20260506_add_midtrans_fields.sql` | Create | DDL: tambah 2 kolom ke invoices |
| `lib/supabase/middleware.ts` | Modify | Tambah `/pay` & `/api/midtrans` ke public routes |
| `lib/midtrans/client.ts` | Create | Midtrans API calls + webhook signature verifier |
| `app/(app)/invoices/actions.ts` | Modify | Tambah 3 server actions: getInvoiceMidtransData, createMidtransTransaction, checkMidtransStatus |
| `app/api/midtrans/webhook/route.ts` | Create | POST webhook: verifikasi + update invoice + Payment record |
| `app/pay/[id]/page.tsx` | Create | Public landing page: tampilkan invoice summary + tombol bayar |
| `app/(app)/invoices/[id]/page.tsx` | Modify | Fetch midtrans data, pass ke client sebagai prop |
| `components/invoices/InvoiceDetailClient.tsx` | Modify | Tambah prop midtransData + tombol payment link + cek status |

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260506_add_midtrans_fields.sql`

- [ ] **Step 1: Buat file migration**

```sql
-- supabase/migrations/20260506_add_midtrans_fields.sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_url TEXT;
```

- [ ] **Step 2: Jalankan di Supabase SQL Editor**

Buka Supabase Dashboard → SQL Editor → paste dan jalankan SQL di atas.
Expected: query berhasil tanpa error.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260506_add_midtrans_fields.sql
git commit -m "feat: add midtrans_order_id and payment_url columns to invoices"
```

---

### Task 2: Update Middleware untuk Public Routes

**Files:**
- Modify: `lib/supabase/middleware.ts`

- [ ] **Step 1: Tambah public route check**

Buka `lib/supabase/middleware.ts`. Temukan blok:

```typescript
const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")

if (!user && !isAuthRoute) {
```

Ubah menjadi:

```typescript
const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")

const isPublicRoute = request.nextUrl.pathname.startsWith("/pay") ||
    request.nextUrl.pathname.startsWith("/api/midtrans")

if (!user && !isAuthRoute && !isPublicRoute) {
```

- [ ] **Step 2: Type-check**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/middleware.ts
git commit -m "feat: allow /pay and /api/midtrans as public routes"
```

---

### Task 3: Midtrans Client Helper

**Files:**
- Create: `lib/midtrans/client.ts`

- [ ] **Step 1: Tambah env vars ke `.env.local`**

Buka `.env.local` dan tambahkan di bagian bawah:

```
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
```

Ganti `SB-Mid-server-xxx` dengan key dari Midtrans dashboard (sandbox). Jika belum punya, isi dulu dengan placeholder — fungsi akan error saat dipanggil tapi tidak akan break build.

- [ ] **Step 2: Buat `lib/midtrans/client.ts`**

```typescript
import crypto from "crypto"

const BASE_SNAP_URL =
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1"
    : "https://app.sandbox.midtrans.com/snap/v1"

const BASE_API_URL =
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2"

function getAuthHeader(): string {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ""
  return "Basic " + Buffer.from(serverKey + ":").toString("base64")
}

export interface SnapTransactionParams {
  orderId: string
  grossAmount: number
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  itemName: string
}

export async function createSnapTransaction(
  params: SnapTransactionParams
): Promise<{ redirectUrl: string }> {
  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail || undefined,
      phone: params.customerPhone || undefined,
    },
    item_details: [
      {
        id: params.orderId,
        price: Math.round(params.grossAmount),
        quantity: 1,
        name: params.itemName.slice(0, 50),
      },
    ],
  }

  const res = await fetch(`${BASE_SNAP_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Midtrans Snap error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return { redirectUrl: data.redirect_url }
}

export async function checkTransactionStatus(orderId: string): Promise<{
  transactionStatus: string
  paymentType: string
  statusCode: string
}> {
  const res = await fetch(`${BASE_API_URL}/${orderId}/status`, {
    headers: { Authorization: getAuthHeader() },
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Midtrans status error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return {
    transactionStatus: data.transaction_status ?? "unknown",
    paymentType: data.payment_type ?? "unknown",
    statusCode: data.status_code ?? "unknown",
  }
}

export function verifyWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? ""
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex")
  return hash === signatureKey
}
```

- [ ] **Step 3: Type-check**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | head -10
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add lib/midtrans/client.ts .env.local
git commit -m "feat: add Midtrans client helper (createSnapTransaction, checkTransactionStatus, verifyWebhookSignature)"
```

---

### Task 4: Server Actions untuk Midtrans

**Files:**
- Modify: `app/(app)/invoices/actions.ts`

- [ ] **Step 1: Tambah import Midtrans client di atas file**

Buka `app/(app)/invoices/actions.ts`. Tambahkan import berikut setelah import yang sudah ada:

```typescript
import { createSnapTransaction, checkTransactionStatus } from "@/lib/midtrans/client"
```

- [ ] **Step 2: Tambah 3 fungsi baru di bagian paling bawah file**

```typescript
export async function getInvoiceMidtransData(
  invoiceId: string
): Promise<{ orderId: string | null; paymentUrl: string | null }> {
  const supabase = createClient()
  const { data } = await supabase
    .from("invoices")
    .select("midtrans_order_id, payment_url")
    .eq("id", invoiceId)
    .single()
  const row = data as { midtrans_order_id: string | null; payment_url: string | null } | null
  return {
    orderId: row?.midtrans_order_id ?? null,
    paymentUrl: row?.payment_url ?? null,
  }
}

export async function createMidtransTransaction(
  invoiceId: string
): Promise<{ paymentUrl: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")

  const existing = await getInvoiceMidtransData(invoiceId)
  if (existing.paymentUrl) return { paymentUrl: existing.paymentUrl }

  const invoice = await getInvoice(invoiceId)
  if (!invoice) throw new Error("Invoice tidak ditemukan.")
  if (invoice.status === "Paid") throw new Error("Invoice sudah lunas.")

  const remaining = invoice.grand_total - invoice.paid_amount
  const orderId = `QF-${invoiceId.slice(0, 8)}-${Date.now()}`

  const { redirectUrl } = await createSnapTransaction({
    orderId,
    grossAmount: remaining,
    customerName: invoice.client_name,
    itemName: invoice.project_title,
  })

  await supabase
    .from("invoices")
    .update({ midtrans_order_id: orderId, payment_url: redirectUrl } as any)
    .eq("id", invoiceId)
    .eq("user_id", user.id)

  revalidatePath(`/invoices/${invoiceId}`)
  return { paymentUrl: redirectUrl }
}

export async function checkMidtransStatus(
  invoiceId: string
): Promise<{ status: string; message: string }> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Authentication required.")

  const { orderId } = await getInvoiceMidtransData(invoiceId)
  if (!orderId) return { status: "no_transaction", message: "Belum ada transaksi Midtrans." }

  const { transactionStatus, paymentType } = await checkTransactionStatus(orderId)

  if (transactionStatus === "settlement" || transactionStatus === "capture") {
    const invoice = await getInvoice(invoiceId)
    if (invoice && invoice.status !== "Paid") {
      await updateInvoiceStatus(invoiceId, "Paid")
      const methodMap: Record<string, PaymentMethod> = {
        bank_transfer: "Transfer",
        qris: "QRIS",
        gopay: "QRIS",
        shopeepay: "QRIS",
        credit_card: "Transfer",
      }
      const method: PaymentMethod = methodMap[paymentType] ?? "Transfer"
      await createPayment(invoiceId, {
        amount: invoice.grand_total - invoice.paid_amount,
        method,
        date: new Date().toISOString().split("T")[0],
        notes: `Dibayar via Midtrans (${paymentType})`,
      })
    }
    return { status: "paid", message: "Pembayaran berhasil dikonfirmasi." }
  }

  if (transactionStatus === "pending") {
    return { status: "pending", message: "Menunggu pembayaran dari klien." }
  }

  return { status: transactionStatus, message: `Status Midtrans: ${transactionStatus}` }
}
```

- [ ] **Step 3: Type-check**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/invoices/actions.ts"
git commit -m "feat: add createMidtransTransaction, checkMidtransStatus, getInvoiceMidtransData server actions"
```

---

### Task 5: Webhook Handler

**Files:**
- Create: `app/api/midtrans/webhook/route.ts`

- [ ] **Step 1: Buat file webhook handler**

```typescript
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { verifyWebhookSignature } from "@/lib/midtrans/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
    } = body as {
      order_id: string
      status_code: string
      gross_amount: string
      signature_key: string
      transaction_status: string
      payment_type: string
    }

    if (!verifyWebhookSignature(order_id, status_code, gross_amount, signature_key)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    if (transaction_status !== "settlement" && transaction_status !== "capture") {
      return NextResponse.json({ received: true })
    }

    const supabase = createAdminClient()

    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, status, grand_total, paid_amount, user_id")
      .eq("midtrans_order_id", order_id)
      .single()

    if (!invoice || invoice.status === "Paid") {
      return NextResponse.json({ received: true })
    }

    const methodMap: Record<string, string> = {
      bank_transfer: "Transfer",
      qris: "QRIS",
      gopay: "QRIS",
      shopeepay: "QRIS",
      credit_card: "Transfer",
    }
    const method = methodMap[payment_type] ?? "Transfer"
    const remaining = Number(invoice.grand_total) - Number(invoice.paid_amount)

    await Promise.all([
      supabase
        .from("invoices")
        .update({
          status: "Paid",
          paid_amount: invoice.grand_total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoice.id),
      supabase.from("payments").insert({
        invoice_id: invoice.id,
        user_id: invoice.user_id,
        amount: remaining,
        method,
        date: new Date().toISOString().split("T")[0],
        notes: `Dibayar via Midtrans (${payment_type})`,
      }),
    ])

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Midtrans Webhook] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Type-check**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | head -10
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/api/midtrans/webhook/route.ts
git commit -m "feat: add Midtrans webhook handler with signature verification"
```

---

### Task 6: Public Payment Page

**Files:**
- Create: `app/pay/[id]/page.tsx`

- [ ] **Step 1: Buat file public payment page**

```typescript
import { createAdminClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { CheckCircle, AlertCircle, CreditCard } from "lucide-react"
import { notFound } from "next/navigation"

interface Props {
  params: { id: string }
}

export default async function PublicPaymentPage({ params }: Props) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("invoices")
    .select("id, invoice_number, client_name, project_title, grand_total, paid_amount, due_date, status, payment_url")
    .eq("id", params.id)
    .single()

  if (!data) notFound()

  const invoice = data as {
    id: string
    invoice_number: string
    client_name: string
    project_title: string
    grand_total: number
    paid_amount: number
    due_date: string
    status: string
    payment_url: string | null
  }

  const isPaid = invoice.status === "Paid"
  const remaining = Number(invoice.grand_total) - Number(invoice.paid_amount)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
          <p className="text-blue-100 text-sm font-medium">Invoice Pembayaran</p>
          <h1 className="text-white text-xl font-bold mt-1">{invoice.invoice_number}</h1>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Klien</p>
            <p className="text-gray-900 font-semibold mt-0.5">{invoice.client_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Proyek</p>
            <p className="text-gray-900 mt-0.5">{invoice.project_title}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Jatuh Tempo</p>
            <p className="text-gray-900 mt-0.5">{formatDate(invoice.due_date)}</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tagihan</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 pb-6">
          {isPaid ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-medium text-sm">Invoice ini sudah lunas. Terima kasih!</p>
            </div>
          ) : invoice.payment_url ? (
            <a
              href={invoice.payment_url}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Bayar Sekarang
            </a>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-yellow-800 text-sm">Link pembayaran belum disiapkan. Hubungi vendor.</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-400">Pembayaran diproses aman via Midtrans</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | head -10
```

Expected: no output.

- [ ] **Step 3: Verifikasi halaman bisa diakses tanpa login**

Buka browser dalam incognito → `http://localhost:3000/pay/[id-invoice-yang-ada]`
Expected: halaman tampil tanpa redirect ke /login.

- [ ] **Step 4: Commit**

```bash
git add "app/pay/[id]/page.tsx"
git commit -m "feat: add public payment landing page /pay/[id]"
```

---

### Task 7: Invoice Detail UI — Tambah Tombol Payment

**Files:**
- Modify: `app/(app)/invoices/[id]/page.tsx`
- Modify: `components/invoices/InvoiceDetailClient.tsx`

- [ ] **Step 1: Update `app/(app)/invoices/[id]/page.tsx`**

Baca file `app/(app)/invoices/[id]/page.tsx`. Temukan baris yang memanggil `getInvoice(id)` dan fetch payments. Tambahkan fetch `getInvoiceMidtransData` secara paralel.

Tambahkan import:
```typescript
import { getInvoiceMidtransData } from "@/app/(app)/invoices/actions"
```

Ubah fetch section menjadi (sesuaikan dengan struktur yang sudah ada):
```typescript
const [invoice, payments, midtransData] = await Promise.all([
  getInvoice(params.id),
  getPayments(params.id),
  getInvoiceMidtransData(params.id),
])
```

Lalu pass ke `InvoiceDetailClient`:
```typescript
<InvoiceDetailClient
  invoice={invoice}
  initialPayments={payments}
  company={company}
  midtransData={midtransData}
/>
```

- [ ] **Step 2: Update Props di `components/invoices/InvoiceDetailClient.tsx`**

Tambahkan import:
```typescript
import { createMidtransTransaction, checkMidtransStatus } from "@/app/(app)/invoices/actions"
import { Link2, RefreshCw } from "lucide-react"
```

Tambahkan ke `Props` interface:
```typescript
midtransData: { orderId: string | null; paymentUrl: string | null }
```

Tambahkan state baru setelah state yang sudah ada:
```typescript
const [paymentUrl, setPaymentUrl] = useState(props.midtransData?.paymentUrl ?? null)
const [midtransLoading, setMidtransLoading] = useState(false)
```

- [ ] **Step 3: Tambah handler functions di `InvoiceDetailClient.tsx`**

Tambahkan dua fungsi handler setelah fungsi handler yang sudah ada (misal setelah `handleSendWhatsApp`):

```typescript
async function handleCreatePaymentLink() {
  setMidtransLoading(true)
  try {
    const result = await createMidtransTransaction(invoice.id)
    setPaymentUrl(result.paymentUrl)
    const payLink = `${window.location.origin}/pay/${invoice.id}`
    await navigator.clipboard.writeText(payLink)
    toast({ title: "Link disalin!", description: "Link pembayaran sudah disalin ke clipboard." })
  } catch (err: any) {
    toast({ title: "Gagal", description: err.message, variant: "destructive" })
  } finally {
    setMidtransLoading(false)
  }
}

async function handleCheckStatus() {
  setMidtransLoading(true)
  try {
    const result = await checkMidtransStatus(invoice.id)
    if (result.status === "paid") {
      setInvoice(prev => ({ ...prev, status: "Paid" as const, paid_amount: prev.grand_total }))
    }
    toast({
      title: result.status === "paid" ? "Pembayaran Dikonfirmasi!" : "Status Diperbarui",
      description: result.message,
    })
  } catch (err: any) {
    toast({ title: "Gagal", description: err.message, variant: "destructive" })
  } finally {
    setMidtransLoading(false)
  }
}
```

- [ ] **Step 4: Tambah tombol di area action buttons**

Di `InvoiceDetailClient.tsx`, temukan area action buttons (sekitar baris `<div className="flex gap-2 flex-wrap">`). Tambahkan tombol payment setelah tombol WA yang sudah ada, tapi hanya jika invoice belum `Paid`:

```tsx
{invoice.status !== "Paid" && (
  <>
    {paymentUrl ? (
      <div className="flex gap-2">
        <button
          onClick={() => {
            const payLink = `${window.location.origin}/pay/${invoice.id}`
            navigator.clipboard.writeText(payLink)
            toast({ title: "Link disalin!", description: payLink })
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          Salin Link Bayar
        </button>
        <button
          onClick={handleCheckStatus}
          disabled={midtransLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${midtransLoading ? "animate-spin" : ""}`} />
          Cek Status
        </button>
      </div>
    ) : (
      <button
        onClick={handleCreatePaymentLink}
        disabled={midtransLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <Link2 className="w-3.5 h-3.5" />
        {midtransLoading ? "Memproses..." : "Buat Payment Link"}
      </button>
    )}
  </>
)}
```

- [ ] **Step 5: Type-check**

```bash
cd "/Users/reandysetiawan/Documents/Quotation Program" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 6: Verifikasi di browser**

1. Buka `http://localhost:3000/invoices` → pilih invoice yang belum Paid
2. Pastikan tombol "Buat Payment Link" muncul
3. Klik → pastikan toast "Link disalin!" muncul (akan error jika MIDTRANS_SERVER_KEY belum diisi)
4. Jika sudah isi key sandbox Midtrans: klik → link terbuat → "Salin Link Bayar" muncul
5. Buka link `/pay/[id]` di tab baru (incognito) → pastikan tampil tanpa login

- [ ] **Step 7: Commit**

```bash
git add "app/(app)/invoices/[id]/page.tsx" components/invoices/InvoiceDetailClient.tsx
git commit -m "feat: add payment link UI to invoice detail — create link, copy, check status"
```

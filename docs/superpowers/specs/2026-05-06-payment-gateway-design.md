# Design: Payment Gateway — Midtrans Snap Redirect

**Date:** 2026-05-06  
**Status:** Approved

## Tujuan

Integrasi Midtrans agar klien bisa bayar invoice langsung dari link yang dikirim. Status invoice otomatis update ke `Paid` via webhook. Ada tombol manual "Cek Status" sebagai fallback.

## Pendekatan

**Snap Redirect** — server generate Snap token via Midtrans API, simpan `payment_url` di database, public page `/pay/[id]` jadi landing page branded sebelum redirect ke Midtrans hosted payment page.

## Alur Lengkap

```
1. Vendor buka /invoices/[id]
2. Klik "Buat Payment Link"
   → Server Action: POST ke Midtrans Snap API
   → Terima snap_redirect_url
   → Simpan midtrans_order_id + payment_url ke invoices table
   → UI update: tombol "Salin Link" + "Kirim via WA"

3. Klien buka /pay/[invoice_id] (public, no auth)
   → Lihat ringkasan invoice: nama klien, project, total, due date
   → Klik "Bayar Sekarang" → redirect ke payment_url (Midtrans)

4. Klien bayar di Midtrans

5a. Webhook (production):
   → Midtrans POST ke /api/midtrans/webhook
   → Verifikasi signature hash
   → Update invoice status → "Paid", paid_amount → grand_total
   → Buat Payment record (method dari notification_type Midtrans)

5b. Manual check (development/fallback):
   → Vendor klik "Cek Status Pembayaran" di /invoices/[id]
   → Server Action: GET Midtrans transaction status API
   → Jika settlement/capture → update invoice ke Paid
   → Jika pending → tampilkan "Menunggu pembayaran"
```

## Database

Migration baru `supabase/migrations/20260506_add_midtrans_fields.sql`:
```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_url TEXT;
```

Tidak perlu perubahan types/index.ts — field tambahan tidak masuk ke Invoice type agar backward compatible. Actions mengakses via query terpisah saat dibutuhkan.

## Midtrans API

### Create Transaction (Snap)
```
POST https://app.sandbox.midtrans.com/snap/v1/transactions
Authorization: Basic base64(SERVER_KEY + ":")
Body: {
  transaction_details: { order_id, gross_amount },
  customer_details: { first_name, email, phone },
  item_details: [{ id, price, quantity, name }]
}
Response: { token, redirect_url }
```

### Check Status
```
GET https://api.sandbox.midtrans.com/v2/{order_id}/status
Authorization: Basic base64(SERVER_KEY + ":")
Response: { transaction_status, fraud_status, payment_type, ... }
```

### Webhook Signature Verification
```
SHA512(order_id + status_code + gross_amount + SERVER_KEY) === signature_key
```

Production base URL: `app.midtrans.com` dan `api.midtrans.com` (tanpa `.sandbox`)

## Environment Variables

```
MIDTRANS_SERVER_KEY=        # Server key dari Midtrans dashboard
MIDTRANS_CLIENT_KEY=        # Client key (tidak dipakai di backend, untuk referensi)
MIDTRANS_IS_PRODUCTION=false  # true = production, false = sandbox
```

## File Structure

| File | Aksi | Tanggung Jawab |
|---|---|---|
| `supabase/migrations/20260506_add_midtrans_fields.sql` | Create | DDL tambah 2 kolom ke invoices |
| `lib/midtrans/client.ts` | Create | Helper: createSnapTransaction(), checkTransactionStatus(), verifyWebhookSignature() |
| `app/api/midtrans/webhook/route.ts` | Create | POST handler: verifikasi + update invoice + buat Payment |
| `app/pay/[id]/page.tsx` | Create | Public landing page: tampil invoice summary + tombol bayar |
| `app/(app)/invoices/actions.ts` | Modify | Tambah createMidtransTransaction(), checkMidtransStatus() |
| `components/invoices/InvoiceDetailClient.tsx` | Modify | Tambah tombol "Buat Payment Link", "Salin Link", "Cek Status" |

## Public Page `/pay/[id]`

- **No auth required** — route di luar `(app)` group
- Fetch invoice by id dengan `createClient()` (SSR, RLS-aware) — TIDAK pakai service role
- Tampil: nama klien, project title, total, due date, status
- Jika invoice sudah Paid → tampil "Invoice ini sudah lunas" tanpa tombol bayar
- Jika payment_url belum ada → tampil "Link pembayaran belum disiapkan"
- Tombol "Bayar Sekarang" → `<a href={payment_url}>` redirect langsung

## Edge Cases

- `midtrans_order_id` sudah ada (link sudah pernah dibuat) → jangan buat transaksi baru, tampilkan link yang sudah ada
- Invoice sudah Paid → sembunyikan tombol "Buat Payment Link"
- Webhook duplikat (Midtrans bisa kirim lebih dari sekali) → cek status sebelum update, idempotent
- Sandbox vs production → switch via `MIDTRANS_IS_PRODUCTION` env var
- RLS untuk public page → query invoice tanpa filter user_id (perlu RLS policy `SELECT` untuk public, atau gunakan service role khusus untuk public page)

## Catatan RLS untuk Public Page

Invoice diakses publik via `/pay/[id]`. Ini berarti perlu salah satu dari:
- **Option 1:** Service role client di public page (bypass RLS) — simpel tapi hati-hati jangan expose data lain
- **Option 2:** Policy RLS `SELECT` public untuk invoices dengan kondisi `payment_url IS NOT NULL`

Rekomendasi: **Option 1** (service role, select field terbatas) karena lebih mudah dikontrol.

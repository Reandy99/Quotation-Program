# Design: WhatsApp Reminder One-Click (Assisted)

**Date:** 2026-05-06  
**Status:** Approved

## Tujuan

Memunculkan tombol "Kirim Reminder WA" di section "Agenda Hari Ini" pada Dashboard untuk dua event:
1. **H-1 sebelum sesi** — lead dengan `event_date = besok`
2. **H-2 jatuh tempo invoice** — invoice dengan `due_date = lusa` dan status bukan `Paid`

User klik tombol → WhatsApp terbuka dengan pesan yang sudah terisi lengkap → user tinggal tekan Send.

## Pendekatan

One-click assisted via `wa.me` deep link. Tidak memerlukan WhatsApp Business API. Seluruh logika berjalan di server (Server Component), tombol di-render sebagai `<a href>` biasa.

## Data Flow

### H-1 Sesi
- Source: tabel `leads`
- Filter: `event_date = tomorrow` (ISO date string)
- Phone: `lead.phone` (sudah ada di tipe Lead)
- Fallback: jika `lead.phone` kosong, tombol disabled dengan tooltip "Nomor tidak tersedia"

### H-2 Invoice
- Source: tabel `invoices` join `leads` via `quotations`
- Filter: `due_date = day after tomorrow` AND `status NOT IN ('Paid')`
- Phone: dari `lead.phone` via join quotation_id → quotation → lead
- Fallback: jika phone tidak ditemukan, tombol disabled

## Template Pesan WA

### Reminder Sesi (H-1)
```
Halo [client_name]! 👋 Mengingatkan bahwa sesi [project_type] kita jadwalkan besok, [event_date formatted]. Mohon konfirmasi kehadiran ya 🙏 – [business_name]
```

### Reminder Invoice (H-2)
```
Halo [client_name]! 👋 Mengingatkan bahwa invoice [invoice_number] senilai [grand_total formatted] akan jatuh tempo pada [due_date formatted]. Mohon segera dilunasi ya 🙏 – [business_name]
```

`business_name` diambil dari `company_settings.business_name`. Jika kosong, fallback ke workspace_name.

## UI

Row di "Agenda Hari Ini" untuk reminder dibedakan secara visual:
- Background: biru sangat muda (lebih soft dari row biasa)
- Icon: `MessageCircle` (WA nuance) warna hijau `#16A34A`
- Label: nama klien + event (misal "Sesi Besok: Budi Santoso")
- Tombol: "Kirim Reminder WA" — `<a href={waUrl} target="_blank">` dengan styling hijau

## File yang Diubah

| File | Perubahan |
|---|---|
| `lib/utils/whatsapp.ts` | Tambah `buildSessionReminderMessage()` dan `buildInvoiceReminderMessage()` |
| `app/(app)/dashboard/actions.ts` | Tambah `getWAReminderData()` — query H-1 leads dan H-2 invoices dengan phone |
| `app/(app)/dashboard/page.tsx` | Panggil `getWAReminderData()`, render row reminder di Agenda |

## Edge Cases

- Lead tanpa phone → row tetap muncul, tombol disabled dengan teks "Nomor WA tidak ada"
- Invoice tanpa lead terhubung → row muncul, tombol disabled
- `business_name` kosong → gunakan workspace_name, jika tetap kosong hilangkan suffix "– [nama]"
- Sesi hari ini sudah tampil di Agenda biasa → H-1 row adalah tambahan terpisah (besok, bukan hari ini)

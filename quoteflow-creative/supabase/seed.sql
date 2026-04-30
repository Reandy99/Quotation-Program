-- QuoteFlow Creative — Seed Data
-- Replace 'YOUR_USER_ID' with your actual Supabase auth user UUID

do $$
declare
  uid uuid := 'YOUR_USER_ID'; -- Replace this!
  lead1 uuid := gen_random_uuid();
  lead2 uuid := gen_random_uuid();
  lead3 uuid := gen_random_uuid();
  lead4 uuid := gen_random_uuid();
  lead5 uuid := gen_random_uuid();
  q1 uuid := gen_random_uuid();
  q2 uuid := gen_random_uuid();
  q3 uuid := gen_random_uuid();
begin

-- Company Settings
insert into public.company_settings (user_id, business_name, email, phone, website, address, default_terms, default_payment_terms)
values (
  uid,
  'Whitepaper Production',
  'hello@whitepaper.site',
  '+62 812 3456 7890',
  'https://whitepaper.site',
  'Jakarta Selatan, DKI Jakarta',
  '1. Pembayaran DP 50% sebelum hari H untuk konfirmasi booking.' || chr(10) ||
  '2. Pelunasan dilakukan maksimal H-1 sebelum event.' || chr(10) ||
  '3. Pembatalan kurang dari 7 hari sebelum event tidak dapat dikembalikan.' || chr(10) ||
  '4. File final dikirimkan dalam 7-14 hari kerja setelah event.',
  'Transfer bank ke BCA 1234567890 a/n Whitepaper Production'
);

-- Leads
insert into public.leads (id, user_id, client_name, company_name, email, phone, project_type, event_date, location, estimated_budget, status, follow_up_date, notes)
values
  (lead1, uid, 'Budi Santoso', 'PT. Maju Bersama', 'budi@majubersama.co.id', '+62 811 1111 1111',
   'Corporate Event Documentation', '2026-05-15', 'Hotel Mulia, Jakarta Selatan', 15000000,
   'Quoted', '2026-05-01', 'Annual company gathering, 200 pax. Butuh foto dan video highlight.'),

  (lead2, uid, 'Sari Dewi', 'PT. Kreasi Nusantara', 'sari@kreasinus.com', '+62 812 2222 2222',
   'Company Profile Video', null, 'Kantor Pusat, Jakarta Barat', 25000000,
   'Contacted', '2026-05-03', 'Video company profile 3-5 menit untuk website dan LinkedIn.'),

  (lead3, uid, 'Andi Wijaya', 'Wijaya Property Group', 'andi@wijayaproperty.com', '+62 813 3333 3333',
   'Interior Photography', '2026-05-20', 'Apartemen The Peak, Sudirman', 8000000,
   'New', '2026-05-05', 'Foto interior 2 unit show unit untuk marketing material.'),

  (lead4, uid, 'Rina Kusuma', 'PT. Produk Unggulan', 'rina@produkunggulan.id', '+62 814 4444 4444',
   'Product Launch Documentation', '2026-06-01', 'Grand Ballroom, Hotel Indonesia Kempinski', 20000000,
   'Follow Up', '2026-05-02', 'Peluncuran produk baru, butuh foto dan video untuk press release dan sosmed.'),

  (lead5, uid, 'Hendra Gunawan', 'PT. Gala Malam Indah', 'hendra@galamalam.com', '+62 815 5555 5555',
   'Annual Dinner Documentation', '2026-05-30', 'Ballroom Ritz-Carlton, Pacific Place', 18000000,
   'Won', null, 'Annual dinner 300 pax. Deal sudah confirmed. DP sudah masuk.');

-- Quotations
insert into public.quotations (id, user_id, lead_id, quote_number, project_title, project_type, event_date, location, valid_until, discount_type, discount_value, tax_percent, subtotal, grand_total, status, notes, terms)
values
  (q1, uid, lead1, 'QF-2026-001', 'Annual Gathering PT. Maju Bersama 2026',
   'Corporate Event Documentation', '2026-05-15', 'Hotel Mulia, Jakarta Selatan', '2026-05-05',
   'flat', 0, 11, 13500000, 14985000, 'Sent',
   'Termasuk 1 fotografer dan 1 videografer. File dikirim dalam 7 hari kerja.',
   '50% DP untuk konfirmasi. Pelunasan H-1 event.'),

  (q2, uid, lead4, 'QF-2026-002', 'Product Launch PT. Produk Unggulan',
   'Product Launch Documentation', '2026-06-01', 'Grand Ballroom, Hotel Indonesia Kempinski', '2026-05-15',
   'percent', 10, 11, 22000000, 21978000, 'Draft',
   'Paket lengkap: foto produk, foto event, video highlight 2 menit.',
   '50% DP untuk konfirmasi. Pelunasan H-1 event.'),

  (q3, uid, lead5, 'QF-2026-003', 'Annual Dinner PT. Gala Malam Indah 2026',
   'Annual Dinner Documentation', '2026-05-30', 'Ballroom Ritz-Carlton, Pacific Place', '2026-05-10',
   'flat', 0, 11, 16500000, 18315000, 'Accepted',
   '2 fotografer + 1 videografer. Highlight video 3 menit + full documentation.',
   '50% DP sudah diterima. Pelunasan H-1 event.');

-- Quotation Items for Q1
insert into public.quotation_items (quotation_id, user_id, item_name, description, quantity, unit_price, total_price, sort_order)
values
  (q1, uid, 'Fotografer Event', 'Dokumentasi foto selama 8 jam', 1, 5000000, 5000000, 0),
  (q1, uid, 'Videografer Event', 'Dokumentasi video selama 8 jam', 1, 5000000, 5000000, 1),
  (q1, uid, 'Video Highlight', 'Video highlight 2-3 menit, full edit + color grading', 1, 2500000, 2500000, 2),
  (q1, uid, 'Editing Foto', '200 foto terpilih, retouching & color grading', 1, 1000000, 1000000, 3);

-- Quotation Items for Q2
insert into public.quotation_items (quotation_id, user_id, item_name, description, quantity, unit_price, total_price, sort_order)
values
  (q2, uid, 'Fotografer Event', 'Dokumentasi foto selama 10 jam', 2, 5000000, 10000000, 0),
  (q2, uid, 'Videografer Event', 'Dokumentasi video selama 10 jam', 1, 6000000, 6000000, 1),
  (q2, uid, 'Video Highlight', 'Video highlight 2 menit untuk sosmed', 1, 3000000, 3000000, 2),
  (q2, uid, 'Foto Produk', 'Foto produk on-location, 20 foto final', 1, 3000000, 3000000, 3);

-- Quotation Items for Q3
insert into public.quotation_items (quotation_id, user_id, item_name, description, quantity, unit_price, total_price, sort_order)
values
  (q3, uid, 'Fotografer Event', 'Dokumentasi foto selama 8 jam', 2, 5000000, 10000000, 0),
  (q3, uid, 'Videografer Event', 'Dokumentasi video selama 8 jam', 1, 5000000, 5000000, 1),
  (q3, uid, 'Video Highlight', 'Video highlight 3 menit, cinematic edit', 1, 1500000, 1500000, 2);

end $$;

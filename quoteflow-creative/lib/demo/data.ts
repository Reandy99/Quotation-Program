import type { Lead, Quotation, QuotationItem, CompanySettings, Client, Invoice, Payment } from "@/types"

export const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const demoLeads: Lead[] = [
  { id: "1", user_id: "demo", client_name: "Budi Santoso", company_name: null, email: "budi@example.com", phone: "+62 812 0001 0001", project_type: "Wedding Photography", event_date: "2026-06-15", location: "Jakarta", estimated_budget: 15000000, notes: "Outdoor ceremony preferred.", status: "New", follow_up_date: "2026-05-01", created_at: "2026-04-28T10:00:00Z", updated_at: "2026-04-28T10:00:00Z" },
  { id: "2", user_id: "demo", client_name: "Sari Dewi", company_name: "PT Maju Bersama", email: "sari@maju.co.id", phone: "+62 812 0002 0002", project_type: "Corporate Event", event_date: "2026-05-20", location: "Surabaya", estimated_budget: 8500000, notes: null, status: "Quoted", follow_up_date: "2026-05-05", created_at: "2026-04-27T09:00:00Z", updated_at: "2026-04-27T09:00:00Z" },
  { id: "3", user_id: "demo", client_name: "Andi Wijaya", company_name: null, email: "andi@example.com", phone: "+62 812 0003 0003", project_type: "Product Photography", event_date: null, location: "Bandung", estimated_budget: 3200000, notes: null, status: "Won", follow_up_date: null, created_at: "2026-04-25T14:00:00Z", updated_at: "2026-04-25T14:00:00Z" },
  { id: "4", user_id: "demo", client_name: "Rina Kusuma", company_name: null, email: "rina@example.com", phone: "+62 812 0004 0004", project_type: "Prewedding", event_date: "2026-07-10", location: "Bali", estimated_budget: 12000000, notes: null, status: "Follow Up", follow_up_date: "2026-04-29", created_at: "2026-04-24T11:00:00Z", updated_at: "2026-04-24T11:00:00Z" },
  { id: "5", user_id: "demo", client_name: "Doni Pratama", company_name: null, email: "doni@example.com", phone: "+62 812 0005 0005", project_type: "Birthday Party", event_date: "2026-05-01", location: "Yogyakarta", estimated_budget: 5000000, notes: null, status: "Lost", follow_up_date: null, created_at: "2026-04-22T08:00:00Z", updated_at: "2026-04-22T08:00:00Z" },
  { id: "6", user_id: "demo", client_name: "Maya Putri", company_name: "Studio Kreatif", email: "maya@studio.id", phone: "+62 812 0006 0006", project_type: "Fashion Shoot", event_date: "2026-05-25", location: "Jakarta", estimated_budget: 6500000, notes: null, status: "Contacted", follow_up_date: "2026-05-10", created_at: "2026-04-20T10:00:00Z", updated_at: "2026-04-20T10:00:00Z" },
]

const demoItems: QuotationItem[] = [
  { id: "i1", quotation_id: "1", user_id: "demo", item_name: "Wedding Photography (Full Day)", description: "8 hours coverage, 2 photographers", quantity: 1, unit_price: 10000000, total_price: 10000000, sort_order: 0, created_at: "2026-04-28T10:00:00Z", updated_at: "2026-04-28T10:00:00Z" },
  { id: "i2", quotation_id: "1", user_id: "demo", item_name: "Photo Album (30x40cm)", description: "Premium lay-flat album, 60 pages", quantity: 1, unit_price: 3500000, total_price: 3500000, sort_order: 1, created_at: "2026-04-28T10:00:00Z", updated_at: "2026-04-28T10:00:00Z" },
  { id: "i3", quotation_id: "2", user_id: "demo", item_name: "Event Photography", description: "4 hours coverage", quantity: 1, unit_price: 5000000, total_price: 5000000, sort_order: 0, created_at: "2026-04-27T09:00:00Z", updated_at: "2026-04-27T09:00:00Z" },
  { id: "i4", quotation_id: "2", user_id: "demo", item_name: "Event Videography", description: "4 hours, highlight reel 3 min", quantity: 1, unit_price: 4000000, total_price: 4000000, sort_order: 1, created_at: "2026-04-27T09:00:00Z", updated_at: "2026-04-27T09:00:00Z" },
  { id: "i5", quotation_id: "3", user_id: "demo", item_name: "Product Photography", description: "Up to 20 SKUs, white background", quantity: 1, unit_price: 3200000, total_price: 3200000, sort_order: 0, created_at: "2026-04-25T14:00:00Z", updated_at: "2026-04-25T14:00:00Z" },
]

export const demoQuotations: (Quotation & { items: QuotationItem[] })[] = [
  { id: "1", user_id: "demo", lead_id: "1", quote_number: "QF-2026-001", project_title: "Budi & Sinta Wedding", project_type: "Wedding Photography", event_date: "2026-06-15", location: "Jakarta", valid_until: "2026-05-15", discount_type: "flat", discount_value: 500000, tax_percent: 11, subtotal: 13500000, grand_total: 14410000, notes: "Terima kasih atas kepercayaan Anda.", terms: "50% DP untuk konfirmasi booking.", status: "Sent", created_at: "2026-04-28T10:00:00Z", updated_at: "2026-04-28T10:00:00Z", lead: demoLeads[0], items: demoItems.filter(i => i.quotation_id === "1") },
  { id: "2", user_id: "demo", lead_id: "2", quote_number: "QF-2026-002", project_title: "PT Maju Bersama Annual Event", project_type: "Corporate Event", event_date: "2026-05-20", location: "Surabaya", valid_until: "2026-05-10", discount_type: "percent", discount_value: 5, tax_percent: 11, subtotal: 9000000, grand_total: 9499500, notes: null, terms: "Invoice dikirim H-7 acara.", status: "Accepted", created_at: "2026-04-27T09:00:00Z", updated_at: "2026-04-27T09:00:00Z", lead: demoLeads[1], items: demoItems.filter(i => i.quotation_id === "2") },
  { id: "3", user_id: "demo", lead_id: "3", quote_number: "QF-2026-003", project_title: "Andi Product Shoot", project_type: "Product Photography", event_date: null, location: "Bandung", valid_until: "2026-05-25", discount_type: "flat", discount_value: 0, tax_percent: 0, subtotal: 3200000, grand_total: 3200000, notes: null, terms: null, status: "Draft", created_at: "2026-04-25T14:00:00Z", updated_at: "2026-04-25T14:00:00Z", lead: demoLeads[2], items: demoItems.filter(i => i.quotation_id === "3") },
]

export const demoClients: Client[] = [
  { id: "c1", user_id: "demo", name: "Budi Santoso", company: null, email: "budi@example.com", phone: "+62 812 0001 0001", address: "Jakarta", total_projects: 2, total_revenue: 28000000, created_at: "2026-01-15T10:00:00Z", updated_at: "2026-04-28T10:00:00Z" },
  { id: "c2", user_id: "demo", name: "Sari Dewi", company: "PT Maju Bersama", email: "sari@maju.co.id", phone: "+62 812 0002 0002", address: "Surabaya", total_projects: 3, total_revenue: 25000000, created_at: "2026-02-10T09:00:00Z", updated_at: "2026-04-27T09:00:00Z" },
  { id: "c3", user_id: "demo", name: "Andi Wijaya", company: null, email: "andi@example.com", phone: "+62 812 0003 0003", address: "Bandung", total_projects: 1, total_revenue: 3200000, created_at: "2026-03-05T14:00:00Z", updated_at: "2026-04-25T14:00:00Z" },
  { id: "c4", user_id: "demo", name: "Maya Putri", company: "Studio Kreatif", email: "maya@studio.id", phone: "+62 812 0006 0006", address: "Jakarta", total_projects: 4, total_revenue: 32000000, created_at: "2025-11-20T10:00:00Z", updated_at: "2026-04-20T10:00:00Z" },
]

export const demoInvoices: Invoice[] = [
  { id: "inv1", user_id: "demo", quotation_id: "2", invoice_number: "INV-2026-001", client_name: "Sari Dewi - PT Maju Bersama", project_title: "PT Maju Bersama Annual Event", issue_date: "2026-04-28", due_date: "2026-05-13", subtotal: 9000000, discount: 450000, tax: 940950, grand_total: 9490950, paid_amount: 9490950, status: "Paid", notes: null, created_at: "2026-04-28T10:00:00Z", updated_at: "2026-04-28T10:00:00Z" },
  { id: "inv2", user_id: "demo", quotation_id: "3", invoice_number: "INV-2026-002", client_name: "Andi Wijaya", project_title: "Andi Product Shoot", issue_date: "2026-04-26", due_date: "2026-05-03", subtotal: 3200000, discount: 0, tax: 0, grand_total: 3200000, paid_amount: 1600000, status: "Partial", notes: null, created_at: "2026-04-26T10:00:00Z", updated_at: "2026-04-26T10:00:00Z" },
  { id: "inv3", user_id: "demo", quotation_id: null, invoice_number: "INV-2026-003", client_name: "Maya Putri - Studio Kreatif", project_title: "Fashion Editorial Shoot", issue_date: "2026-04-20", due_date: "2026-04-27", subtotal: 8000000, discount: 0, tax: 880000, grand_total: 8880000, paid_amount: 0, status: "Overdue", notes: null, created_at: "2026-04-20T10:00:00Z", updated_at: "2026-04-20T10:00:00Z" },
]

export const demoPayments: Payment[] = [
  { id: "p1", invoice_id: "inv1", amount: 9490950, method: "Transfer", date: "2026-04-28", notes: "Pembayaran lunas", created_at: "2026-04-28T14:00:00Z" },
  { id: "p2", invoice_id: "inv2", amount: 1600000, method: "Cash", date: "2026-04-26", notes: "DP 50%", created_at: "2026-04-26T15:00:00Z" },
]

export const demoCompany: CompanySettings = {
  id: "demo",
  user_id: "demo",
  business_name: "Whitepaper Production",
  logo_url: null,
  email: "hello@whitepaper.id",
  phone: "+62 812 9999 0000",
  website: "https://whitepaper.id",
  address: "Jakarta Selatan, Indonesia",
  default_terms: "50% down payment required to confirm booking. Remaining balance due on event day.",
  default_payment_terms: "Payment via bank transfer within 3 days of invoice.",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

export function findLeadById(id: string) {
  return demoLeads.find(l => l.id === id) ?? null
}

export function findQuotationById(id: string) {
  return demoQuotations.find(q => q.id === id) ?? null
}

export function getLeadQuotations(leadId: string) {
  return demoQuotations.filter(q => q.lead_id === leadId)
}

export function findClientById(id: string) {
  return demoClients.find(c => c.id === id) ?? null
}

export function findInvoiceById(id: string) {
  return demoInvoices.find(i => i.id === id) ?? null
}

export function getInvoicePayments(invoiceId: string) {
  return demoPayments.filter(p => p.invoice_id === invoiceId)
}

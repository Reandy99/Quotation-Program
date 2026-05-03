export type LeadStatus = "New" | "Contacted" | "Quoted" | "Follow Up" | "Won" | "Lost"
export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected"
export type DiscountType = "flat" | "percent"
export type InvoiceStatus = "Draft" | "Sent" | "Partial" | "Paid" | "Overdue"
export type PaymentMethod = "Transfer" | "Cash" | "QRIS"
export type FollowUpType = "call" | "email" | "meeting" | "whatsapp" | "other"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  id: string
  user_id: string
  business_name: string | null
  logo_url: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  default_terms: string | null
  default_payment_terms: string | null
  created_at: string
  updated_at: string
  signer_name?: string | null
  signer_title?: string | null
  signature_url?: string | null
  google_review_url?: string | null
}

export interface Lead {
  id: string
  user_id: string
  client_name: string
  company_name: string | null
  email: string | null
  phone: string | null
  project_type: string | null
  event_date: string | null
  location: string | null
  estimated_budget: number | null
  notes: string | null
  status: LeadStatus
  follow_up_date: string | null
  created_at: string
  updated_at: string
}

export interface QuotationItem {
  id: string
  quotation_id: string
  user_id: string
  item_name: string
  description: string | null
  quantity: number
  unit_price: number
  total_price: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Quotation {
  id: string
  user_id: string
  lead_id: string | null
  quote_number: string
  project_title: string
  project_type: string | null
  event_date: string | null
  location: string | null
  valid_until: string | null
  discount_type: DiscountType
  discount_value: number
  tax_percent: number
  subtotal: number
  grand_total: number
  notes: string | null
  terms: string | null
  status: QuotationStatus
  created_at: string
  updated_at: string
  lead?: Lead
  items?: QuotationItem[]
}

export interface Client {
  id: string
  user_id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  address: string | null
  total_projects: number
  total_revenue: number
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  quotation_id: string | null
  invoice_number: string
  client_name: string
  project_title: string
  issue_date: string
  due_date: string
  subtotal: number
  discount: number
  tax: number
  grand_total: number
  paid_amount: number
  status: InvoiceStatus
  notes: string | null
  created_at: string
  updated_at: string
  items?: QuotationItem[]
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  method: PaymentMethod
  date: string
  notes: string | null
  created_at: string
}

export type SubscriptionStatus = "trialing" | "active" | "expired" | "cancelled" | "past_due"

export interface Plan {
  id: string
  name: string
  price_idr: number
  interval: "month" | "year"
  features: string[]
  is_active: boolean
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  trial_end: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  gateway: string | null
  gateway_subscription_id: string | null
  gateway_customer_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  plan?: Plan
}

export interface BillingPayment {
  id: string
  user_id: string
  subscription_id: string | null
  plan_id: string
  amount_idr: number
  status: "pending" | "paid" | "failed" | "refunded"
  paid_at: string | null
  period_start: string | null
  period_end: string | null
  gateway: string | null
  gateway_payment_id: string | null
  gateway_invoice_url: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  plan?: Plan
}

export interface FollowUp {
  id: string
  user_id: string
  lead_id: string | null
  type: FollowUpType
  scheduled_date: string
  notes: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
  lead?: Lead
}

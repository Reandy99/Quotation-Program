const XENDIT_BASE_URL = "https://api.xendit.co"

function getAuthHeader(): string {
  const secretKey = process.env.XENDIT_SECRET_KEY
  if (!secretKey) throw new Error("XENDIT_SECRET_KEY tidak dikonfigurasi di .env.local")
  return "Basic " + Buffer.from(secretKey + ":").toString("base64")
}

export interface XenditInvoice {
  id: string
  external_id: string
  invoice_url: string
  status: string
  amount: number
  paid_amount?: number
}

export async function createXenditInvoice(params: {
  externalId: string
  amount: number
  payerEmail?: string | null
  description: string
}): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail ?? undefined,
      description: params.description,
      currency: "IDR",
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `Xendit error: ${res.status}`)
  }

  return res.json()
}

export async function getXenditInvoice(xenditInvoiceId: string): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices/${xenditInvoiceId}`, {
    headers: { Authorization: getAuthHeader() },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `Xendit error: ${res.status}`)
  }

  return res.json()
}

export function verifyXenditWebhook(callbackToken: string): boolean {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN
  if (!expected) return false
  return callbackToken === expected
}

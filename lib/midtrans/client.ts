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
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY environment variable is not set")
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

  const data = await res.json() as { redirect_url?: string }
  if (!data.redirect_url) {
    throw new Error("Midtrans did not return a redirect URL")
  }
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
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) return false
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex")
  const hashBuffer = Buffer.from(hash, "hex")
  const keyBuffer = Buffer.from(signatureKey, "hex")
  if (hashBuffer.length !== keyBuffer.length) return false
  return crypto.timingSafeEqual(hashBuffer, keyBuffer)
}

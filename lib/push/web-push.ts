import crypto from "crypto"

export interface StoredPushSubscription {
  id: string
  endpoint: string
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBuffer(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=")
  return Buffer.from(padded, "base64")
}

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@frameflow.app"

  if (!publicKey || !privateKey) return null
  return { publicKey, privateKey, subject }
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
}

function createVapidToken(endpoint: string) {
  const config = getVapidConfig()
  if (!config) return null

  const endpointUrl = new URL(endpoint)
  const publicKeyBuffer = base64UrlToBuffer(config.publicKey)
  const privateKeyBuffer = base64UrlToBuffer(config.privateKey)

  if (publicKeyBuffer.length !== 65 || publicKeyBuffer[0] !== 4) return null
  if (privateKeyBuffer.length !== 32) return null

  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: base64Url(publicKeyBuffer.subarray(1, 33)),
    y: base64Url(publicKeyBuffer.subarray(33, 65)),
    d: base64Url(privateKeyBuffer),
  }

  const header = base64Url(JSON.stringify({ typ: "JWT", alg: "ES256" }))
  const payload = base64Url(JSON.stringify({
    aud: endpointUrl.origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: config.subject,
  }))

  const sign = crypto.createSign("SHA256")
  sign.update(`${header}.${payload}`)
  sign.end()
  const signature = sign.sign({ key: jwk, format: "jwk", dsaEncoding: "ieee-p1363" })

  return {
    publicKey: config.publicKey,
    token: `${header}.${payload}.${base64Url(signature)}`,
  }
}

export async function sendWebPushPing(subscription: StoredPushSubscription) {
  const vapid = createVapidToken(subscription.endpoint)
  if (!vapid) return { ok: false, status: 0, skipped: true }

  try {
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        TTL: "2419200",
        Urgency: "high",
        Authorization: `vapid t=${vapid.token}, k=${vapid.publicKey}`,
      },
    })

    return { ok: response.ok, status: response.status, skipped: false }
  } catch (error) {
    console.error("Failed to send web push notification:", error)
    return { ok: false, status: 0, skipped: false }
  }
}

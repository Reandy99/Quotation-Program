export function normalizeWhatsAppNumber(input?: string | null, defaultCountryCode = "62"): string {
  if (!input) return ""
  const digits = input.replace(/\D/g, "")
  if (!digits) return ""

  let normalized: string
  if (digits.startsWith("0")) {
    normalized = defaultCountryCode + digits.slice(1)
  } else if (digits.startsWith(defaultCountryCode)) {
    normalized = digits
  } else if (digits.startsWith("8")) {
    normalized = defaultCountryCode + digits
  } else {
    normalized = digits
  }

  return normalized.length >= 9 ? normalized : ""
}

export function buildWhatsAppUrl(phone?: string | null, text?: string): string | null {
  const normalized = normalizeWhatsAppNumber(phone)
  if (!normalized && !phone) {
    // no phone — open WA without number if text provided
    if (!text) return null
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }
  if (!normalized) return null
  const base = `https://wa.me/${normalized}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

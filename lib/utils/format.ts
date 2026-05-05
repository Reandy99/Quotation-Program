export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "Rp 0"
  return "Rp " + amount.toLocaleString("id-ID")
}

export function formatDate(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatDateShort(date: string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

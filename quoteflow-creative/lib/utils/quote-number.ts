export function generateQuoteNumber(existingCount: number): string {
  const year = new Date().getFullYear()
  const seq = (existingCount + 1).toString().padStart(3, "0")
  return `QF-${year}-${seq}`
}

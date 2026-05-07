import { GoogleGenerativeAI } from "@google/generative-ai"
import type { ServicePackage } from "@/types"

export interface AIQuotationItem {
  item_name: string
  description: string
  quantity: number
  unit_price: number
}

function buildPrompt(brief: string, packages: ServicePackage[]): string {
  const packageContext = packages.length > 0
    ? `\n\nPackage referensi user (gunakan harga ini sebagai acuan):\n${packages.map(p =>
        `- ${p.name}: ${p.items.map(i => `${i.name} (Rp ${i.price.toLocaleString("id-ID")})`).join(", ")}`
      ).join("\n")}`
    : ""

  return `Kamu adalah asisten pembuatan penawaran untuk bisnis kreatif (fotografer, videografer, studio) di Indonesia.

Buat daftar item penawaran berdasarkan brief berikut:
"${brief}"${packageContext}

Kembalikan HANYA JSON array murni (tanpa markdown, tanpa kode block) dengan format:
[
  {
    "item_name": "nama item singkat (maks 50 karakter)",
    "description": "deskripsi singkat (maks 100 karakter, boleh kosong)",
    "quantity": 1,
    "unit_price": 0
  }
]

Aturan:
- Harga dalam IDR (Rupiah), sesuai harga pasar Indonesia
- Jika ada package referensi, gunakan harga tersebut
- Buat 3–7 item yang relevan
- Jangan masukkan diskon atau pajak sebagai item
- unit_price harus angka bulat (bukan string)
- Kembalikan pure JSON array saja, tidak ada teks lain`
}

export async function generateQuotationItems(
  brief: string,
  packages: ServicePackage[]
): Promise<AIQuotationItem[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY tidak dikonfigurasi di .env.local")

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  const result = await model.generateContent(buildPrompt(brief, packages))
  const text = result.response.text().trim()

  // Strip markdown code block jika ada
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()

  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error("Respons AI bukan array")

  return parsed.map((item: any) => ({
    item_name: String(item.item_name ?? ""),
    description: String(item.description ?? ""),
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
  }))
}

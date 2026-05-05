"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useLiveCompanySettings } from "@/lib/settings/useLiveSettings"
import { normalizeWhatsAppNumber, buildWhatsAppUrl } from "@/lib/utils/whatsapp"

const templates = [
  {
    label: "After Quotation Sent",
    text: `Halo [Nama Klien], selamat siang 🙏

Saya ingin memastikan apakah penawaran yang kami kirimkan sudah diterima dengan baik. Jika ada pertanyaan atau hal yang ingin didiskusikan lebih lanjut mengenai detail paket atau harga, kami dengan senang hati siap membantu.

Terima kasih atas kepercayaan Anda. Kami berharap dapat bekerja sama untuk mendokumentasikan momen penting perusahaan Anda.

Salam,
[Nama Anda]`,
  },
  {
    label: "Warm Lead Follow-up",
    text: `Halo [Nama Klien], semoga hari Anda menyenangkan 😊

Kami ingin menindaklanjuti diskusi kita sebelumnya mengenai kebutuhan dokumentasi [jenis proyek] Anda. Kami sudah menyiapkan beberapa opsi yang mungkin sesuai dengan kebutuhan dan anggaran Anda.

Apakah ada waktu yang nyaman untuk kita diskusikan lebih lanjut? Kami bisa menyesuaikan jadwal sesuai kenyamanan Anda.

Terima kasih,
[Nama Anda]`,
  },
  {
    label: "Final Follow-up",
    text: `Halo [Nama Klien], salam hangat 🙏

Ini adalah pesan terakhir dari kami terkait penawaran dokumentasi yang sebelumnya kami sampaikan. Kami memahami bahwa setiap keputusan membutuhkan pertimbangan yang matang.

Jika saat ini belum tepat waktunya, tidak masalah sama sekali. Kami tetap terbuka jika di kemudian hari Anda membutuhkan jasa dokumentasi profesional untuk event perusahaan Anda.

Terima kasih sudah meluangkan waktu. Semoga sukses selalu untuk bisnis Anda!

Salam,
[Nama Anda]`,
  },
]

export default function WhatsAppTemplates() {
  const [copied, setCopied] = useState<number | null>(null)
  const company = useLiveCompanySettings()
  const normalizedPhone = normalizeWhatsAppNumber(company.phone)

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleWhatsApp(text: string) {
    const url = buildWhatsAppUrl(undefined, text)
    if (url) window.open(url, "_blank")
  }

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base text-gray-900 dark:text-gray-100">WhatsApp Follow-up Templates</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">Copy and customize these templates for your follow-up messages</p>
          </div>
          {normalizedPhone && (
            <a
              href={`https://wa.me/${normalizedPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs text-green-600 dark:text-green-400 underline underline-offset-2 hover:text-green-700 dark:hover:text-green-300"
            >
              Open WA · {company.phone}
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((tpl, i) => (
          <div key={i} className="border rounded-lg p-4 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Template {i + 1}: {tpl.label}</span>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWhatsApp(tpl.text)}
                  className="h-7 text-xs text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                >
                  Send via WA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(tpl.text, i)}
                  className="h-7 text-xs dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {copied === i ? <><Check className="w-3 h-3 mr-1 text-green-500" />Copied!</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                </Button>
              </div>
            </div>
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 dark:bg-gray-800 rounded p-3">
              {tpl.text}
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

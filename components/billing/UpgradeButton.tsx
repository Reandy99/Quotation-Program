"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createSubscriptionPaymentLink } from "@/lib/billing/actions"
import { toast } from "@/hooks/use-toast"

interface Props {
  label?: string
  className?: string
  style?: React.CSSProperties
}

export default function UpgradeButton({ label = "Upgrade ke Pro", className, style }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const { paymentUrl } = await createSubscriptionPaymentLink()
      window.location.href = paymentUrl
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal membuat link pembayaran",
        description: error.message || "Terjadi kesalahan. Coba lagi.",
      })
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={className}
      style={style}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Memproses...
        </span>
      ) : label}
    </button>
  )
}

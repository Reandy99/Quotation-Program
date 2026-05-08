"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Mail, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = String(formData.get("email") || "").trim()
    const redirectTo = `${window.location.origin}/reset-password`

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      toast({
        variant: "destructive",
        title: "Unable to send reset link",
        description: error.message,
      })
      setLoading(false)
      return
    }

    setSentTo(email)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm mb-4 bg-gradient-to-br from-amber-500 to-rose-400">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Reset your password</h1>
          <p className="text-sm mt-1 text-center" style={{ color: "var(--text-secondary)" }}>
            Enter your email and we will send a secure reset link.
          </p>
        </div>

        <div
          className="rounded-2xl border shadow-sm p-8"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          {sentTo ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Check your email</h2>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                We sent a password reset link to <span className="font-medium" style={{ color: "var(--text-primary)" }}>{sentTo}</span>.
              </p>
              <Link href="/login" className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-medium hover:underline" style={{ color: "var(--text-primary)" }}>
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={loading}
                  placeholder="you@studio.com"
                  className="w-full px-3.5 py-2.5 border rounded-lg text-sm placeholder:opacity-70 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow disabled:opacity-50"
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--app-bg)",
                    color: "var(--text-primary)",
                    boxShadow: "none",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-white rounded-lg font-medium text-sm transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: "var(--btn-dark)" }}
              >
                {loading ? "Sending reset link..." : "Send reset link"}
              </button>
              <Link href="/login" className="flex items-center justify-center gap-2 text-xs font-medium hover:underline" style={{ color: "var(--text-secondary)" }}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

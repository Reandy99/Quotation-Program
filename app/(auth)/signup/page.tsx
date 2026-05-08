"use client"

import Link from "next/link"
import { useState } from "react"
import { Zap, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmedEmail, setConfirmedEmail] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm_password") as string

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "Please make sure both password fields match.",
      })
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      })
      setLoading(false)
      return
    }

    // Jika session null → Supabase butuh konfirmasi email dulu
    if (!data.session) {
      setConfirmedEmail(email)
      setConfirming(true)
      setLoading(false)
      return
    }

    // Session langsung ada → langsung masuk
    toast({ variant: "success", title: "Akun dibuat!", description: "Mengarahkan ke dashboard..." })
    window.location.assign("/dashboard")
  }

  if (confirming) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--app-bg)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Cek emailmu</h1>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            Link konfirmasi dikirim ke:
          </p>
          <p className="font-medium text-sm mb-5" style={{ color: "var(--text-primary)" }}>{confirmedEmail}</p>
          <p className="text-xs mb-6" style={{ color: "var(--text-secondary)" }}>
            Klik link di email tersebut, lalu kembali ke halaman login untuk masuk.
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--btn-dark)" }}
          >
            Ke halaman login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm mb-4 bg-gradient-to-br from-amber-500 to-rose-400">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Create your account</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Start your FrameFlow workspace</p>
        </div>

        <div
          className="rounded-2xl border shadow-sm p-8"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Business email</label>
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
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Password</label>
              <input
                type="password"
                name="password"
                required
                disabled={loading}
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm placeholder:opacity-70 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow disabled:opacity-50"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--app-bg)",
                  color: "var(--text-primary)",
                  boxShadow: "none",
                }}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                Use at least 8 characters. A mix of letters, numbers, and symbols is recommended.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Confirm password</label>
              <input
                type="password"
                name="confirm_password"
                required
                disabled={loading}
                minLength={8}
                placeholder="Repeat your password"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--text-primary)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

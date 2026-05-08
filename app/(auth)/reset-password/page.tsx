"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckCircle2, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function prepareSession() {
      const supabase = createClient()
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          toast({
            variant: "destructive",
            title: "Reset link expired",
            description: "Please request a new password reset link.",
          })
        } else {
          window.history.replaceState({}, "", "/reset-password")
        }
      }

      setReady(true)
    }

    prepareSession()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = String(formData.get("password") || "")
    const confirmPassword = String(formData.get("confirm_password") || "")

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
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast({
        variant: "destructive",
        title: "Unable to update password",
        description: error.message,
      })
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm mb-4 bg-gradient-to-br from-amber-500 to-rose-400">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Create a new password</h1>
          <p className="text-sm mt-1 text-center" style={{ color: "var(--text-secondary)" }}>
            Choose a secure password for your FrameFlow account.
          </p>
        </div>

        <div
          className="rounded-2xl border shadow-sm p-8"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Password updated</h2>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-block px-5 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--btn-dark)" }}
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>New password</label>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={loading || !ready}
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Confirm new password</label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  disabled={loading || !ready}
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
                <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                  Use at least 8 characters. Avoid reusing passwords from other accounts.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || !ready}
                className="w-full py-2.5 text-white rounded-lg font-medium text-sm transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: "var(--btn-dark)" }}
              >
                {loading ? "Updating password..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useState } from "react"
import { Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      })
      setLoading(false)
    } else {
      toast({
        variant: "success",
        title: "Account created!",
        description: "Redirecting to dashboard...",
      })
      window.location.assign("/dashboard")
    }
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

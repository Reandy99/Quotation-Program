"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { useState, memo } from "react"

interface UserSectionProps {
  email: string
  initials: string
}

export const UserSection = memo(function UserSection({ email, initials }: UserSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    if (loading) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      })
      setLoading(false)
    } else {
      toast({
        variant: "success",
        title: "Logged out",
        description: "See you soon!",
      })
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: "var(--border-color)", color: "var(--text-primary)" }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
          {email.split("@")[0]}
        </p>
        <p className="text-[10px] truncate" style={{ color: "var(--text-secondary)" }}>
          {email}
        </p>
      </div>
      <button
        onClick={handleLogout}
        disabled={loading}
        title="Sign out"
        className="disabled:opacity-50"
      >
        <LogOut className="w-4 h-4 transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }} />
      </button>
    </div>
  )
})

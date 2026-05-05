"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { createClient } from "../actions"

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", address: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    setLoading(true)
    try {
      await createClient({
        name: form.name,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
      })
      toast({
        variant: "success",
        title: "Client created",
        description: "The client has been added successfully.",
      })
      router.push("/clients")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create client",
        description: error.message,
      })
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="New Client"
        description="Add a new client to your database"
        action={<Link href="/clients"><Button variant="outline">Cancel</Button></Link>}
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label>Company</Label>
            <Input
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Link href="/clients">
              <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

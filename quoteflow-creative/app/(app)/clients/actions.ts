"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { logAudit } from "@/lib/utils/audit"
import { revalidatePath } from "next/cache"
import type { Client } from "@/types"

export async function getClients(): Promise<Client[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createClient(client: Omit<Client, "id" | "user_id" | "created_at" | "updated_at" | "total_projects" | "total_revenue">) {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...client,
      user_id: user.id,
      total_projects: 0,
      total_revenue: 0,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logAudit("create", "client", data.id, { name: client.name })
  revalidatePath("/clients")
  return data
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

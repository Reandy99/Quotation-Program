"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { FollowUp, FollowUpType } from "@/types"

export async function getFollowUps(): Promise<FollowUp[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("follow_ups")
    .select(`
      *,
      lead:leads(*)
    `)
    .order("scheduled_date", { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createFollowUp(followUp: Omit<FollowUp, "id" | "user_id" | "created_at" | "updated_at" | "completed" | "completed_at" | "lead">) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("follow_ups")
    .insert({ ...followUp, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/follow-ups")
  return data
}

export async function completeFollowUp(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("follow_ups")
    .update({ 
      completed: true, 
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/follow-ups")
}

export async function deleteFollowUp(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("follow_ups").delete().eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/follow-ups")
}

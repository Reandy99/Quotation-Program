"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getAutomationDismissalKeys(): Promise<string[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("automation_dismissals")
      .select("suggestion_key")

    if (error) {
      console.error("Error fetching automation dismissals:", error)
      return []
    }

    return (data || []).map((item: { suggestion_key: string }) => item.suggestion_key)
  } catch (error) {
    console.error("Error in getAutomationDismissalKeys:", error)
    return []
  }
}

export async function dismissAutomationSuggestion(suggestionKey: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("automation_dismissals")
    .upsert(
      {
        user_id: user.id,
        suggestion_key: suggestionKey,
        dismissed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,suggestion_key" }
    )

  if (error) throw new Error(error.message)

  revalidatePath("/automation")
}

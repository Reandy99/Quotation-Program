"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { CalendarEvent, CalendarEventType } from "@/types"

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("date", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching calendar events:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCalendarEvents:", error)
    return []
  }
}

interface CreateCalendarEventInput {
  title: string
  event_type: CalendarEventType
  date: string
  location?: string | null
  notes?: string | null
}

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const payload = {
    user_id: user.id,
    title: input.title.trim(),
    event_type: input.event_type,
    date: input.date,
    location: input.location?.trim() ? input.location.trim() : null,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/calendar")
  return data
}

export async function deleteCalendarEvent(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath("/calendar")
}

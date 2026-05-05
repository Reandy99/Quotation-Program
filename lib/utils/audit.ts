import { createClient } from "@/lib/supabase/server"

export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    })
  } catch (error) {
    console.error("Failed to log audit:", error)
  }
}

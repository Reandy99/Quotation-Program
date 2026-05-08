interface NewLeadEmailParams {
  to: string | null
  ownerName: string
  clientName: string
  phone: string
  email: string | null
  eventName: string
  eventDate: string
  eventTime: string | null
  location: string
  leadUrl: string
}

export async function sendNewPublicLeadEmail(params: NewLeadEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !params.to) return

  const from = process.env.FRAMEFLOW_FROM_EMAIL || "FrameFlow <onboarding@resend.dev>"
  const subject = `New inquiry from ${params.clientName}`
  const rows = [
    `Client: ${params.clientName}`,
    `Phone: ${params.phone}`,
    params.email ? `Email: ${params.email}` : null,
    `Event: ${params.eventName}`,
    `Date: ${params.eventDate}`,
    params.eventTime ? `Time: ${params.eventTime}` : null,
    `Location: ${params.location}`,
    `Open lead: ${params.leadUrl}`,
  ].filter(Boolean)

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject,
        text: `Hi ${params.ownerName || "there"},\n\nYou received a new public lead in FrameFlow.\n\n${rows.join("\n")}`,
      }),
    })
  } catch (error) {
    console.error("Failed to send public lead email notification:", error)
  }
}

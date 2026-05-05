import { notFound } from "next/navigation"
import ClientDetailClient from "./ClientDetailClient"
import { getClient } from "../actions"

export const dynamic = "force-dynamic"

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await getClient(params.id)
  if (!client) notFound()
  return <ClientDetailClient initial={client} />
}

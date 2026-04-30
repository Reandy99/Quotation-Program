import { findClientById } from "@/lib/demo/data"
import ClientDetailClient from "./ClientDetailClient"

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = findClientById(params.id)
  return <ClientDetailClient initial={client} />
}

import { getReportData } from "./actions"
import ReportsClient from "./ReportsClient"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const data = await getReportData()

  return <ReportsClient data={data} />
}

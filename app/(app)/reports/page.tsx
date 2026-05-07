import { PageHeader } from "@/components/shared/PageHeader"
import { getReportData } from "./actions"
import ReportsClient from "./ReportsClient"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const data = await getReportData()

  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Pantau performa bisnis kamu secara mingguan dan bulanan."
      />
      <ReportsClient data={data} />
    </div>
  )
}

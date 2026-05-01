export default function InvoiceDetailLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 rounded bg-gray-100 dark:bg-slate-800 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-32 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

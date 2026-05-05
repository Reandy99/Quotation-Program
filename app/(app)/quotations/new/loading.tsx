export default function NewQuotationLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 rounded bg-gray-100 dark:bg-slate-800 animate-pulse" />
      <div className="max-w-3xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        ))}
        <div className="h-10 w-32 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  )
}

export default function NewLeadLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-40 rounded bg-gray-100 dark:bg-slate-800 animate-pulse" />
      <div className="max-w-2xl space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
          </div>
        ))}
        <div className="h-10 w-32 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  )
}

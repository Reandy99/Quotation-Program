export default function LeadsLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 rounded bg-gray-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
      </div>
      <div className="h-10 w-full rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
      ))}
    </div>
  )
}

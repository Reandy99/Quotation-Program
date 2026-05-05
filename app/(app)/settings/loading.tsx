export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded bg-gray-100 dark:bg-slate-800 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

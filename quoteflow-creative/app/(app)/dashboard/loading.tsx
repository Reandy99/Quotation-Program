export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      {/* Content rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-64 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  )
}

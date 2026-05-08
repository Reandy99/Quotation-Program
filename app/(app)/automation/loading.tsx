export default function AutomationLoading() {
  return (
    <div className="space-y-4">
      <div className="h-16 rounded-[28px] animate-pulse" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }} />
      <div className="h-72 rounded-[28px] animate-pulse" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }} />
      <div className="h-72 rounded-[28px] animate-pulse" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }} />
    </div>
  )
}

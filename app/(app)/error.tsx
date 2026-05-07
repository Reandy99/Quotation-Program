"use client"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Terjadi kesalahan
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {error.message}
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Coba lagi
        </button>
      </div>
    </div>
  )
}

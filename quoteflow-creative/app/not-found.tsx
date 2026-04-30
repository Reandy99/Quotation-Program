export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">The page you are looking for does not exist.</p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}

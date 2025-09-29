export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">🚀 VOI Cockpit Leadership</h1>
        <p className="text-lg mb-8">Task Management System</p>
        <div className="space-y-4">
          <a 
            href="/auth/signin" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Sign In
          </a>
          <div className="text-sm">
            <a href="/test" className="text-purple-300 hover:text-purple-200 underline">
              Test Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
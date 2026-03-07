// app/(admin)/admin/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    // Refresh to trigger proxy.ts session check → redirect to /admin
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sm:p-8 w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-600 text-sm mt-1">YourBrand Realty</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/30"
              placeholder="admin@yourbrand.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition text-sm"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const { signup, loading } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await signup({ username, email, password })
      router.push('/')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create your account'
      setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout showNavbar={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4">
        <div className="w-full max-w-2xl bg-gray-900/80 border border-gray-800 rounded-2xl p-10 shadow-2xl">
          <div className="text-center mb-8">
            <p className="text-blue-400 uppercase tracking-wide text-sm font-semibold mb-2">
              Create account
            </p>
            <h1 className="text-4xl font-bold mb-3">Join NeuroCrypt</h1>
            <p className="text-gray-400">
              Get access to personalized analytics, bias tracking, and more.
            </p>
          </div>
          {formError && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 text-sm">
              {formError}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your trading alias"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a secure password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Repeat your password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button
              className="text-blue-400 hover:text-blue-300 font-semibold"
              onClick={() => router.push('/login')}
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}


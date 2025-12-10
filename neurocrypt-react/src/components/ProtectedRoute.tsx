'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      const target = pathname || '/'
      router.replace(`/login?redirect=${encodeURIComponent(target)}`)
    }
  }, [loading, user, router, pathname])

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="animate-pulse text-gray-300 text-lg">
          Preparing your personalized workspace...
        </div>
        <p className="text-gray-500 text-sm">
          You&apos;ll be redirected to the login page if you&apos;re not signed in.
        </p>
      </div>
    )
  }

  return <>{children}</>
}


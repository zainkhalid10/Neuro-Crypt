'use client'

import PageLayout from '@/components/PageLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  return (
    <PageLayout>
      <ProtectedRoute>
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-6">User Dashboard</h1>
          <p className="text-gray-400 mb-10">
            Review your saved simulator data and latest trading activity.
          </p>
          <Dashboard />
        </div>
      </ProtectedRoute>
    </PageLayout>
  )
}


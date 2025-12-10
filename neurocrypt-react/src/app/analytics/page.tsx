'use client'

import PageLayout from '@/components/PageLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Analytics from '@/components/Analytics'

export default function AnalyticsPage() {
  return (
    <PageLayout>
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    </PageLayout>
  )
} 
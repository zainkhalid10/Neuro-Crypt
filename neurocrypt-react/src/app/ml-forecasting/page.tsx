'use client'

import PageLayout from '@/components/PageLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import MLForecasting from '@/components/MLForecasting'

export default function MLForecastingPage() {
  return (
    <PageLayout>
      <ProtectedRoute>
        <MLForecasting />
      </ProtectedRoute>
    </PageLayout>
  )
} 
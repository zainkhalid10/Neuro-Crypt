'use client'

import PageLayout from '@/components/PageLayout'
import BiasAnalysis from '@/components/BiasAnalysis'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function BiasAnalysisPage() {
  return (
    <PageLayout>
      <ProtectedRoute>
        <BiasAnalysis />
      </ProtectedRoute>
    </PageLayout>
  )
} 
'use client'

import PageLayout from '@/components/PageLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import SentimentAnalysis from '@/components/SentimentAnalysis'

export default function SentimentAnalysisPage() {
  return (
    <PageLayout>
      <ProtectedRoute>
        <SentimentAnalysis />
      </ProtectedRoute>
    </PageLayout>
  )
} 
'use client'

import PageLayout from '@/components/PageLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import InvestmentSimulator from '@/components/InvestmentSimulator'

export default function InvestmentSimulatorPage() {
  return (
    <PageLayout>
      <ProtectedRoute>
        <InvestmentSimulator />
      </ProtectedRoute>
    </PageLayout>
  )
} 
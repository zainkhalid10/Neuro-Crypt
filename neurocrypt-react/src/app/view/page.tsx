'use client'

import PageLayout from '@/components/PageLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import View from '@/components/View'

export default function ViewPage() {
  return (
    <PageLayout>
      <ProtectedRoute>
        <View />
      </ProtectedRoute>
    </PageLayout>
  )
}


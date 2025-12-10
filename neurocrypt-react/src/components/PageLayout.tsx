
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PageLayoutProps {
  children: React.ReactNode
  showNavbar?: boolean
}

export default function PageLayout({ children, showNavbar = true }: PageLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activePage, setActivePage] = useState('home')

  // Handle URL-based routing
  useEffect(() => {
    const page = pathname === '/' ? 'home' : pathname.substring(1)
    setActivePage(page)
  }, [pathname])

  // Navigate to actual pages when page changes
  const handlePageChange = (page: string) => {
    setActivePage(page)
    if (page === 'home') {
      router.push('/')
    } else {
      router.push(`/${page}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {showNavbar && <Navbar activePage={activePage} onPageChange={handlePageChange} />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
} 
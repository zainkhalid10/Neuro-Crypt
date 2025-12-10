'use client'

import { Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  activePage: string
  onPageChange: (page: string) => void
}

export default function Navbar({ activePage, onPageChange }: NavbarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Home', key: 'home', icon: '🏠' },
    { name: 'Market Data', key: 'market-data', icon: '📊' },
    { name: 'Bias Analysis', key: 'bias-analysis', icon: '🧠' },
    { name: 'Sentiment Analysis', key: 'sentiment-analysis', icon: '📈' },
    { name: 'ML Forecasting', key: 'ml-forecasting', icon: '🤖' },
    { name: 'Investment Simulator', key: 'investment-simulator', icon: '💰' },
    { name: 'Analytics', key: 'analytics', icon: '📊' },
    { name: 'View', key: 'view', icon: '👁️' },
    { name: 'Contact Us', key: 'contact-us', icon: '📞' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-b border-blue-500/30 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-4 group cursor-pointer transition-all duration-500 hover:scale-110">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Brain className="relative h-12 w-12 text-blue-400 group-hover:text-blue-300 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-purple-300 group-hover:to-white transition-all duration-500">
              NeuroCrypt
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 ml-4 flex-1">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className={`relative px-3 py-2 rounded-xl text-xs font-medium transition-all duration-500 hover:scale-105 group overflow-hidden ${
                  activePage === item.key
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 text-white shadow-lg shadow-blue-500/40'
                    : 'text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/50'
                }`}
              >
                <span className="mr-1 text-sm group-hover:scale-110 transition-transform duration-500">{item.icon}</span>
                {item.name}
                {activePage === item.key && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse shadow-md"></div>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/30 group-hover:to-blue-500/20 transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-left text-sm text-gray-300 hover:text-white transition-colors"
                  title="Open dashboard"
                >
                  <p className="font-semibold text-white">Welcome, {user.username}</p>
                  <p className="text-gray-400 text-xs underline underline-offset-4">
                    View dashboard →
                  </p>
                </button>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 rounded-xl bg-gray-800/40 border border-gray-700 text-gray-200 hover:text-white hover:bg-gray-700/60 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-800/40 border border-gray-700 text-gray-200 hover:bg-gray-700/60 transition-all duration-300"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-300 shadow-lg shadow-blue-600/30"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 
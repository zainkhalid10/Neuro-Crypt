'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'

interface Trade {
  timestamp: string
  crypto_symbol: string
  action: string
  amount: number
  price: number
  emotional_state: string | null
  bias_factors: Record<string, unknown>
  profit_loss: number | null
}

export default function View() {
  const { user, token } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && token) {
      fetchTrades()
    }
  }, [user, token])

  const fetchTrades = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002'
      const response = await fetch(`${backendUrl}/auth/trades`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch trades')
      }

      const data = await response.json()
      setTrades(data.trades || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trade logs')
      console.error('Error fetching trades:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            View Dashboard
          </h1>
          <p className="text-gray-400">Manage your ads and review your trading activity</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ads Section */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-blue-400 flex items-center gap-2">
              <span className="text-3xl">📢</span>
              Advertisement Space
            </h2>
            
            <div className="space-y-4">
              {/* Ad Placeholder 1 */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Premium Partner</span>
                  <span className="text-xs text-gray-400">Sponsored</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Advanced Trading Tools</h3>
                <p className="text-gray-300 mb-4">
                  Unlock professional-grade trading analytics and real-time market insights. 
                  Get 30% off your first month with code NEURO30.
                </p>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all">
                  Learn More
                </button>
              </div>

              {/* Ad Placeholder 2 */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-purple-300 uppercase tracking-wide">Featured</span>
                  <span className="text-xs text-gray-400">Sponsored</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Crypto Education Platform</h3>
                <p className="text-gray-300 mb-4">
                  Master cryptocurrency trading with our comprehensive courses. 
                  From beginner to advanced strategies, learn at your own pace.
                </p>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all">
                  Explore Courses
                </button>
              </div>

              {/* Ad Placeholder 3 */}
              <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-lg p-6 border border-green-500/30 hover:border-green-400/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-green-300 uppercase tracking-wide">New</span>
                  <span className="text-xs text-gray-400">Sponsored</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Portfolio Management Suite</h3>
                <p className="text-gray-300 mb-4">
                  Track and optimize your crypto portfolio with AI-powered recommendations. 
                  Free trial available for new users.
                </p>
                <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-white font-semibold hover:from-green-500 hover:to-teal-500 transition-all">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>

          {/* Trade Logs Section */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-blue-400 flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Trade Logs
              </h2>
              <button
                onClick={fetchTrades}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                <p className="font-semibold">Error loading trades</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No trades found</p>
                <p className="text-sm mt-2">Your trading activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {trades.map((trade, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trade.action.toLowerCase() === 'buy'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                            : 'bg-red-500/20 text-red-300 border border-red-500/50'
                        }`}>
                          {trade.action.toUpperCase()}
                        </div>
                        <span className="font-bold text-lg">{trade.crypto_symbol}</span>
                      </div>
                      {trade.profit_loss !== null && (
                        <div className={`flex items-center gap-1 font-semibold ${
                          trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.profit_loss >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {formatCurrency(trade.profit_loss)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Amount</p>
                        <p className="font-semibold">{trade.amount.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Price</p>
                        <p className="font-semibold flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(trade.price)}
                        </p>
                      </div>
                      {trade.emotional_state && (
                        <div>
                          <p className="text-gray-400 mb-1">Emotional State</p>
                          <p className="font-semibold capitalize">{trade.emotional_state}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-400 mb-1">Time</p>
                        <p className="font-semibold text-xs">{formatDate(trade.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


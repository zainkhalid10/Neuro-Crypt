'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { BACKEND_URL } from '@/lib/auth'
import { TrendingUp, Wallet, Activity, RefreshCw } from 'lucide-react'

interface TradeEntry {
  timestamp: string | null
  crypto_symbol: string
  action: string
  amount: number
  price: number
  profit_loss: number | null
}

interface SimulatorState {
  portfolio: Array<{
    id: string
    symbol: string
    name: string
    quantity: number
    buyPrice: number
    currentPrice: number
    totalValue: number
    profitLoss: number
    profitLossPercent: number
    buyDate: string
  }>
  transactions: Array<{
    id?: string
    type?: string
    symbol?: string
    quantity?: number
    price?: number
    total?: number
    date?: string
  }>
  currentBalance: number
  initialBalance: number
  lastUpdate: string
}

interface DashboardResponse {
  user: {
    id: string
    username: string
    email: string
    created_at?: string
    last_login?: string
  }
  summary: {
    simulator?: {
      state?: SimulatorState
      updated_at?: string
    }
    trades: TradeEntry[]
    trade_count: number
    last_trade: TradeEntry | null
  }
}

export default function Dashboard() {
  const { user, token } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${BACKEND_URL}/auth/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error)
        }
        setDashboardData(data)
        setError(null)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      })
      .finally(() => setLoading(false))
  }, [token])

  const simulatorSummary = useMemo(() => {
    const simulatorState = dashboardData?.summary?.simulator?.state
    if (!simulatorState) return null
    const totalPortfolioValue = simulatorState.portfolio?.reduce((sum, item) => sum + (item.totalValue || 0), 0) || 0
    const totalAccountValue = (simulatorState.currentBalance || 0) + totalPortfolioValue
    const totalReturn = totalAccountValue - (simulatorState.initialBalance || 0)
    const totalReturnPercent = simulatorState.initialBalance
      ? (totalReturn / simulatorState.initialBalance) * 100
      : 0
    return {
      totalAccountValue,
      totalReturn,
      totalReturnPercent,
      lastUpdate: simulatorState.lastUpdate
    }
  }, [dashboardData])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-300">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        Loading dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-red-400 font-semibold">{error}</p>
        <p className="text-gray-400 text-sm">Please refresh the page to try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Account Overview</h2>
          <p className="text-2xl font-bold text-white">{user?.username}</p>
          <p className="text-gray-400">{user?.email}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p className="text-gray-500">Member since</p>
              <p className="font-semibold">
                {dashboardData?.user?.created_at
                  ? new Date(dashboardData.user.created_at).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last active</p>
              <p className="font-semibold">
                {dashboardData?.user?.last_login
                  ? new Date(dashboardData.user.last_login).toLocaleString()
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-gray-400 text-sm uppercase tracking-wide">Simulator Performance</h2>
              <p className="text-xs text-gray-500">
                {dashboardData?.summary?.simulator?.updated_at
                  ? `Updated ${new Date(dashboardData.summary.simulator.updated_at).toLocaleString()}`
                  : 'No saved data yet'}
              </p>
            </div>
            <Wallet className="h-6 w-6 text-blue-400" />
          </div>

          {simulatorSummary ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-500 text-xs uppercase">Account Value</p>
                <p className="text-2xl font-bold text-white">
                  ${simulatorSummary.totalAccountValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-500 text-xs uppercase">Total Return</p>
                <p className={`text-2xl font-bold ${simulatorSummary.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {simulatorSummary.totalReturn >= 0 ? '+' : '-'}
                  ${Math.abs(simulatorSummary.totalReturn).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-gray-400">
                  {simulatorSummary.totalReturnPercent >= 0 ? '+' : ''}
                  {simulatorSummary.totalReturnPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No simulator data saved yet.</p>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-400 text-sm uppercase tracking-wide">Recent Trades</h2>
            <p className="text-xs text-gray-500">
              {dashboardData?.summary?.trade_count || 0} trades in the last 30 days
            </p>
          </div>
          <Activity className="h-6 w-6 text-purple-400" />
        </div>

        {dashboardData?.summary?.trades?.length ? (
          <div className="space-y-3">
            {dashboardData.summary.trades.map((trade, index) => (
              <div key={`${trade.timestamp}-${index}`} className="bg-gray-900/40 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      trade.action === 'buy'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      {trade.action.toUpperCase()}
                    </span>
                    <p className="text-white font-semibold">{trade.crypto_symbol}</p>
                  </div>
                  {trade.profit_loss !== null && (
                    <div className={`flex items-center gap-1 ${trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profit_loss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 rotate-180" />}
                      ${Math.abs(trade.profit_loss).toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold">{trade.amount.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-semibold">${trade.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Timestamp</p>
                    <p className="font-semibold">
                      {trade.timestamp ? new Date(trade.timestamp).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No trades recorded yet.</p>
        )}
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gamepad2, DollarSign, TrendingUp, TrendingDown, Target, BarChart3, RotateCcw, History, Plus, Minus, RefreshCw } from 'lucide-react'
import { getTopCryptoPrices } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { BACKEND_URL } from '@/lib/auth'

interface PortfolioItem {
  id: string
  symbol: string
  name: string
  quantity: number
  buyPrice: number
  currentPrice: number
  totalValue: number
  profitLoss: number
  profitLossPercent: number
  buyDate: Date
}

interface Transaction {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  quantity: number
  price: number
  total: number
  date: Date
}

interface DemoAccountData {
  portfolio: PortfolioItem[]
  transactions: Transaction[]
  currentBalance: number
  initialBalance: number
  lastUpdate: string
}

interface CryptoTicker {
  symbol: string
  price: number
  priceChangePercent: number
  marketCap: number
  volume: number
}

export default function InvestmentSimulator() {
  const { token } = useAuth()
  const [cryptos, setCryptos] = useState<CryptoTicker[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<string>('')
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000)
  const [initialBalance, setInitialBalance] = useState<number>(100000)
  const [currentBalance, setCurrentBalance] = useState<number>(100000)
  const [loading, setLoading] = useState<boolean>(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [totalProfitLoss, setTotalProfitLoss] = useState<number>(0)
  const [totalProfitLossPercent, setTotalProfitLossPercent] = useState<number>(0)
  const [backendError, setBackendError] = useState<string | null>(null)
  const [hasLoadedFromBackend, setHasLoadedFromBackend] = useState(false)
  const [resetting, setResetting] = useState(false)

  const resetToDefaults = useCallback(() => {
    setPortfolio([])
    setTransactions([])
    setCurrentBalance(100000)
    setInitialBalance(100000)
    setLastUpdate(new Date())
  }, [])

  // On mount or when auth token changes, fetch simulator state from backend
  useEffect(() => {
    if (!token) return
    setHasLoadedFromBackend(false)
    setBackendError(null)
    console.log('[Simulator] [GET] Fetching state from backend for logged-in user')
    fetch(`${BACKEND_URL}/auth/simulator-state`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('[Simulator] [GET] Backend response:', data)
        if (data.state) {
          try {
            const parsed: DemoAccountData = data.state
            setPortfolio(parsed.portfolio.map((item: PortfolioItem) => ({ ...item, buyDate: new Date(item.buyDate) })))
            setTransactions(parsed.transactions.map((tx: Transaction) => ({ ...tx, date: new Date(tx.date) })))
            setCurrentBalance(parsed.currentBalance)
            setInitialBalance(parsed.initialBalance)
            setLastUpdate(parsed.lastUpdate ? new Date(parsed.lastUpdate) : new Date())
            setBackendError(null)
          } catch (e) {
            console.error('[Simulator] [GET] Error parsing backend state:', e)
            setBackendError('Error parsing saved simulator data.')
            resetToDefaults()
          }
        } else {
          resetToDefaults()
          setBackendError('No saved simulator data found, starting fresh.')
        }
      })
      .catch((err) => {
        console.error('[Simulator] [GET] Backend fetch failed:', err)
        setBackendError('Unable to load simulator data. Please try again.')
        resetToDefaults()
      })
      .finally(() => {
        setHasLoadedFromBackend(true)
        console.log('[Simulator] [GET] hasLoadedFromBackend set to true')
      })
  }, [token, resetToDefaults])

  // On every state change, save to backend, but only after initial load
  useEffect(() => {
    if (!hasLoadedFromBackend || !token) {
      return
    }
    const data: DemoAccountData = {
      portfolio,
      transactions,
      currentBalance,
      initialBalance,
      lastUpdate: lastUpdate.toISOString()
    }
    fetch(`${BACKEND_URL}/auth/simulator-state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ state: data })
    })
      .then(res => res.json())
      .then(resp => {
        if (!resp.success) {
          setBackendError('Failed to save simulator data.')
        } else {
          setBackendError(null)
        }
      })
      .catch(() => {
        setBackendError('Failed to save simulator data.')
      })
  }, [portfolio, transactions, currentBalance, initialBalance, lastUpdate, hasLoadedFromBackend, token])

  // On page unload or tab hide, force-save the latest state to backend
  useEffect(() => {
    if (!hasLoadedFromBackend || !token) return

    const handler = () => {
      const data: DemoAccountData = {
        portfolio,
        transactions,
        currentBalance,
        initialBalance,
        lastUpdate: lastUpdate.toISOString()
      }
      fetch(`${BACKEND_URL}/auth/simulator-state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ state: data })
      }).catch(() => {})
    }

    window.addEventListener('beforeunload', handler)
    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') handler()
    }
    document.addEventListener('visibilitychange', visibilityHandler)

    return () => {
      window.removeEventListener('beforeunload', handler)
      document.removeEventListener('visibilitychange', visibilityHandler)
    }
  }, [portfolio, transactions, currentBalance, initialBalance, lastUpdate, hasLoadedFromBackend, token])

  // Fetch crypto data
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true)
        const data = await getTopCryptoPrices()
        setCryptos(data)
        setLastUpdate(new Date())
      } catch (error) {
        console.error('Error fetching cryptos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCryptos()
    const interval = setInterval(fetchCryptos, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Update portfolio values and calculate profit/loss every 30 seconds
  useEffect(() => {
    const updatePortfolioValues = () => {
      setPortfolio(prev => prev.map(item => {
        const crypto = cryptos.find(c => c.symbol === item.symbol)
        if (crypto) {
          const currentPrice = crypto.price
          const totalValue = item.quantity * currentPrice
          const profitLoss = totalValue - (item.quantity * item.buyPrice)
          const profitLossPercent = ((currentPrice - item.buyPrice) / item.buyPrice) * 100
          
          return {
            ...item,
            currentPrice,
            totalValue,
            profitLoss,
            profitLossPercent
          }
        }
        return item
      }))
    }

    // Only update if we have cryptos data
    if (cryptos.length > 0) {
      updatePortfolioValues()
    }
    
    const interval = setInterval(() => {
      if (cryptos.length > 0) {
        updatePortfolioValues()
      }
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [cryptos]) // Only depend on cryptos, not portfolio

  // Separate useEffect for profit/loss calculations
  useEffect(() => {
    const totalPL = portfolio.reduce((sum, item) => sum + item.profitLoss, 0)
    const totalInvested = portfolio.reduce((sum, item) => sum + (item.quantity * item.buyPrice), 0)
    const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0
    
    setTotalProfitLoss(totalPL)
    setTotalProfitLossPercent(totalPLPercent)
  }, [portfolio])

  const buyCrypto = () => {
    if (!selectedCrypto || investmentAmount <= 0 || investmentAmount > currentBalance) return

    const crypto = cryptos.find(c => c.symbol === selectedCrypto)
    if (!crypto) return

    const quantity = investmentAmount / crypto.price
    const buyPrice = crypto.price
    const transactionId = `buy_${Date.now()}_${Math.random()}`

    const newItem: PortfolioItem = {
      id: transactionId,
      symbol: crypto.symbol,
      name: crypto.symbol,
      quantity,
      buyPrice,
      currentPrice: buyPrice,
      totalValue: investmentAmount,
      profitLoss: 0,
      profitLossPercent: 0,
      buyDate: new Date()
    }

    const transaction: Transaction = {
      id: transactionId,
      type: 'buy',
      symbol: crypto.symbol,
      quantity,
      price: buyPrice,
      total: investmentAmount,
      date: new Date()
    }

    setPortfolio(prev => [...prev, newItem])
    setTransactions(prev => [transaction, ...prev])
    setCurrentBalance(prev => prev - investmentAmount)
    setSelectedCrypto('')
    setInvestmentAmount(1000)
  }

  const sellCrypto = (itemId: string) => {
    const item = portfolio.find(p => p.id === itemId)
    if (!item) return

    const sellValue = item.quantity * item.currentPrice
    const transactionId = `sell_${Date.now()}_${Math.random()}`

    const transaction: Transaction = {
      id: transactionId,
      type: 'sell',
      symbol: item.symbol,
      quantity: item.quantity,
      price: item.currentPrice,
      total: sellValue,
      date: new Date()
    }

    setCurrentBalance(prev => prev + sellValue)
    setPortfolio(prev => prev.filter(p => p.id !== itemId))
    setTransactions(prev => [transaction, ...prev])
  }

  // On reset, delete from backend
  const resetAccount = async () => {
    if (!token) return
    if (window.confirm('Are you sure you want to reset your demo account? This will clear all your investments and transactions.')) {
      setResetting(true)
      try {
        await fetch(`${BACKEND_URL}/auth/simulator-state`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        resetToDefaults()
        setPortfolio([])
        setTransactions([])
        setSelectedCrypto('')
        setInvestmentAmount(1000)
        setTotalProfitLoss(0)
        setTotalProfitLossPercent(0)
        setBackendError(null)
      } catch (error) {
        console.error('[Simulator] Reset failed:', error)
        setBackendError('Failed to reset account. Please try again.')
      } finally {
        setResetting(false)
      }
    }
  }

  const getTotalPortfolioValue = () => {
    return portfolio.reduce((sum, item) => sum + item.totalValue, 0)
  }

  const getTotalProfitLoss = () => {
    return portfolio.reduce((sum, item) => sum + item.profitLoss, 0)
  }

  const getTotalProfitLossPercent = () => {
    const totalInvested = portfolio.reduce((sum, item) => sum + (item.quantity * item.buyPrice), 0)
    if (totalInvested === 0) return 0
    return (getTotalProfitLoss() / totalInvested) * 100
  }

  const getTotalAccountValue = () => {
    return currentBalance + getTotalPortfolioValue()
  }

  const getTotalReturn = () => {
    return getTotalAccountValue() - initialBalance
  }

  const getTotalReturnPercent = () => {
    return ((getTotalAccountValue() - initialBalance) / initialBalance) * 100
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🎮 Demo Trading Account</h1>
          <p className="text-gray-400 mb-4">Practice trading with virtual money and track your performance</p>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Last Updated</p>
              <p className="text-white text-sm">{formatDate(lastUpdate)}</p>
            </div>
            <button
              onClick={resetAccount}
              disabled={resetting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg flex items-center"
            >
              <RotateCcw className={`w-4 h-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting...' : 'Reset Account'}
            </button>
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Available Balance</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentBalance)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(getTotalPortfolioValue())}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Account Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(getTotalAccountValue())}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Return</p>
                <p className={`text-2xl font-bold ${getTotalReturn() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(getTotalReturn())} ({formatPercentage(getTotalReturnPercent())})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Profit/Loss Alert */}
        {Math.abs(totalProfitLoss) > 0 && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            totalProfitLoss >= 0 
              ? 'bg-green-900/20 border-green-500 text-green-400' 
              : 'bg-red-900/20 border-red-500 text-red-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5 mr-2" />
                ) : (
                  <TrendingDown className="w-5 h-5 mr-2" />
                )}
                <span className="font-medium">
                  Live Portfolio Update: {formatCurrency(totalProfitLoss)} ({formatPercentage(totalProfitLossPercent)})
                </span>
              </div>
              <span className="text-sm text-gray-400">
                Updates every 30 seconds
              </span>
            </div>
          </div>
        )}

        {backendError && (
          <div className="bg-red-700 text-white p-2 mb-4 rounded text-center">
            {backendError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buy Crypto */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-green-400" />
              Buy Cryptocurrency
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Select Cryptocurrency</label>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                  disabled={loading}
                >
                  <option value="">Choose a cryptocurrency</option>
                  {cryptos.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol} - {formatCurrency(crypto.price)} ({formatPercentage(crypto.priceChangePercent)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Investment Amount (USD)</label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                  min="1"
                  max={currentBalance}
                />
                <p className="text-gray-400 text-sm mt-1">
                  Available: {formatCurrency(currentBalance)}
                </p>
              </div>
              {selectedCrypto && (
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Preview:</p>
                  <p className="text-white">
                    You will buy {(investmentAmount / (cryptos.find(c => c.symbol === selectedCrypto)?.price || 1)).toFixed(6)} {selectedCrypto}
                  </p>
                </div>
              )}
              <button
                onClick={buyCrypto}
                disabled={!selectedCrypto || investmentAmount <= 0 || investmentAmount > currentBalance || loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg flex items-center justify-center"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Buy {selectedCrypto || 'Crypto'}
              </button>
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Portfolio</h2>
            {portfolio.length === 0 ? (
              <div className="text-center py-8">
                <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No investments yet. Start by buying some cryptocurrency!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {portfolio.map((item) => (
                  <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-medium">{item.symbol}</h3>
                        <p className="text-gray-400 text-sm">Bought {formatDate(item.buyDate)}</p>
                      </div>
                      <button
                        onClick={() => sellCrypto(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center transition-transform duration-300 hover:scale-110"
                      >
                        <Minus className="w-3 h-3 mr-1" />
                        Sell
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Quantity</p>
                        <p className="text-white">{item.quantity.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Buy Price</p>
                        <p className="text-white">{formatCurrency(item.buyPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Current Price</p>
                        <p className="text-white">{formatCurrency(item.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Value</p>
                        <p className="text-white">{formatCurrency(item.totalValue)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-400">P&L</p>
                        <p className={`${item.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(item.profitLoss)} ({formatPercentage(item.profitLossPercent)})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <History className="w-5 h-5 mr-2" />
            Transaction History
          </h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet. Start trading to see your history!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${transaction.type === 'buy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <p className="text-white font-medium">
                          {transaction.type === 'buy' ? 'Bought' : 'Sold'} {transaction.symbol}
                        </p>
                        <p className="text-gray-400 text-sm">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatCurrency(transaction.total)}</p>
                      <p className="text-gray-400 text-sm">
                        {transaction.quantity.toFixed(6)} @ {formatCurrency(transaction.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Total Return</h3>
              <p className={`text-2xl font-bold ${getTotalReturnPercent() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(getTotalReturnPercent())}
              </p>
              <p className="text-gray-400 text-sm">Since account creation</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Portfolio P&L</h3>
              <p className={`text-2xl font-bold ${getTotalProfitLossPercent() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(getTotalProfitLossPercent())}
              </p>
              <p className="text-gray-400 text-sm">Current holdings</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Best Performer</h3>
              {portfolio.length > 0 ? (
                <>
                  <p className="text-2xl font-bold text-white">
                    {portfolio.reduce((best, current) => 
                      current.profitLossPercent > best.profitLossPercent ? current : best
                    ).symbol}
                  </p>
                  <p className="text-green-400 text-sm">
                    {formatPercentage(Math.max(...portfolio.map(p => p.profitLossPercent)))}
                  </p>
                </>
              ) : (
                <p className="text-gray-400">No investments</p>
              )}
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Diversification</h3>
              <p className="text-2xl font-bold text-white">{portfolio.length}</p>
              <p className="text-gray-400 text-sm">Different cryptocurrencies</p>
            </div>
          </div>
        </div>

        {/* Trading Tips */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Trading Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Diversify Your Portfolio</h3>
                  <p className="text-gray-400 text-sm">Don&rsquo;t put all your money in one cryptocurrency</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Set Stop Losses</h3>
                  <p className="text-gray-400 text-sm">Protect your capital with proper risk management</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Do Your Research</h3>
                  <p className="text-gray-400 text-sm">Understand the fundamentals before investing</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <TrendingDown className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Don&rsquo;t Panic Sell</h3>
                  <p className="text-gray-400 text-sm">Stick to your investment strategy during volatility</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Start Small</h3>
                  <p className="text-gray-400 text-sm">Begin with small amounts to learn the market</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Gamepad2 className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Practice First</h3>
                  <p className="text-gray-400 text-sm">Use this simulator to practice before real trading</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
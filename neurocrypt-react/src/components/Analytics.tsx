'use client'

import { useState, useEffect } from 'react'
import { Database, BarChart3, TrendingUp, TrendingDown, Activity, Target, RefreshCw } from 'lucide-react'

const API_BASE = 'http://localhost:5001'

export default function Analytics() {
  const [cryptos, setCryptos] = useState<any[]>([]) // Placeholder for crypto data
  const [globalData, setGlobalData] = useState<any>(null) // Placeholder for global data
  const [selectedTable, setSelectedTable] = useState<string>('Market Data')
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [simulations, setSimulations] = useState<any[]>([])
  const [loadingSim, setLoadingSim] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLive, setIsLive] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [previousSimulationCount, setPreviousSimulationCount] = useState(0)
  const [previousTransactionCount, setPreviousTransactionCount] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  // Function to fetch simulation data
  const fetchSimulationData = async () => {
    if (selectedTable === 'Trading Simulations') {
      setLoadingSim(true)
      try {
        const response = await fetch(`${API_BASE}/simulator/all`)
        const data = await response.json()
        const newSimulations = data.simulations.map((sim: any) => ({
          ...sim,
          parsed: sim.state ? JSON.parse(sim.state) : null
        }))
        
        // Calculate total transactions across all simulations
        const totalTransactions = newSimulations.reduce((total: number, sim: any) => {
          return total + (sim.parsed?.transactions?.length || 0)
        }, 0)
        
        // Check if there are new simulations or new transactions
        if ((newSimulations.length > previousSimulationCount && previousSimulationCount > 0) ||
            (totalTransactions > previousTransactionCount && previousTransactionCount > 0)) {
          setShowNotification(true)
          setTimeout(() => setShowNotification(false), 3000) // Hide after 3 seconds
        }
        
        setSimulations(newSimulations)
        setPreviousSimulationCount(newSimulations.length)
        setPreviousTransactionCount(totalTransactions)
        setLastUpdate(new Date())
      } catch (error) {
        console.error('Error fetching simulation data:', error)
      } finally {
        setLoadingSim(false)
      }
    }
  }

  // Fetch data when selected table changes
  useEffect(() => {
    fetchSimulationData()
  }, [selectedTable])

  // Set up polling for real-time updates when Trading Simulations is selected
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (selectedTable === 'Trading Simulations') {
      setIsLive(true)
      // Poll every 3 seconds for real-time updates
      interval = setInterval(() => {
        fetchSimulationData()
      }, 3000)
    } else {
      setIsLive(false)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [selectedTable])

  const fetchData = async () => {
    try {
      // Simulate fetching data
      const mockCryptoData = [
        { id: 1, name: 'Bitcoin', current_price: 45000, market_cap: 850000000000 },
        { id: 2, name: 'Ethereum', current_price: 3000, market_cap: 350000000000 },
        { id: 3, name: 'Tether', current_price: 1, market_cap: 80000000000 },
        { id: 4, name: 'BNB', current_price: 300, market_cap: 50000000000 },
        { id: 5, name: 'XRP', current_price: 0.5, market_cap: 25000000000 }
      ]
      setCryptos(mockCryptoData)
      setGlobalData({
        total_market_cap: 10000000000000,
        total_volume: 15000000000000,
        btc_dominance: 45,
        eth_dominance: 20,
        altcoin_market_cap: 5000000000000
      })
      generateAnalyticsData()
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const generateAnalyticsData = () => {
    // Simulate analytics data
    const mockData = [
      { date: '2024-01-01', volume: 1250000000, market_cap: 850000000000, price: 45000 },
      { date: '2024-01-02', volume: 1320000000, market_cap: 860000000000, price: 46000 },
      { date: '2024-01-03', volume: 1180000000, market_cap: 840000000000, price: 44000 },
      { date: '2024-01-04', volume: 1450000000, market_cap: 870000000000, price: 47000 },
      { date: '2024-01-05', volume: 1380000000, market_cap: 865000000000, price: 46500 },
      { date: '2024-01-06', volume: 1420000000, market_cap: 875000000000, price: 47500 },
      { date: '2024-01-07', volume: 1500000000, market_cap: 880000000000, price: 48000 }
    ]
    setAnalyticsData(mockData)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const tables = [
    { name: 'Market Data', description: 'Historical market data and price information' },
    { name: 'Sentiment Data', description: 'Social media sentiment analysis results' },
    { name: 'Trading Simulations', description: 'Simulated trading performance data' },
    { name: 'ML Predictions', description: 'Machine learning model predictions' },
    { name: 'Bias Assessments', description: 'Cognitive bias analysis results' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {showNotification && (
          <div className="fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              New trading activity detected!
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🗄️ Analytics</h1>
          <p className="text-gray-400">Comprehensive data analysis and insights</p>
        </div>

        {/* Database Connection Status */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-400 font-medium">Database connection successful!</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Tables */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Available Tables</h2>
            <div className="space-y-3">
              {tables.map((table) => (
                <div
                  key={table.name}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTable === table.name
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedTable(table.name)}
                >
                  <h3 className="text-white font-medium">{table.name}</h3>
                  <p className="text-gray-400 text-sm">{table.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Preview */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Data from {selectedTable}</h2>
              {selectedTable === 'Trading Simulations' && (
                <div className="flex items-center space-x-3">
                  {isLive && (
                    <div className="flex items-center text-green-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </div>
                  )}
                  <div className="text-gray-400 text-sm">
                    Last update: {lastUpdate.toLocaleTimeString()}
                  </div>
                  <button
                    onClick={fetchSimulationData}
                    disabled={loadingSim}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${loadingSim ? 'animate-spin' : ''}`} />
                    {loadingSim ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              {selectedTable === 'Trading Simulations' ? (
                loadingSim ? (
                  <div className="text-white">Loading simulations...</div>
                ) : (
                  <>
                    <table className="w-full mb-8">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">User ID</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Balance</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Portfolio Count</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Last Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulations.map((sim, idx) => (
                          <tr key={sim.user_id} className="border-b border-gray-700">
                            <td className="py-3 px-4 text-white text-xs max-w-xs truncate">{sim.user_id}</td>
                            <td className="py-3 px-4 text-right text-white font-medium">
                              {sim.parsed ? `$${sim.parsed.currentBalance.toLocaleString()}` : '-'}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-400">
                              {sim.parsed ? sim.parsed.portfolio.length : '-'}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-400">
                              {sim.parsed ? new Date(sim.parsed.lastUpdate).toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Detailed Trade History for each user */}
                    <div>
                      {simulations.map((sim, idx) => (
                        <div key={sim.user_id + '-trades'} className="mb-8">
                          <h3 className="text-white font-medium mb-2 text-sm">Trade History for User: <span className="text-blue-400">{sim.user_id}</span></h3>
                          {sim.parsed && sim.parsed.transactions && sim.parsed.transactions.length > 0 ? (
                            <table className="w-full text-xs bg-gray-900 rounded">
                              <thead>
                                <tr className="border-b border-gray-700">
                                  <th className="py-2 px-3 text-gray-400">Type</th>
                                  <th className="py-2 px-3 text-gray-400">Coin</th>
                                  <th className="py-2 px-3 text-gray-400">Quantity</th>
                                  <th className="py-2 px-3 text-gray-400">Price</th>
                                  <th className="py-2 px-3 text-gray-400">Total</th>
                                  <th className="py-2 px-3 text-gray-400">Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sim.parsed.transactions.map((tx: any, i: number) => (
                                  <tr key={tx.id || i} className="border-b border-gray-800">
                                    <td className="py-2 px-3 text-white">{tx.type === 'buy' ? 'Buy' : 'Sell'}</td>
                                    <td className="py-2 px-3 text-white">{tx.symbol}</td>
                                    <td className="py-2 px-3 text-white">{tx.quantity}</td>
                                    <td className="py-2 px-3 text-white">${tx.price.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                                    <td className="py-2 px-3 text-white">${tx.total.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                                    <td className="py-2 px-3 text-gray-400">{new Date(tx.date).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-gray-400 italic">No trades yet.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Volume</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Market Cap</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.map((row, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-3 px-4 text-white">{row.date}</td>
                        <td className="py-3 px-4 text-right text-gray-400">
                          {formatCurrency(row.volume)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400">
                          {formatCurrency(row.market_cap)}
                        </td>
                        <td className="py-3 px-4 text-right text-white font-medium">
                          {formatCurrency(row.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-400">
              {selectedTable === 'Trading Simulations'
                ? `Total simulations: ${simulations.length}`
                : `Total rows: ${analyticsData.length}`}
            </div>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Analytics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Total Records</p>
                  <p className="text-2xl font-bold text-white">1,247</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Data Growth</p>
                  <p className="text-2xl font-bold text-white">+12.5%</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Update Frequency</p>
                  <p className="text-2xl font-bold text-white">Daily</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-yellow-400 mr-3" />
                <div>
                  <p className="text-gray-400 text-sm">Data Quality</p>
                  <p className="text-2xl font-bold text-white">98.7%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Insights */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Data Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Market Trends</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Daily Volume</span>
                    <span className="text-white">{formatCurrency(1350000000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volume Growth</span>
                    <span className="text-green-400">+8.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Cap Growth</span>
                    <span className="text-green-400">+5.2%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data Accuracy</span>
                    <span className="text-green-400">99.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Speed</span>
                    <span className="text-blue-400">2.3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage Used</span>
                    <span className="text-yellow-400">1.2GB</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Top Cryptocurrencies</h3>
                <div className="space-y-2">
                  {cryptos.slice(0, 5).map((crypto, index) => (
                    <div key={crypto.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-gray-400 text-sm mr-2">{index + 1}.</span>
                        <span className="text-white text-sm">{crypto.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {formatCurrency(crypto.current_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Data Sources</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-gray-400">CoinGecko API</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span className="text-gray-400">Social Media APIs</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    <span className="text-gray-400">News APIs</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                    <span className="text-gray-400">Internal Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Export Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg">
              Export as CSV
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg">
              Export as JSON
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
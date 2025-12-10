 'use client'

import { useState, useEffect } from 'react'
import { getTopCryptoPrices, getCryptoHistory } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ComposedChart, Area } from 'recharts'

export default function MarketData() {
  const [tab, setTab] = useState<'crypto' | 'stock'>('crypto')
  const [cryptoPrices, setCryptoPrices] = useState<any[]>([])
  const [stockPrices, setStockPrices] = useState<any[]>([])
  const [cryptoHistory, setCryptoHistory] = useState<{ date: string, price: number }[]>([])
  const [stockHistory, setStockHistory] = useState<{ date: string, price: number }[]>([])
  const [cryptoInterval, setCryptoInterval] = useState('1d')
  const [stockDays, setStockDays] = useState(30)
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTCUSDT')
  const [selectedStock, setSelectedStock] = useState<string>('AAPL')
  const [chartType, setChartType] = useState<'line' | 'bar' | 'candlestick'>('line')
  const [cryptoCandleData, setCryptoCandleData] = useState<any[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Fetch crypto prices
  useEffect(() => {
    let isMounted = true
    const fetchCrypto = async () => {
      try {
        const data = await getTopCryptoPrices()
        if (isMounted) setCryptoPrices(data)
        // Simulate price history for top 5 cryptos for chart
        if (isMounted && data.length > 0) {
    const now = new Date()
          const history: any = {}
          data.slice(0, 5).forEach((item: any) => {
            history[item.symbol] = Array.from({ length: 30 }, (_, i) => ({
              date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
              price: item.price * (1 + 0.05 * Math.sin(i / 5 + Math.random() * 0.2)) // fake history
            }))
          })
          // setCryptoHistory(history) // This line is removed as per new_code
        }
      } catch {
        if (isMounted) setCryptoPrices([])
      }
    }
    fetchCrypto()
    const interval = setInterval(fetchCrypto, 30000)
    return () => { isMounted = false; clearInterval(interval) }
  }, [])

  // Fetch stock prices from /api/stock
  useEffect(() => {
    let isMounted = true
    const fetchStock = async () => {
      try {
        const res = await fetch('/api/stock')
        if (!res.ok) throw new Error('Failed to fetch stock prices')
        const data = await res.json()
        if (isMounted) setStockPrices(data)
      } catch {
        if (isMounted) setStockPrices([])
      }
    }
    fetchStock()
    const interval = setInterval(fetchStock, 30000)
    return () => { isMounted = false; clearInterval(interval) }
  }, [])

  // Fetch crypto history for selected crypto and interval
  useEffect(() => {
    if (tab !== 'crypto' || !selectedCrypto) return
    
    let isMounted = true
    const fetchHistory = async () => {
      try {
        // Calculate appropriate limit based on interval
        let calculatedLimit = 100
        if (cryptoInterval === '1m') calculatedLimit = 240 // Reduced for performance
        else if (cryptoInterval === '5m') calculatedLimit = 288
        else if (cryptoInterval === '15m') calculatedLimit = 96
        else if (cryptoInterval === '30m') calculatedLimit = 48
        else if (cryptoInterval === '1h') calculatedLimit = 24
        else if (cryptoInterval === '4h') calculatedLimit = 42
        else if (cryptoInterval === '1d') calculatedLimit = 30
        else if (cryptoInterval === '1w') calculatedLimit = 52
        
        // For candlestick charts, reduce data density for better visualization
        if (chartType === 'candlestick') {
          if (cryptoInterval === '1m') calculatedLimit = 240
          else if (cryptoInterval === '5m') calculatedLimit = 144
          else if (cryptoInterval === '15m') calculatedLimit = 96
          else if (cryptoInterval === '30m') calculatedLimit = 48
          else if (cryptoInterval === '1h') calculatedLimit = 24
          else if (cryptoInterval === '4h') calculatedLimit = 42
          else if (cryptoInterval === '1d') calculatedLimit = 30
          else if (cryptoInterval === '1w') calculatedLimit = 52
        }
        
        // Use our proxy API route instead of calling Binance directly
        const url = `/api/market-data/binance?path=/api/v3/klines&symbol=${selectedCrypto}&interval=${cryptoInterval}&limit=${calculatedLimit}`
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to fetch crypto history: ${response.status} ${errorText}`)
        }
        
        const data = await response.json()
        
        // Validate data structure
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid data format received')
        }
        
        if (isMounted) {
          const historyData = data.map((item: any[]) => {
            if (!Array.isArray(item) || item.length < 5) {
              return null
            }
            const timestamp = item[0]
            return {
              date: new Date(timestamp).toISOString().split('T')[0] + ' ' + new Date(timestamp).toTimeString().split(' ')[0],
              price: parseFloat(item[4]) || 0
            }
          }).filter(Boolean) as { date: string; price: number }[]
          
          const candleData = data.map((item: any[]) => {
            if (!Array.isArray(item) || item.length < 6) {
              return null
            }
            const timestamp = item[0]
            return {
              date: new Date(timestamp).toISOString().split('T')[0] + ' ' + new Date(timestamp).toTimeString().split(' ')[0],
              open: parseFloat(item[1]) || 0,
              high: parseFloat(item[2]) || 0,
              low: parseFloat(item[3]) || 0,
              close: parseFloat(item[4]) || 0,
              volume: parseFloat(item[5]) || 0
            }
          }).filter(Boolean)
          
          setCryptoHistory(historyData)
          setCryptoCandleData(candleData)
        }
      } catch (error) {
        console.error('Error fetching crypto history:', error)
        if (isMounted) {
          setCryptoHistory([])
          setCryptoCandleData([])
        }
      }
    }
    
    fetchHistory()
    return () => { isMounted = false }
  }, [selectedCrypto, cryptoInterval, tab, chartType])
  // Fetch stock history for selected stock and days
  useEffect(() => {
    let isMounted = true
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/stock/history?symbol=${selectedStock}&days=${stockDays}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stock history: ${response.status}`)
  }

        const result = await response.json()
        
        if (isMounted && result && result.prices && result.prices.length > 0) {
          const formattedData = result.prices.map(([timestamp, price]: [number, number]) => {
            const formatted = {
              date: new Date(timestamp).toISOString().split('T')[0], // Use YYYY-MM-DD format
              price
            }
            return formatted
          })
          setStockHistory(formattedData)
      } else {
          setStockHistory([])
        }
      } catch (error) {
        console.error('❌ Error fetching stock history:', error)
        if (isMounted) setStockHistory([])
    }
  }

    if (tab === 'stock' && selectedStock) {
      fetchHistory()
    }
    
    return () => { isMounted = false }
  }, [selectedStock, stockDays, tab])

  // Reset scroll position when data changes
  useEffect(() => {
    setScrollPosition(0)
  }, [cryptoHistory, stockHistory, selectedCrypto, selectedStock, cryptoInterval, stockDays])

  // Prepare chart data for selected crypto or stock
  // const selectedCryptoHistory = cryptoHistory[selectedCrypto] || [] // This line is removed as per new_code
  // For stocks, simulate history (replace with real if available)
  // const selectedStockHistory = Array.from({ length: 30 }, (_, i) => ({ // This line is removed as per new_code
  //   date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(), // This line is removed as per new_code
  //   price: (stockPrices.find(s => s.symbol === selectedStock)?.price || 100) * (1 + 0.05 * Math.sin(i / 5 + Math.random() * 0.2)) // This line is removed as per new_code
  // })) // This line is removed as per new_code

  // Apply zoom and scroll to chart data
  const getZoomedData = (data: any[], zoom: number, scroll: number) => {
    if (!data || data.length === 0) return data
    
    const totalPoints = data.length
    // At 1x zoom, show 80% of data to allow some scrolling
    const visiblePoints = zoom === 1 ? Math.floor(totalPoints * 0.8) : Math.max(10, Math.floor(totalPoints / zoom))
    const maxScroll = Math.max(0, totalPoints - visiblePoints)
    const clampedScroll = Math.min(maxScroll, Math.max(0, scroll))
    
    const startIndex = Math.floor(clampedScroll)
    const endIndex = Math.min(startIndex + visiblePoints, totalPoints)
    
    return data.slice(startIndex, endIndex)
  }

  const zoomedCryptoHistory = getZoomedData(cryptoHistory, zoomLevel, scrollPosition)
  const zoomedStockHistory = getZoomedData(stockHistory, zoomLevel, scrollPosition)
  const zoomedCryptoCandleData = getZoomedData(cryptoCandleData, zoomLevel, scrollPosition)

  // Format large numbers to readable format
  const formatNumber = (num: number): string => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B'
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M'
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K'
    } else {
      return num.toLocaleString()
    }
  }

  const topCrypto = cryptoPrices.slice(0, 5)
  const topStock = stockPrices.slice(0, 5)
  const selectedCryptoObj = cryptoPrices.find(c => c.symbol === selectedCrypto)
  const selectedStockObj = stockPrices.find(s => s.symbol === selectedStock)

  // Custom candlestick chart component using Recharts
  const CandlestickChart = ({ data, interval }: { data: any[], interval: string }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No data available for candlestick chart
        </div>
      )
  }

    // Debug logging
    console.log('Candlestick data received:', data.length, 'items')
    console.log('First few items:', data.slice(0, 3))
    console.log('Interval:', interval)
    
    // Log price variations
    if (data.length > 0) {
      const prices = data.map(d => d.close);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const range = max - min;
      console.log('Price range:', { min, max, range, variation: ((range / min) * 100).toFixed(4) + '%' });
      
      // Log first 10 prices to see variation
      console.log('First 10 prices:', prices.slice(0, 10));
      
      // Check if all prices are the same
      const uniquePrices = [...new Set(prices)];
      console.log('Unique prices:', uniquePrices.length, 'out of', prices.length);
    }

    // Reduce data density for shorter time frames to make candlesticks more visible
    let chartData = data
    if (data.length > 100) {
      // For very large datasets, sample every nth point
      const step = Math.ceil(data.length / 100)
      chartData = data.filter((_, index) => index % step === 0)
    } else if (data.length > 50) {
      // For medium datasets, sample every 2nd point
      chartData = data.filter((_, index) => index % 2 === 0)
    }

    // For 1m time frames, use all data points to show proper minute-by-minute intervals
    if (interval === '1m') {
      chartData = data; // Use all data points for 1m
    }

    // Process data for candlestick chart with colors
    const processedData = chartData.map(item => ({
      date: item.date,
      close: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      isUp: item.close >= item.open,
      bodyHeight: Math.abs(item.close - item.open),
      bodyStart: Math.min(item.open, item.close),
      bodyEnd: Math.max(item.open, item.close)
    }))
    
    return (
      <div className="bg-gray-800 rounded-lg p-6" style={{ width: '100%', height: '400px' }}>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedData} margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                interval={(() => {
                  if (interval === '1m') return 0; // Show all labels for 1m
                  if (interval === '5m') return 1; // Show every other label for 5m
                  if (interval === '15m') return 2; // Show every 3rd label for 15m
                  return 'preserveStartEnd'; // Default for longer time frames
                })()}
                tickFormatter={(value) => {
                  // Hide all time labels to prevent cluttering
                  return ''; // Hide all labels
                }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={[(() => {
                  if (processedData.length === 0) return 0;
                  const prices = processedData.map(d => Math.min(d.low, d.open, d.close));
                  const min = Math.min(...prices);
                  const max = Math.max(...processedData.map(d => Math.max(d.high, d.open, d.close)));
                  const range = max - min;
                  
                  // For 1m time frames, use point-based scaling
                  if (interval === '1m') {
                    // For candlestick, use aggressive scaling to show dramatic curves
                    const range = max - min;
                    // Use aggressive padding to make tiny movements visible
                    const minRange = Math.max(range, 0.01); // At least 1 cent range
                    const padding = minRange * 3; // 300% padding for dramatic curves
                    // Start from the lowest price to bring it to bottom of chart
                    return min;
                  }
                  
                  // For 5m time frames, use point-based scaling
                  if (interval === '5m') {
                    const pointRange = range * 100; // Convert to points (0.01 = 1 point)
                    const padding = Math.max(5, pointRange * 0.3); // At least 5 points padding
                    return Math.max(0, min - (padding / 100));
                  }
                  
                  // For 15m time frames, use point-based scaling
                  if (interval === '15m') {
                    const pointRange = range * 10; // Convert to points (0.1 = 1 point)
                    const padding = Math.max(3, pointRange * 0.2); // At least 3 points padding
                    return Math.max(0, min - (padding / 10));
                  }
                  
                  // For smaller ranges, use percentage-based padding
                  const padding = range < 1 ? range * 0.1 : Math.min(20, range * 0.05);
                  return Math.max(0, min - padding);
                })(), 'dataMax']}
                ticks={(() => {
                  if (processedData.length === 0) return [];
                  const prices = processedData.map(d => Math.max(d.high, d.open, d.close));
                  const min = Math.min(...processedData.map(d => Math.min(d.low, d.open, d.close)));
                  const max = Math.max(...prices);
                  const range = max - min;
                  
                  // For 1m time frames, create point-based ticks
                  if (interval === '1m') {
                    // For candlestick, use aggressive scaling to show dramatic curves
                    const range = max - min;
                    // Use aggressive padding to make tiny movements visible
                    const minRange = Math.max(range, 0.01); // At least 1 cent range
                    const padding = minRange * 3; // 300% padding for dramatic curves
                    // Start from the lowest price to bring it to bottom of chart
                    const start = min;
                    const end = max + padding;
                    // Create tick marks for dramatic curves
                    const step = (end - start) / 8; // 9 intervals for good detail
                    return Array.from({ length: 9 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                  }
                  
                  // For 5m time frames, create point-based ticks
                  if (interval === '5m') {
                    const pointRange = range * 100;
                    const padding = Math.max(5, pointRange * 0.3);
                    const start = Math.max(0, min - (padding / 100));
                    const end = max + (padding / 100);
                    const step = (end - start) / 8; // 8 intervals
                    return Array.from({ length: 9 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                  }
                  
                  // For 15m time frames, create point-based ticks
                  if (interval === '15m') {
                    const pointRange = range * 10;
                    const padding = Math.max(3, pointRange * 0.2);
                    const start = Math.max(0, min - (padding / 10));
                    const end = max + (padding / 10);
                    const step = (end - start) / 6; // 6 intervals
                    return Array.from({ length: 7 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                  }
                  
                  const padding = range < 1 ? range * 0.1 : Math.min(20, range * 0.05);
                  const start = Math.max(0, min - padding);
                  const step = (max - start) / 5;
                  return Array.from({ length: 6 }, (_, i) => Math.round((start + step * i) * 100) / 100);
                })()}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                formatter={(value, name) => [value?.toLocaleString(), name]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              
              {/* High-Low lines (wicks) */}
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#9CA3AF" 
                strokeWidth={1} 
                dot={false}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#9CA3AF" 
                strokeWidth={1} 
                dot={false}
                connectNulls={false}
              />
              
              {/* Green bars for up candles */}
              <Bar 
                dataKey={(entry) => entry.isUp ? entry.bodyHeight : 0}
                fill="#10B981"
                stackId="body"
                barSize={Math.max(10, 600 / processedData.length)} // Wider bars for better visibility
              />
              
              {/* Red bars for down candles */}
              <Bar 
                dataKey={(entry) => !entry.isUp ? entry.bodyHeight : 0}
                fill="#EF4444"
                stackId="body"
                barSize={Math.max(10, 600 / processedData.length)} // Wider bars for better visibility
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Live Market Data</h1>
        </div>
        {/* Tab Menu */}
        <div className="flex justify-center space-x-4 mb-8">
          <button onClick={() => setTab('crypto')} className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${tab === 'crypto' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'}`}>Crypto</button>
          <button onClick={() => setTab('stock')} className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${tab === 'stock' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'}`}>Stock</button>
        </div>
        {/* Top 5 Heading */}
        <div className="mb-2 text-xl font-semibold text-center">
          {tab === 'crypto' ? 'Top 5 Cryptocurrencies' : 'Top 5 Stocks'}
        </div>
        {/* Top 5 Cards */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tab === 'crypto' ? topCrypto.map(item => (
            <div key={item.symbol} className="bg-gray-800 rounded-lg p-4 w-48 text-center shadow-md cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-xl" onClick={() => setSelectedCrypto(item.symbol)}>
              <div className="text-lg font-bold mb-1">{item.symbol}</div>
              <div className="text-2xl font-bold mb-1">${formatNumber(item.price)}</div>
              <div className={`text-sm ${item.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(2)}%</div>
            </div>
          )) : topStock.map(item => (
            <div key={item.symbol} className="bg-gray-800 rounded-lg p-4 w-48 text-center shadow-md cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-xl" onClick={() => setSelectedStock(item.symbol)}>
              <div className="text-lg font-bold mb-1">{item.symbol}</div>
              <div className="text-2xl font-bold mb-1">${formatNumber(item.price)}</div>
            </div>
          ))}
        </div>
        {/* Dropdown for selection */}
        <div className="flex justify-center mb-8">
          {tab === 'crypto' ? (
            <select value={selectedCrypto} onChange={e => setSelectedCrypto(e.target.value)} className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg">
              {cryptoPrices.map(item => (
                <option key={item.symbol} value={item.symbol}>{item.symbol}</option>
              ))}
            </select>
                      ) : (
            <select value={selectedStock} onChange={e => setSelectedStock(e.target.value)} className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg">
              {stockPrices.map(item => (
                <option key={item.symbol} value={item.symbol}>{item.symbol}</option>
              ))}
            </select>
          )}
        </div>
      {/* Chart and details for selected */}
      <div className="mb-12 w-full max-w-3xl mx-auto flex flex-col items-center">
        <div className="flex justify-center mb-4 gap-6">
          {tab === 'crypto' ? (
            <>
              {/* Time Frame Radio Buttons */}
              <div className="flex items-center space-x-4 bg-gray-800 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-300 mr-2">Time Frame:</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cryptoInterval"
                    value="1m"
                    checked={cryptoInterval === '1m'}
                    onChange={(e) => setCryptoInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    cryptoInterval === '1m' 
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    1m
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cryptoInterval"
                    value="5m"
                    checked={cryptoInterval === '5m'}
                    onChange={(e) => setCryptoInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    cryptoInterval === '5m' 
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    5m
              </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cryptoInterval"
                    value="15m"
                    checked={cryptoInterval === '15m'}
                    onChange={(e) => setCryptoInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    cryptoInterval === '15m' 
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    15m
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cryptoInterval"
                    value="30m"
                    checked={cryptoInterval === '30m'}
                    onChange={(e) => setCryptoInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    cryptoInterval === '30m' 
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    30m
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cryptoInterval"
                    value="1h"
                    checked={cryptoInterval === '1h'}
                    onChange={(e) => setCryptoInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    cryptoInterval === '1h' 
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    1h
              </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cryptoInterval"
                    value="4h"
                    checked={cryptoInterval === '4h'}
                    onChange={(e) => setCryptoInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    cryptoInterval === '4h' 
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    4h
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cryptoInterval"
                    value="1d"
                    checked={cryptoInterval === '1d'}
                    onChange={(e) => setCryptoInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    cryptoInterval === '1d' 
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    1d
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cryptoInterval"
                    value="1w"
                    checked={cryptoInterval === '1w'}
                    onChange={(e) => setCryptoInterval(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    cryptoInterval === '1w' 
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    1w
                  </span>
                </label>
        </div>

              {/* Chart Type Radio Buttons */}
              <div className="flex items-center space-x-4 bg-gray-800 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-300 mr-2">Chart Type:</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="chartType"
                    value="line"
                    checked={chartType === 'line'}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    chartType === 'line' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    Line
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="chartType"
                    value="bar"
                    checked={chartType === 'bar'}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    chartType === 'bar' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    Bar
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="chartType"
                    value="candlestick"
                    checked={chartType === 'candlestick'}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    chartType === 'candlestick' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    Candlestick
              </span>
                </label>
                </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-4 bg-gray-800 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-300 mr-2">Time Frame:</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="stockDays"
                    value={1}
                    checked={stockDays === 1}
                    onChange={(e) => setStockDays(Number(e.target.value))}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    stockDays === 1 
                ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    1D
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="stockDays"
                    value={3}
                    checked={stockDays === 3}
                    onChange={(e) => setStockDays(Number(e.target.value))}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    stockDays === 3 
                ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    3D
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="stockDays"
                    value={7}
                    checked={stockDays === 7}
                    onChange={(e) => setStockDays(Number(e.target.value))}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    stockDays === 7 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    7D
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="stockDays"
                    value={30}
                    checked={stockDays === 30}
                    onChange={(e) => setStockDays(Number(e.target.value))}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    stockDays === 30 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    30D
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="stockDays"
                    value={90}
                    checked={stockDays === 90}
                    onChange={(e) => setStockDays(Number(e.target.value))}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    stockDays === 90 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    90D
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="stockDays"
                    value={180}
                    checked={stockDays === 180}
                    onChange={(e) => setStockDays(Number(e.target.value))}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    stockDays === 180 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    180D
                  </span>
                </label>
        </div>

              {/* Chart Type Radio Buttons - Only Line and Bar for stocks */}
              <div className="flex items-center space-x-4 bg-gray-800 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-300 mr-2">Chart Type:</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="chartType"
                    value="line"
                    checked={chartType === 'line'}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    chartType === 'line' 
                        ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    Line
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="chartType"
                    value="bar"
                    checked={chartType === 'bar'}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    chartType === 'bar' 
                ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'
                  }`}>
                    Bar
                  </span>
                </label>
                      </div>
            </>
          )}
                    </div>
        <h2 className="text-xl font-semibold mb-4 text-center">{tab === 'crypto' ? selectedCrypto : selectedStock} Price Trend</h2>
        <div className="bg-gray-800 rounded-lg p-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Debug text for crypto */}
          {tab === 'crypto' && (
            <div className="mb-4 p-3 bg-gray-800 rounded text-xs text-gray-800 font-mono">
              DEBUG: Crypto={selectedCrypto} | Interval={cryptoInterval} | ChartType={chartType} | DataPoints={cryptoHistory.length} | PriceRange={cryptoHistory.length > 0 ? `${Math.min(...cryptoHistory.map(d => d.price)).toFixed(2)}-${Math.max(...cryptoHistory.map(d => d.price)).toFixed(2)}` : 'N/A'}
            </div>
          )}
          {tab === 'crypto' ? (
            chartType === 'line' ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={zoomedCryptoHistory} margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    tickFormatter={(value) => ''} // Hide all labels
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    domain={[(() => {
                      if (cryptoHistory.length === 0) return 0;
                      const prices = cryptoHistory.map(d => d.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      const range = max - min;
                      
                      // For 1m time frames, use point-based scaling
                      if (cryptoInterval === '1m') {
                        // Use more aggressive scaling to show small movements
                        const range = max - min;
                        // Ensure minimum range to show multiple price levels
                        const minRange = Math.max(range, 0.01); // At least 1 cent range
                        const padding = minRange * 0.5; // 50% padding to amplify small movements
                        return Math.max(0, min - padding);
                      }
                      
                      // For 5m time frames, use point-based scaling
                      if (cryptoInterval === '5m') {
                        const pointRange = range * 100; // Convert to points (0.01 = 1 point)
                        const padding = Math.max(5, pointRange * 0.3); // At least 5 points padding
                        return Math.max(0, min - (padding / 100));
                      }
                      
                      // For 15m time frames, use point-based scaling
                      if (cryptoInterval === '15m') {
                        const pointRange = range * 10; // Convert to points (0.1 = 1 point)
                        const padding = Math.max(3, pointRange * 0.2); // At least 3 points padding
                        return Math.max(0, min - (padding / 10));
                      }
                      
                      // For smaller ranges, use percentage-based padding
                      const padding = range < 1 ? range * 0.1 : Math.min(20, range * 0.05);
                      return Math.max(0, min - padding);
                    })(), 'dataMax']}
                    ticks={(() => {
                      if (cryptoHistory.length === 0) return [];
                      const prices = cryptoHistory.map(d => d.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      const range = max - min;
                      
                      // For 1m time frames, create point-based ticks
                      if (cryptoInterval === '1m') {
                        // Use more aggressive scaling to show small movements
                        const range = max - min;
                        // Ensure minimum range to show multiple price levels
                        const minRange = Math.max(range, 0.01); // At least 1 cent range
                        const padding = minRange * 0.5; // 50% padding to amplify small movements
                        const start = Math.max(0, min - padding);
                        const end = max + padding;
                        // Ensure we have at least 5 tick marks
                        const step = (end - start) / 4; // 5 intervals (0, 1, 2, 3, 4)
                        return Array.from({ length: 5 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                      }
                      
                      // For 5m time frames, create point-based ticks
                      if (cryptoInterval === '5m') {
                        const pointRange = range * 100;
                        const padding = Math.max(5, pointRange * 0.3);
                        const start = Math.max(0, min - (padding / 100));
                        const end = max + (padding / 100);
                        const step = (end - start) / 8; // 8 intervals
                        return Array.from({ length: 9 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                      }
                      
                      // For 15m time frames, create point-based ticks
                      if (cryptoInterval === '15m') {
                        const pointRange = range * 10;
                        const padding = Math.max(3, pointRange * 0.2);
                        const start = Math.max(0, min - (padding / 10));
                        const end = max + (padding / 10);
                        const step = (end - start) / 6; // 6 intervals
                        return Array.from({ length: 7 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                      }
                      
                      const padding = range < 1 ? range * 0.1 : Math.min(20, range * 0.05);
                      const start = Math.max(0, min - padding);
                      const step = (max - start) / 5;
                      return Array.from({ length: 6 }, (_, i) => Math.round((start + step * i) * 100) / 100);
                    })()}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#F7931A" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6, fill: '#F7931A' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={zoomedCryptoHistory} margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    tickFormatter={(value) => ''} // Hide all labels
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    domain={[(() => {
                      if (cryptoHistory.length === 0) return 0;
                      const prices = cryptoHistory.map(d => d.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      const range = max - min;
                      
                      // For 1m time frames, use point-based scaling
                      if (cryptoInterval === '1m') {
                        // Use more aggressive scaling to show small movements
                        const range = max - min;
                        // Ensure minimum range to show multiple price levels
                        const minRange = Math.max(range, 0.01); // At least 1 cent range
                        const padding = minRange * 0.5; // 50% padding to amplify small movements
                        return Math.max(0, min - padding);
                      }
                      
                      // For 5m time frames, use point-based scaling
                      if (cryptoInterval === '5m') {
                        const pointRange = range * 100; // Convert to points (0.01 = 1 point)
                        const padding = Math.max(5, pointRange * 0.3); // At least 5 points padding
                        return Math.max(0, min - (padding / 100));
                      }
                      
                      // For 15m time frames, use point-based scaling
                      if (cryptoInterval === '15m') {
                        const pointRange = range * 10; // Convert to points (0.1 = 1 point)
                        const padding = Math.max(3, pointRange * 0.2); // At least 3 points padding
                        return Math.max(0, min - (padding / 10));
                      }
                      
                      // For smaller ranges, use percentage-based padding
                      const padding = range < 1 ? range * 0.1 : Math.min(20, range * 0.05);
                      return Math.max(0, min - padding);
                    })(), 'dataMax']}
                    ticks={(() => {
                      if (cryptoHistory.length === 0) return [];
                      const prices = cryptoHistory.map(d => d.price);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      const range = max - min;
                      
                                              // For 1m time frames, create point-based ticks
                        if (cryptoInterval === '1m') {
                          // Use more aggressive scaling to show small movements
                          const range = max - min;
                          // Ensure minimum range to show multiple price levels
                          const minRange = Math.max(range, 0.01); // At least 1 cent range
                          const padding = minRange * 0.5; // 50% padding to amplify small movements
                                                      const start = Math.max(0, min - padding);
                            const end = max + padding;
                            // Ensure we have at least 5 tick marks
                            const step = (end - start) / 4; // 5 intervals (0, 1, 2, 3, 4)
                            return Array.from({ length: 5 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                        }
                      
                      // For 5m time frames, create point-based ticks
                      if (cryptoInterval === '5m') {
                        const pointRange = range * 100;
                        const padding = Math.max(5, pointRange * 0.3);
                        const start = Math.max(0, min - (padding / 100));
                        const end = max + (padding / 100);
                        const step = (end - start) / 8; // 8 intervals
                        return Array.from({ length: 9 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                      }
                      
                      // For 15m time frames, create point-based ticks
                      if (cryptoInterval === '15m') {
                        const pointRange = range * 10;
                        const padding = Math.max(3, pointRange * 0.2);
                        const start = Math.max(0, min - (padding / 10));
                        const end = max + (padding / 10);
                        const step = (end - start) / 6; // 6 intervals
                        return Array.from({ length: 7 }, (_, i) => Math.round((start + step * i) * 1000) / 1000);
                      }
                      
                      const padding = range < 1 ? range * 0.1 : Math.min(20, range * 0.05);
                      const start = Math.max(0, min - padding);
                      const step = (max - start) / 5;
                      return Array.from({ length: 6 }, (_, i) => Math.round((start + step * i) * 100) / 100);
                    })()}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="price" fill="#F7931A" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <CandlestickChart data={zoomedCryptoCandleData} interval={cryptoInterval} />
            )
          ) : (
            <div style={{ backgroundColor: '#1F2937', border: '2px solid #374151', borderRadius: '8px', padding: '20px', height: '450px' }}>
              <div style={{ color: '#1F2937', marginBottom: '5px', fontSize: '10px', opacity: '0.7' }}>
                Live data from Finnhub API | Real-time stock prices | Interactive chart with hover tooltips | Professional market data visualization | Powered by React and Recharts
          </div>

              {stockHistory.length > 0 ? (
                chartType === 'line' ? (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart 
                      data={zoomedStockHistory} 
                      margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                        tickFormatter={(value) => ''} // Hide all labels
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        domain={[(() => {
                          if (stockHistory.length === 0) return 0;
                          const prices = stockHistory.map(d => d.price);
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          const range = max - min;
                          // For smaller ranges, use percentage-based padding
                          const padding = range < 1 ? range * 0.1 : Math.min(20, range * 0.05);
                          return Math.max(0, min - padding);
                        })(), 'dataMax']}
                        ticks={(() => {
                          if (stockHistory.length === 0) return [];
                          const prices = stockHistory.map(d => d.price);
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          const start = Math.round((min - 20) * 100) / 100;
                          const step = (max - start) / 5;
                          return Array.from({ length: 6 }, (_, i) => Math.round((start + step * i) * 100) / 100);
                        })()}
                      />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                        stroke="#F59E42" 
                        strokeWidth={3} 
                      dot={false}
                        activeDot={{ r: 6, fill: '#F59E42' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                ) : chartType === 'bar' ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={zoomedStockHistory} margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                        tickFormatter={(value) => ''} // Hide all labels
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        domain={[(() => {
                          if (stockHistory.length === 0) return 0;
                          const prices = stockHistory.map(d => d.price);
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          const range = max - min;
                          // For smaller ranges, use percentage-based padding
                          const padding = range < 1 ? range * 0.1 : Math.min(20, range * 0.05);
                          return Math.max(0, min - padding);
                        })(), 'dataMax']}
                        ticks={(() => {
                          if (stockHistory.length === 0) return [];
                          const prices = stockHistory.map(d => d.price);
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          const start = Math.max(0, Math.round((min - 20) * 100) / 100);
                          const step = (max - start) / 5;
                          return Array.from({ length: 6 }, (_, i) => Math.round((start + step * i) * 100) / 100);
                        })()}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="price" fill="#F59E42" />
                    </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-lg font-medium">Please select Line or Bar chart type</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-lg font-medium">Loading stock data...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest data</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Zoom Controls */}
        <div className="flex justify-center items-center gap-4 mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Zoom:</span>
            <button 
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              -
            </button>
            <span className="text-sm text-white min-w-[40px] text-center">{zoomLevel.toFixed(1)}x</span>
            <button 
              onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.5))}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              +
            </button>
          </div>
          
          <button 
            onClick={() => {
              setZoomLevel(1)
              setScrollPosition(0)
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Reset
          </button>
        </div>
        
        {/* Details */}
        <div className="bg-gray-900 rounded-lg p-4 mt-4">
          {tab === 'crypto' && selectedCryptoObj && (
            <div className="flex flex-wrap justify-center items-center gap-6 text-center">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Symbol</span>
                <span className="font-bold text-lg">{selectedCryptoObj.symbol}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Price</span>
                <span className="font-bold text-lg">${formatNumber(selectedCryptoObj.price)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">24h Change</span>
                <span className={`font-bold text-lg ${selectedCryptoObj.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedCryptoObj.priceChangePercent >= 0 ? '+' : ''}{selectedCryptoObj.priceChangePercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Market Cap</span>
                <span className="font-bold text-lg">${formatNumber(selectedCryptoObj.marketCap)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Volume</span>
                <span className="font-bold text-lg">{formatNumber(selectedCryptoObj.volume)}</span>
              </div>
            </div>
          )}
          {tab === 'stock' && selectedStockObj && (
            <div className="flex flex-wrap justify-center items-center gap-6 text-center">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Symbol</span>
                <span className="font-bold text-lg">{selectedStockObj.symbol}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Price</span>
                <span className="font-bold text-lg">${formatNumber(selectedStockObj.price)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">24h Change</span>
                <span className={`font-bold text-lg ${selectedStockObj.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedStockObj.priceChange >= 0 ? '+' : ''}{selectedStockObj.priceChange?.toFixed(2)} ({selectedStockObj.priceChangePercent >= 0 ? '+' : ''}{selectedStockObj.priceChangePercent?.toFixed(2)}%)
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">High</span>
                <span className="font-bold text-lg">${formatNumber(selectedStockObj.high)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Low</span>
                <span className="font-bold text-lg">${formatNumber(selectedStockObj.low)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Open</span>
                <span className="font-bold text-lg">${formatNumber(selectedStockObj.open)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Prev Close</span>
                <span className="font-bold text-lg">${formatNumber(selectedStockObj.prevClose)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Volume</span>
                <span className="font-bold text-lg">{selectedStockObj.volume ? formatNumber(selectedStockObj.volume) : 'N/A'}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-1">Market Status</span>
                <span className="font-bold text-lg">
                  {selectedStockObj.marketOpen ? 
                    <span className="bg-green-700 text-white px-2 py-1 rounded">Open</span> : 
                    <span className="bg-red-700 text-white px-2 py-1 rounded">Closed</span>
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Full tables */}
      {tab === 'crypto' ? (
        <div className="mb-12 w-full max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-center">All Cryptocurrencies</h2>
          <table className="w-full bg-gray-800 rounded-lg">
                  <thead>
              <tr>
                <th className="py-2 px-4 text-left">Symbol</th>
                <th className="py-2 px-4 text-right">Price (USD)</th>
                <th className="py-2 px-4 text-right">24h Change</th>
                <th className="py-2 px-4 text-right">Market Cap</th>
                <th className="py-2 px-4 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
              {cryptoPrices.map((item) => (
                <tr key={item.symbol} className="border-b border-gray-700/50">
                  <td className="py-2 px-4">{item.symbol}</td>
                  <td className="py-2 px-4 text-right">${formatNumber(item.price)}</td>
                  <td className={`py-2 px-4 text-right ${item.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(2)}%</td>
                  <td className="py-2 px-4 text-right">${formatNumber(item.marketCap)}</td>
                  <td className="py-2 px-4 text-right">{formatNumber(item.volume)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                          </div>
      ) : (
        <div className="mb-12 w-full max-w-2xl mx-auto flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-center">All Stocks</h2>
          <table className="w-full bg-gray-800 rounded-lg">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Symbol</th>
                <th className="py-2 px-4 text-right">Price (USD)</th>
                <th className="py-2 px-4 text-right">24h Change</th>
                <th className="py-2 px-4 text-right">High</th>
                <th className="py-2 px-4 text-right">Low</th>
                <th className="py-2 px-4 text-right">Open</th>
                <th className="py-2 px-4 text-right">Prev Close</th>
                <th className="py-2 px-4 text-right">Volume</th>
                <th className="py-2 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockPrices.map((item) => (
                <tr key={item.symbol} className="border-b border-gray-700/50">
                  <td className="py-2 px-4">{item.symbol}</td>
                  <td className="py-2 px-4 text-right">${formatNumber(item.price)}</td>
                  <td className={`py-2 px-4 text-right ${item.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{item.priceChange >= 0 ? '+' : ''}{item.priceChange?.toFixed(2)} ({item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent?.toFixed(2)}%)</td>
                  <td className="py-2 px-4 text-right">${formatNumber(item.high)}</td>
                  <td className="py-2 px-4 text-right">${formatNumber(item.low)}</td>
                  <td className="py-2 px-4 text-right">${formatNumber(item.open)}</td>
                  <td className="py-2 px-4 text-right">${formatNumber(item.prevClose)}</td>
                  <td className="py-2 px-4 text-right">{item.volume ? formatNumber(item.volume) : 'N/A'}</td>
                  <td className="py-2 px-4 text-right">{item.marketOpen ? <span className="bg-green-700 text-white px-2 py-1 rounded">Open</span> : <span className="bg-red-700 text-white px-2 py-1 rounded">Closed</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
      )}
      </div>
    </div>
  )
} 
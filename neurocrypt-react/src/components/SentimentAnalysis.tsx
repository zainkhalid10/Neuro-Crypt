'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react'

export default function SentimentAnalysis() {
  const [cryptos, setCryptos] = useState<any[]>([]) // Placeholder for cryptos data
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin')
  const [sentimentData, setSentimentData] = useState({
    positive: 65,
    negative: 20,
    neutral: 15,
    overall: 'Bullish'
  })

  useEffect(() => {
    // fetchCryptos() // Removed as per edit hint
  }, [])

  // Removed fetchCryptos function

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return 'text-green-400'
      case 'bearish':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const mockSentimentData = [
    { source: 'Twitter', sentiment: 'Bullish', score: 72, volume: 1250000 },
    { source: 'Reddit', sentiment: 'Neutral', score: 48, volume: 890000 },
    { source: 'News', sentiment: 'Bearish', score: 35, volume: 650000 },
    { source: 'Telegram', sentiment: 'Bullish', score: 68, volume: 450000 },
    { source: 'Discord', sentiment: 'Bullish', score: 75, volume: 320000 }
  ]

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🎭 Sentiment Analysis</h1>
          <p className="text-gray-400">Track market sentiment across social media and news sources</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sentiment Overview */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Market Sentiment Overview</h2>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
              >
                {/* Placeholder for crypto options */}
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="solana">Solana (SOL)</option>
              </select>
            </div>

            {/* Sentiment Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-medium">Positive</span>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{sentimentData.positive}%</p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-medium">Negative</span>
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-white">{sentimentData.negative}%</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 font-medium">Neutral</span>
                  <Activity className="h-5 w-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">{sentimentData.neutral}%</p>
              </div>
            </div>

            {/* Overall Sentiment */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Overall Sentiment</span>
                <span className={`font-bold text-lg ${getSentimentColor(sentimentData.overall)}`}>
                  {sentimentData.overall}
                </span>
              </div>
            </div>
          </div>

          {/* Sentiment Sources */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sentiment by Source</h2>
            <div className="space-y-3">
              {mockSentimentData.map((source, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{source.source}</span>
                    <span className={`text-sm font-medium ${getSentimentColor(source.sentiment)}`}>
                      {source.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Score: {source.score}/100</span>
                    <span className="text-gray-400">{source.volume.toLocaleString()} mentions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Trends */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Sentiment Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">24h Change</span>
              </div>
              <p className="text-green-400 font-bold">+12.5%</p>
              <p className="text-gray-400 text-sm">More bullish sentiment</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">Volume</span>
              </div>
              <p className="text-blue-400 font-bold">2.3M</p>
              <p className="text-gray-400 text-sm">Total mentions today</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">Top Topic</span>
              </div>
              <p className="text-purple-400 font-bold">#Bitcoin</p>
              <p className="text-gray-400 text-sm">Most discussed</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-medium">Momentum</span>
              </div>
              <p className="text-yellow-400 font-bold">High</p>
              <p className="text-gray-400 text-sm">Strong social activity</p>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-white font-medium">Positive Sentiment Drivers</h3>
                  <p className="text-gray-400 text-sm">Institutional adoption news and positive regulatory developments are driving bullish sentiment</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-white font-medium">Negative Sentiment Factors</h3>
                  <p className="text-gray-400 text-sm">Market volatility and regulatory uncertainty are causing some bearish sentiment</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-white font-medium">Social Media Trends</h3>
                  <p className="text-gray-400 text-sm">Twitter and Reddit showing increased engagement with crypto discussions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <h3 className="text-white font-medium">News Impact</h3>
                  <p className="text-gray-400 text-sm">Major news outlets covering crypto more frequently with balanced reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
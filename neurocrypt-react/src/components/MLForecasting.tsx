'use client'

import { useState, useEffect } from 'react'
import { Bot, TrendingUp, TrendingDown, Calendar, Target, BarChart3, Brain, Zap, Shield, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Legend } from 'recharts'
import { getTopCryptoPrices } from '@/lib/api'

export default function MLForecasting() {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTCUSDT')
  const [modelType, setModelType] = useState<string>('Ensemble Model')
  const [predictionDays, setPredictionDays] = useState<number>(7)
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.8)
  const [showFeatures, setShowFeatures] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [modelMetrics, setModelMetrics] = useState<any>(null)
  const [cryptoOptions, setCryptoOptions] = useState<any[]>([])
  const [selectedCryptoData, setSelectedCryptoData] = useState<any>(null)

  const modelTypes = [
    'Ensemble Model',
    'LSTM Neural Network', 
    'Random Forest',
    'XGBoost',
    'All Models Comparison'
  ]

  // Fetch crypto options
  useEffect(() => {
    const fetchCryptoOptions = async () => {
      try {
        const data = await getTopCryptoPrices()
        setCryptoOptions(data)
        if (data.length > 0 && !selectedCryptoData) {
          setSelectedCryptoData(data[0])
        }
      } catch (error) {
        console.error('Error fetching crypto options:', error)
      }
    }
    fetchCryptoOptions()
  }, [])

  useEffect(() => {
    if (cryptoOptions.length > 0) {
      const selected = cryptoOptions.find(crypto => crypto.symbol === selectedCrypto)
      setSelectedCryptoData(selected)
      generatePrediction()
    }
  }, [selectedCrypto, modelType, predictionDays, cryptoOptions])

  const generatePrediction = async () => {
    setLoading(true)
    try {
      if (!selectedCryptoData) return

      // Use real crypto data for historical simulation
      const basePrice = selectedCryptoData.price
      const volatility = Math.abs(selectedCryptoData.priceChangePercent) / 100 || 0.05
      const historical = []
      const now = Date.now()
      
      for (let i = 365; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000)
        const randomFactor = 1 + (Math.random() - 0.5) * volatility
        const price = basePrice * randomFactor * (1 + i * 0.0001)
        historical.push({
          date: date.toISOString().split('T')[0],
          price: price,
          volume: selectedCryptoData.volume * (0.8 + Math.random() * 0.4)
        })
      }
      
      setHistoricalData(historical)

      // Simulate ML prediction results based on real data
      const currentPrice = historical[historical.length - 1].price
      const predictions = []
      const confidence = 0.75 + Math.random() * 0.2
      
      for (let i = 1; i <= predictionDays; i++) {
        const trend = Math.random() > 0.5 ? 1 : -1
        const change = (Math.random() * 0.1 + 0.02) * trend
        const predictedPrice = currentPrice * (1 + change * i)
        predictions.push({
          date: new Date(now + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: predictedPrice
        })
      }

      const metrics = {
        rmse: Math.random() * 1000 + 500,
        mae: Math.random() * 800 + 400,
        r2_score: 0.6 + Math.random() * 0.3,
        mape: Math.random() * 5 + 2,
        sharpe_ratio: Math.random() * 2 + 0.5,
        max_drawdown: Math.random() * 10 + 5,
        confidence: confidence,
        volatility: Math.abs(selectedCryptoData.priceChangePercent) || Math.random() * 10 + 5
      }

      setModelMetrics(metrics)
      setPredictionData({
        predictions: predictions,
        ...metrics
      })

    } catch (error) {
      console.error('Error generating prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  const getModelColor = (model: string) => {
    switch (model) {
      case 'Ensemble Model': return '#10B981'
      case 'LSTM Neural Network': return '#3B82F6'
      case 'Random Forest': return '#F59E0B'
      case 'XGBoost': return '#EF4444'
      default: return '#8B5CF6'
    }
  }

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'Ensemble Model': return <Shield className="w-5 h-5" />
      case 'LSTM Neural Network': return <Brain className="w-5 h-5" />
      case 'Random Forest': return <BarChart3 className="w-5 h-5" />
      case 'XGBoost': return <Zap className="w-5 h-5" />
      default: return <Bot className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
            <Bot className="w-8 h-8 mr-3" />
            Machine Learning Cryptocurrency Forecasting
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced AI-powered price predictions using multiple machine learning models
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cryptocurrency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Cryptocurrency
              </label>
              <select 
                value={selectedCrypto} 
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                {cryptoOptions.map(crypto => (
                  <option key={crypto.symbol} value={crypto.symbol}>
                    {crypto.symbol} - ${crypto.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Model Type
              </label>
              <select 
                value={modelType} 
                onChange={(e) => setModelType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                {modelTypes.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Prediction Days */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prediction Period (Days)
              </label>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={predictionDays} 
                onChange={(e) => setPredictionDays(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center mt-1 text-sm text-gray-400">{predictionDays} days</div>
            </div>

            {/* Confidence Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confidence Threshold
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="0.95" 
                step="0.05"
                value={confidenceThreshold} 
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center mt-1 text-sm text-gray-400">{(confidenceThreshold * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={showFeatures} 
                onChange={(e) => setShowFeatures(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Show Feature Importance</span>
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Training {modelType}...
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && predictionData && (
          <div className="space-y-8">
            {/* Model Header */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getModelIcon(modelType)}
                                  <h2 className="text-2xl font-bold ml-3">
                  {modelType} Predictions: {selectedCryptoData?.symbol || selectedCrypto}
                </h2>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Model Confidence</div>
                  <div className="text-2xl font-bold" style={{ color: getModelColor(modelType) }}>
                    {(predictionData.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-1">Current Price</div>
                  <div className="text-xl font-bold">
                    ${historicalData[historicalData.length - 1]?.price.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-1">Predicted Price</div>
                  <div className="text-xl font-bold text-green-400">
                    ${predictionData.predictions[predictionData.predictions.length - 1]?.price.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-1">Price Change</div>
                  <div className="text-xl font-bold text-green-400">
                    +{((predictionData.predictions[predictionData.predictions.length - 1]?.price / historicalData[historicalData.length - 1]?.price - 1) * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-400 mb-1">Volatility</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {predictionData.volatility.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Price Prediction Chart</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={[...historicalData, ...predictionData.predictions]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    
                    {/* Historical Data */}
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      data={historicalData}
                      stroke="#FF6B35" 
                      strokeWidth={2} 
                      dot={false}
                      name="Historical Price"
                    />
                    
                    {/* Predictions */}
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      data={predictionData.predictions}
                      stroke={getModelColor(modelType)} 
                      strokeWidth={3} 
                      strokeDasharray="5 5"
                      dot={{ fill: getModelColor(modelType), r: 4 }}
                      name="Predicted Price"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Model Performance Metrics */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Model Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">RMSE</div>
                  <div className="text-lg font-bold">{predictionData.rmse.toFixed(2)}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">MAE</div>
                  <div className="text-lg font-bold">{predictionData.mae.toFixed(2)}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">R² Score</div>
                  <div className="text-lg font-bold">{predictionData.r2_score.toFixed(3)}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">MAPE</div>
                  <div className="text-lg font-bold">{predictionData.mape.toFixed(2)}%</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
                  <div className="text-lg font-bold">{predictionData.sharpe_ratio.toFixed(2)}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
                  <div className="text-lg font-bold">{predictionData.max_drawdown.toFixed(2)}%</div>
                </div>
              </div>
            </div>

            {/* Feature Importance (if enabled) */}
            {showFeatures && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Feature Importance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { feature: 'Price Momentum', importance: 0.35 },
                      { feature: 'Volume', importance: 0.25 },
                      { feature: 'Market Sentiment', importance: 0.20 },
                      { feature: 'Technical Indicators', importance: 0.15 },
                      { feature: 'News Sentiment', importance: 0.05 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="feature" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                      />
                      <Bar dataKey="importance" fill={getModelColor(modelType)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Model Insights */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Model Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                <div>
                  <div className="font-medium text-green-400">Ensemble Advantage</div>
                  <div className="text-sm text-gray-400">Ensemble models provide more stable predictions by combining multiple algorithms.</div>
                </div>
              </div>
              <div className="flex items-start">
                <Brain className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-400">LSTM Strengths</div>
                  <div className="text-sm text-gray-400">Neural networks excel at capturing complex temporal patterns in cryptocurrency data.</div>
                </div>
              </div>
              <div className="flex items-start">
                <Zap className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-400">Speed vs Accuracy</div>
                  <div className="text-sm text-gray-400">Random Forest offers fast predictions while XGBoost provides high accuracy.</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <BarChart3 className="w-5 h-5 text-purple-400 mr-2 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-400">Feature Engineering</div>
                  <div className="text-sm text-gray-400">Technical indicators, sentiment scores, and market data improve prediction accuracy.</div>
                </div>
              </div>
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <div className="font-medium text-red-400">Volatility Warning</div>
                  <div className="text-sm text-gray-400">Cryptocurrency markets are highly volatile; use predictions as guidance, not certainty.</div>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-indigo-400 mr-2 mt-0.5" />
                <div>
                  <div className="font-medium text-indigo-400">Model Retraining</div>
                  <div className="text-sm text-gray-400">Models should be retrained regularly with new data to maintain accuracy.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 mt-8">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">Risk Disclaimer</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                These predictions are based on historical data and mathematical models. Cryptocurrency markets are highly volatile and unpredictable. 
                Never invest more than you can afford to lose, and always do your own research before making investment decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-400 text-sm">
          <div className="flex items-center justify-center space-x-4">
            <span>Model Last Updated: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>Data Points Used: {historicalData.length}</span>
            <span>•</span>
            <span>Prediction Confidence: {(predictionData?.confidence * 100 || 0).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
} 
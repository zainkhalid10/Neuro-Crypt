import axios from 'axios'

// Finnhub API Configuration
const FINNHUB_API_BASE = 'https://finnhub.io/api/v1'
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || 'demo'

// TypeScript interfaces
export interface CryptoData {
  id: string
  name: string
  symbol: string
  current_price: number
  market_cap: number
  total_volume: number
  price_change_percentage_24h: number
  image?: string
}

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  volume: number
}

export interface MarketData {
  total_market_cap: number
  total_volume: number
  market_cap_change_percentage_24h_usd: number
}

// Helper function to fetch data with error handling
async function fetchWithFinnhub(endpoint: string, params: any = {}) {
  try {
    if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'demo') {
      throw new Error('No valid Finnhub API key provided')
    }

    const response = await axios.get(`${FINNHUB_API_BASE}/${endpoint}`, {
      params: {
        ...params,
        token: FINNHUB_API_KEY
      },
      timeout: 20000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error('❌ Finnhub API authentication failed - check your API key')
      throw new Error('API authentication failed')
    } else if (error.response?.status === 429) {
      console.error('❌ Finnhub API rate limit exceeded')
      throw new Error('API rate limit exceeded')
    } else {
      console.error('❌ Finnhub API error:', error.message)
      throw error
    }
  }
}

// Fetch crypto price directly from Binance public API (no proxy, no API key)
export async function getCryptoPrice(symbol: string): Promise<number> {
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch crypto price')
  const data = await response.json()
  return parseFloat(data.price)
}

// Get top stocks using Finnhub API
export async function getTopStocks(limit: number = 20): Promise<StockData[]> {
  try {
    console.log('🔄 Fetching live stock data from Finnhub...')
    
    if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'demo') {
      throw new Error('Finnhub API key required for stock data. Please add NEXT_PUBLIC_FINNHUB_API_KEY to your environment variables.')
    }
    
    const stockData: StockData[] = []
    const topStockSymbols = [
      'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
      'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'BAC'
    ]
    
    for (const symbol of topStockSymbols.slice(0, limit)) {
      try {
        const quoteData = await fetchWithFinnhub('quote', { symbol })
        
        if (quoteData && quoteData.c) {
          stockData.push({
            symbol: symbol,
            name: symbol,
            price: quoteData.c,
            change: quoteData.d,
            changePercent: quoteData.dp,
            marketCap: quoteData.c * 1000000,
            volume: quoteData.v || 0
          })
        }
      } catch (error) {
        console.warn(`Failed to fetch data for ${symbol}:`, error)
      }
    }
    
    if (stockData.length > 0) {
      console.log(`✅ Fetched ${stockData.length} live stocks from Finnhub`)
      return stockData
    }
    
    throw new Error('No stock data available. Please check your Finnhub API key.')
  } catch (error) {
    console.error('❌ Error fetching stock data:', error)
    throw new Error('Failed to fetch live stock data. Please check your Finnhub API key and internet connection.')
  }
}

// Get stock history
export async function getStockHistory(symbol: string, days: number = 30): Promise<any> {
  try {
    console.log(`🔄 Fetching ${days}-day history for ${symbol}...`)
    
    if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'demo') {
      throw new Error('Finnhub API key required for stock history data.')
    }
    
    const endDate = Math.floor(Date.now() / 1000)
    const startDate = endDate - (days * 24 * 60 * 60)
    
    const candleData = await fetchWithFinnhub('stock/candle', {
      symbol: symbol,
      resolution: 'D',
      from: startDate,
      to: endDate
    })
    
    if (candleData && candleData.s === 'ok' && candleData.t) {
      const prices = []
      for (let i = 0; i < candleData.t.length; i++) {
        prices.push([
          candleData.t[i] * 1000,
          candleData.c[i]
        ])
      }
      return { prices }
    }
    
    throw new Error('Invalid response from Finnhub API')
  } catch (error) {
    console.error('Error fetching stock history:', error)
    throw new Error(`Failed to fetch historical data for ${symbol}. Please check your Finnhub API key.`)
  }
}

// Remove or comment out getGlobalMarketData since Binance does not support it
// export async function getGlobalMarketData(): Promise<MarketData> {
//   try {
//     console.log('🔄 Fetching global market data from CoinGecko...')
    
//     const response = await fetchFromBinance(
//       'https://api.binance.com/api/v3/global'
//     )
    
//     if (response?.data) {
//       const globalData = response.data
//       return {
//         total_market_cap: globalData.total_market_cap?.usd || 0,
//         total_volume: globalData.total_volume?.usd || 0,
//         market_cap_change_percentage_24h_usd: globalData.market_cap_change_percentage_24h_usd || 0
//       }
//     }
    
//     throw new Error('Invalid response from Binance API')
//   } catch (error: any) {
//     console.error('❌ Error fetching global market data:', error)
//     throw new Error('Failed to fetch global market data. Please check your internet connection and try again.')
//   }
// } 

// Fetch top 50 crypto prices and stats from Binance with fallback
export async function getTopCryptoPrices(): Promise<{ symbol: string, price: number, priceChangePercent: number, marketCap: number, volume: number }[]> {
  try {
    const url = 'https://api.binance.com/api/v3/ticker/24hr'
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch crypto prices')
    const data = await response.json()
    
    // Check if Binance is restricted
    if (data.code === 0 && data.msg && data.msg.includes('restricted location')) {
      throw new Error('Binance API restricted in this location')
    }
    
    // Filter for USDT pairs and take top 50 by quoteVolume (market cap proxy)
    return data
      .filter((item: any) => item.symbol.endsWith('USDT'))
      .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 50)
      .map((item: any) => ({
        symbol: item.symbol,
        price: parseFloat(item.lastPrice),
        priceChangePercent: parseFloat(item.priceChangePercent),
        marketCap: parseFloat(item.quoteVolume), // Not true market cap, but best available
        volume: parseFloat(item.volume)
      }))
  } catch (error) {
    console.warn('Binance API unavailable, using mock data:', error)
    
    // Return mock data when Binance is not available
    const mockCryptos = [
      { symbol: 'BTCUSDT', price: 45000, priceChangePercent: 2.5, marketCap: 850000000000, volume: 25000000000 },
      { symbol: 'ETHUSDT', price: 3000, priceChangePercent: 1.8, marketCap: 350000000000, volume: 15000000000 },
      { symbol: 'BNBUSDT', price: 300, priceChangePercent: -0.5, marketCap: 50000000000, volume: 8000000000 },
      { symbol: 'ADAUSDT', price: 0.5, priceChangePercent: 3.2, marketCap: 25000000000, volume: 5000000000 },
      { symbol: 'SOLUSDT', price: 100, priceChangePercent: 5.1, marketCap: 40000000000, volume: 6000000000 },
      { symbol: 'DOTUSDT', price: 7, priceChangePercent: 1.2, marketCap: 8000000000, volume: 2000000000 },
      { symbol: 'LINKUSDT', price: 15, priceChangePercent: -1.5, marketCap: 8000000000, volume: 1500000000 },
      { symbol: 'LTCUSDT', price: 70, priceChangePercent: 0.8, marketCap: 5000000000, volume: 1000000000 },
      { symbol: 'BCHUSDT', price: 250, priceChangePercent: 2.1, marketCap: 5000000000, volume: 800000000 },
      { symbol: 'XLMUSDT', price: 0.1, priceChangePercent: 1.0, marketCap: 2000000000, volume: 500000000 }
    ]
    
    return mockCryptos
  }
}

// Fetch historical price data for a crypto symbol from Binance
export async function getCryptoHistory(symbol: string, interval: string = '1d', limit: number = 30): Promise<{ date: string, price: number }[]> {
  // Calculate appropriate limit based on interval
  let calculatedLimit = limit
  if (interval === '1m') calculatedLimit = 1440 // 24 hours * 60 minutes
  else if (interval === '5m') calculatedLimit = 288 // 24 hours * 12 (every 5 minutes)
  else if (interval === '15m') calculatedLimit = 96 // 24 hours * 4 (every 15 minutes)
  else if (interval === '30m') calculatedLimit = 48 // 24 hours * 2 (every 30 minutes)
  else if (interval === '1h') calculatedLimit = 24 // 24 hours
  else if (interval === '4h') calculatedLimit = 42 // 7 days * 6 (every 4 hours)
  else if (interval === '1d') calculatedLimit = 7 // 7 days
  else if (interval === '1w') calculatedLimit = 52 // 52 weeks (1 year)
  
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${calculatedLimit}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch crypto history')
  const data = await response.json()
  
  // Each kline: [openTime, open, high, low, close, volume, closeTime, ...]
  return data.map((item: any) => ({
    date: new Date(item[0]).toISOString().split('T')[0] + ' ' + new Date(item[0]).toTimeString().split(' ')[0],
    price: parseFloat(item[4]) // close price
  }))
}

// Remove getTopStockPrices from here; move Finnhub logic to /api/stock API route for server-side execution 
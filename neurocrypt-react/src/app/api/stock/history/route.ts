import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const days = searchParams.get('days') || '30'

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    // First get current quote to use as base price
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    
    const quoteResponse = await fetch(quoteUrl)
    if (!quoteResponse.ok) {
      // Return simulated data even if Finnhub fails
      const currentPrice = 100 // Default price
      const prices = []
      const now = Date.now()
      const numDays = parseInt(days)
      
      // Generate data points based on time frame
      let dataPoints = 24 // Default for 1 day
      if (numDays === 1) dataPoints = 24 // 1 hour intervals for 1 day
      else if (numDays === 3) dataPoints = 18 // 4 hour intervals for 3 days
      else if (numDays === 7) dataPoints = 14 // 12 hour intervals for 7 days
      else if (numDays === 30) dataPoints = 30 // Daily intervals for 30 days
      else if (numDays === 90) dataPoints = 45 // Every 2 days for 90 days
      else if (numDays === 180) dataPoints = 60 // Every 3 days for 180 days
      
      for (let i = 0; i < dataPoints; i++) {
        const timeOffset = (numDays * 24 * 60 * 60 * 1000) * (i / (dataPoints - 1))
        const date = new Date(now - timeOffset)
        const timestamp = date.getTime()
        
        // Create realistic price movement with some volatility
        const volatility = 0.02 // 2% volatility
        const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2
        const trend = 1 + (Math.random() - 0.5) * 0.1 // Slight trend
        const price = currentPrice * randomFactor * trend
        
        prices.push([timestamp, Math.round(price * 100) / 100]) // Round to 2 decimal places
      }
      
      return NextResponse.json({ prices })
    }
    
    const quoteData = await quoteResponse.json()
    
    if (!quoteData.c) {
      // Return simulated data even if no current price
      const currentPrice = 100 // Default price
      const prices = []
      const now = Date.now()
      const numDays = parseInt(days)
      
      // Generate data points based on time frame
      let dataPoints = 24 // Default for 1 day
      if (numDays === 1) dataPoints = 24 // 1 hour intervals for 1 day
      else if (numDays === 3) dataPoints = 18 // 4 hour intervals for 3 days
      else if (numDays === 7) dataPoints = 14 // 12 hour intervals for 7 days
      else if (numDays === 30) dataPoints = 30 // Daily intervals for 30 days
      else if (numDays === 90) dataPoints = 45 // Every 2 days for 90 days
      else if (numDays === 180) dataPoints = 60 // Every 3 days for 180 days
      
      for (let i = 0; i < dataPoints; i++) {
        const timeOffset = (numDays * 24 * 60 * 60 * 1000) * (i / (dataPoints - 1))
        const date = new Date(now - timeOffset)
        const timestamp = date.getTime()
        
        // Create realistic price movement with some volatility
        const volatility = 0.02 // 2% volatility
        const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2
        const trend = 1 + (Math.random() - 0.5) * 0.1 // Slight trend
        const price = currentPrice * randomFactor * trend
        
        prices.push([timestamp, Math.round(price * 100) / 100]) // Round to 2 decimal places
      }
      
      return NextResponse.json({ prices })
    }
    
    // Generate simulated historical data based on current price
    const currentPrice = quoteData.c
    const prices = []
    const now = Date.now()
    const numDays = parseInt(days)
    
    // Generate data points based on time frame
    let dataPoints = 24 // Default for 1 day
    if (numDays === 1) dataPoints = 24 // 1 hour intervals for 1 day
    else if (numDays === 3) dataPoints = 18 // 4 hour intervals for 3 days
    else if (numDays === 7) dataPoints = 14 // 12 hour intervals for 7 days
    else if (numDays === 30) dataPoints = 30 // Daily intervals for 30 days
    else if (numDays === 90) dataPoints = 45 // Every 2 days for 90 days
    else if (numDays === 180) dataPoints = 60 // Every 3 days for 180 days
    
    for (let i = 0; i < dataPoints; i++) {
      const timeOffset = (numDays * 24 * 60 * 60 * 1000) * (i / (dataPoints - 1))
      const date = new Date(now - timeOffset)
      const timestamp = date.getTime()
      
      // Create realistic price movement with some volatility
      const volatility = Math.abs(quoteData.dp || 2) / 100 // Use price change percent as volatility
      const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2
      const trend = 1 + (Math.random() - 0.5) * 0.1 // Slight trend
      const price = currentPrice * randomFactor * trend
      
      prices.push([timestamp, Math.round(price * 100) / 100]) // Round to 2 decimal places
    }
    
    return NextResponse.json({ prices })
    
  } catch (error) {
    console.error('Error generating stock history:', error)
    return NextResponse.json({ error: 'Failed to generate stock history' }, { status: 500 })
  }
} 
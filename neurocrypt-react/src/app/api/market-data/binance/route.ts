import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path')
    if (!path || !path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Missing or invalid path parameter' }, { status: 400 })
    }
    // Build Binance URL
    const binanceUrl = new URL(`https://api.binance.com${path}`)
    // Forward all query params except 'path'
    searchParams.forEach((value, key) => {
      if (key !== 'path') binanceUrl.searchParams.append(key, value)
    })
    // Fetch from Binance
    const response = await axios.get(binanceUrl.toString(), {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NeuroCrypt/1.0',
        'Cache-Control': 'no-cache',
      },
    })
    return NextResponse.json(response.data)
  } catch (error: any) {
    const status = error.response?.status || 500
    const message = error.response?.data || error.message || 'Unknown error'
    return NextResponse.json({ error: message }, { status })
  }
} 
import { NextRequest, NextResponse } from 'next/server'

const topSymbols = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
  'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'BAC'
]

export async function GET(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json([], { status: 200 })
  }
  // Determine if US market is open (9:30am-4:00pm ET, Mon-Fri, not a holiday) - using Pakistani time
  const now = new Date()
  // Convert to US Eastern Time (Pakistan is UTC+5, US ET is UTC-5 in winter, UTC-4 in summer)
  // So Pakistan is 10 hours ahead of US ET in winter, 9 hours in summer
  const nowET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = nowET.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const hour = nowET.getHours()
  const minute = nowET.getMinutes()
  // Market open: Mon-Fri, 9:30am-4:00pm ET
  // In Pakistani time: 7:30pm-2:00am next day (winter) or 6:30pm-1:00am next day (summer)
  const isWeekday = day >= 1 && day <= 5
  const afterOpen = hour > 9 || (hour === 9 && minute >= 30)
  const beforeClose = hour < 16
  const marketOpen = isWeekday && afterOpen && beforeClose
  // TODO: Optionally add US market holidays check for even more accuracy
  const results: any[] = []
  for (const symbol of topSymbols) {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      if (data.c) {
        results.push({
          symbol,
          price: data.c,
          priceChange: data.d,
          priceChangePercent: data.dp,
          high: data.h,
          low: data.l,
          open: data.o,
          prevClose: data.pc,
          marketOpen,
          volume: data.v || null // Finnhub free tier may not always provide volume
        })
      }
    } catch {}
  }
  return NextResponse.json(results)
} 
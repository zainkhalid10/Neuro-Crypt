# API Setup Guide

## Getting Live Stock Data

To get live stock data, you need to set up a Finnhub API key:

### 1. Get Your Free API Key

1. Go to [https://finnhub.io/](https://finnhub.io/)
2. Click "Get free API key"
3. Sign up for a free account
4. Copy your API key from the dashboard

### 2. Add API Key to Environment

Create a file called `.env.local` in the `neurocrypt-react` folder with this content:

```bash
NEXT_PUBLIC_FINNHUB_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your real Finnhub API key.

### 3. Restart the Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

### 4. Verify It's Working

- Go to the Market Data page
- Switch to the "Stocks" tab
- You should see live stock data instead of error messages

## Current Status

✅ **Cryptocurrencies**: Live data (no API key needed)  
⚠️ **Stocks**: Requires Finnhub API key  
✅ **Charts**: Live data (no API key needed)  
✅ **Global stats**: Live data (no API key needed)  

## Troubleshooting

If you still see the error message:
1. Make sure the `.env.local` file is in the correct location
2. Check that your API key is correct
3. Restart the development server
4. Clear your browser cache

## Free Tier Limits

Finnhub free tier includes:
- 60 API calls per minute
- Real-time stock data
- Historical data
- Company information 
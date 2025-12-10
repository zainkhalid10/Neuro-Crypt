import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from datetime import datetime, timedelta
import time
import yfinance as yf
from utils.data_fetcher import get_historical_data

def show_crypto_chart(crypto_id, days=30, chart_type='line', refresh_interval=60):
    """
    Show a live crypto chart using CoinGecko data. Auto-refreshes every refresh_interval seconds.
    """
    placeholder = st.empty()
    last_update = time.time()
    while True:
        with placeholder.container():
            historical = get_historical_data(crypto_id, days)
            if not historical:
                st.warning("Unable to fetch crypto data.")
                break
            prices = [point[1] for point in historical['prices']]
            dates = [datetime.fromtimestamp(point[0]/1000) for point in historical['prices']]
            if chart_type == 'candlestick' and len(prices) >= 4:
                # Generate OHLC from price series (mock, as CoinGecko doesn't provide OHLC)
                df = pd.DataFrame({'Date': dates, 'Open': prices, 'High': prices, 'Low': prices, 'Close': prices})
                fig = go.Figure(data=[go.Candlestick(x=df['Date'], open=df['Open'], high=df['High'], low=df['Low'], close=df['Close'])])
            else:
                fig = go.Figure()
                fig.add_trace(go.Scatter(x=dates, y=prices, mode='lines', name='Price', line=dict(color='#FF6B35', width=2)))
            fig.update_layout(
                title=f"{crypto_id.title()} Price Chart",
                xaxis_title="Date",
                yaxis_title="Price (USD)",
                height=400,
                plot_bgcolor='#18191A',
                paper_bgcolor='#18191A',
                font=dict(color='#fff'),
            )
            st.plotly_chart(fig, use_container_width=True)
            st.caption(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        # Auto-refresh
        if time.time() - last_update > refresh_interval:
            last_update = time.time()
            continue
        else:
            break

def show_stock_chart(symbol, period='1mo', interval='1d', chart_type='candlestick', refresh_interval=60):
    """
    Show a live stock chart using yfinance. Auto-refreshes every refresh_interval seconds.
    """
    placeholder = st.empty()
    last_update = time.time()
    while True:
        with placeholder.container():
            df = yf.download(symbol, period=period, interval=interval, progress=False)
            if df.empty:
                st.warning("Unable to fetch stock data.")
                break
            if chart_type == 'candlestick' and len(df) >= 4:
                fig = go.Figure(data=[go.Candlestick(x=df.index, open=df['Open'], high=df['High'], low=df['Low'], close=df['Close'])])
            else:
                fig = go.Figure()
                fig.add_trace(go.Scatter(x=df.index, y=df['Close'], mode='lines', name='Close', line=dict(color='#FF6B35', width=2)))
            fig.update_layout(
                title=f"{symbol.upper()} Stock Chart",
                xaxis_title="Date",
                yaxis_title="Price (USD)",
                height=400,
                plot_bgcolor='#18191A',
                paper_bgcolor='#18191A',
                font=dict(color='#fff'),
            )
            st.plotly_chart(fig, use_container_width=True)
            st.caption(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        # Auto-refresh
        if time.time() - last_update > refresh_interval:
            last_update = time.time()
            continue
        else:
            break 
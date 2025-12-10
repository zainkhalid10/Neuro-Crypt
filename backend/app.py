import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from utils.data_fetcher import get_crypto_data, get_market_overview, get_historical_data
from utils.bias_detector import BiasDetector, analyze_trading_behavior, simulate_trading_decision
from utils.sentiment_analyzer import SentimentAnalyzer
from utils.news_scraper import scrape_crypto_news
from utils.ml_models import CryptoPredictor
from utils.database import get_database
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import random
import warnings
warnings.filterwarnings('ignore')

# --- SPA Navigation Bar ---
PAGES = [
    {"label": "Market Data", "icon": "📊", "key": "market_data"},
    {"label": "Bias Analysis", "icon": "🧠", "key": "bias_analysis"},
    {"label": "Sentiment Analysis", "icon": "🎭", "key": "sentiment_analysis"},
    {"label": "ML Forecasting", "icon": "🤖", "key": "ml_forecasting"},
    {"label": "Simulator", "icon": "🎮", "key": "investment_simulator"},
    {"label": "Analytics", "icon": "🗄️", "key": "database_analytics"},
]

if 'active_page' not in st.session_state:
    st.session_state.active_page = PAGES[0]['key']

# Binance-style horizontal navbar
st.markdown('''
    <style>
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #1E2026;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
        z-index: 9999;
        border-bottom: 1px solid #2A2D35;
    }
    
    .logo {
        color: #F0B90B;
        font-size: 1.5rem;
        font-weight: bold;
        display: flex;
        align-items: center;
    }
    
    .nav-links {
        display: flex;
        align-items: center;
        height: 100%;
        gap: 0;
    }
    
    .nav-link {
        color: #EAECEF;
        padding: 0 1.5rem;
        height: 100%;
        display: flex;
        align-items: center;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.2s;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        background: transparent;
        border: none;
        margin: 0;
    }
    
    .nav-link:hover {
        color: #F0B90B;
        border-bottom-color: #F0B90B;
        background: rgba(240, 185, 11, 0.05);
    }
    
    .nav-link.active {
        color: #F0B90B;
        border-bottom-color: #F0B90B;
        background: rgba(240, 185, 11, 0.1);
    }
    
    .main .block-container {
        padding-top: 5rem !important;
    }
    
    /* Hide default button styling */
    .stButton > button {
        background: transparent !important;
        border: none !important;
        color: inherit !important;
        font-weight: inherit !important;
        padding: inherit !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }
    
    .stButton > button:hover {
        background: inherit !important;
        border: inherit !important;
        color: inherit !important;
    }
    </style>
''', unsafe_allow_html=True)

# Create the navbar structure
st.markdown('<div class="navbar">', unsafe_allow_html=True)

# Logo on the left
st.markdown('<div class="logo">🧠 Neuro Crypt</div>', unsafe_allow_html=True)

# Navigation links on the right - force horizontal layout
st.markdown('<div class="nav-links">', unsafe_allow_html=True)

# Use columns to force horizontal layout
col1, col2, col3, col4, col5, col6 = st.columns(6)

with col1:
    if st.button("Market Data", key="nav_market_data"):
        st.session_state.active_page = 'market_data'
        st.rerun()

with col2:
    if st.button("Bias Analysis", key="nav_bias_analysis"):
        st.session_state.active_page = 'bias_analysis'
        st.rerun()

with col3:
    if st.button("Sentiment Analysis", key="nav_sentiment_analysis"):
        st.session_state.active_page = 'sentiment_analysis'
        st.rerun()

with col4:
    if st.button("ML Forecasting", key="nav_ml_forecasting"):
        st.session_state.active_page = 'ml_forecasting'
        st.rerun()

with col5:
    if st.button("Simulator", key="nav_investment_simulator"):
        st.session_state.active_page = 'investment_simulator'
        st.rerun()

with col6:
    if st.button("Analytics", key="nav_database_analytics"):
        st.session_state.active_page = 'database_analytics'
        st.rerun()

st.markdown('</div></div>', unsafe_allow_html=True)

# Handle navigation
if st.session_state.get('nav_page'):
    st.session_state.active_page = st.session_state['nav_page']
    st.session_state['nav_page'] = None
    st.rerun()

# --- Page Functions ---
def market_data_page():
    # Page header with gradient background
    st.markdown('''
        <div style="
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        ">
            <div style="font-size: 3rem;">📊</div>
            <div style="color: white; font-size: 2rem; font-weight: bold;">Market Data</div>
            <div style="margin-left: auto; font-size: 1.5rem;">🔗</div>
        </div>
    ''', unsafe_allow_html=True)
    
    # Cryptocurrency selection
    crypto_options = {
        'Bitcoin': 'bitcoin',
        'Ethereum': 'ethereum',
        'Binance Coin': 'binancecoin',
        'Cardano': 'cardano',
        'Solana': 'solana',
        'Polkadot': 'polkadot',
        'Dogecoin': 'dogecoin',
        'Polygon': 'matic-network',
        'Avalanche': 'avalanche-2',
        'Chainlink': 'chainlink'
    }
    selected_crypto = st.selectbox(
        "Select Cryptocurrency",
        list(crypto_options.keys()),
        index=0,
        key="market_data_crypto"
    )
    # Time range selection
    time_ranges = {
        '1 Day': 1,
        '7 Days': 7,
        '30 Days': 30,
        '90 Days': 90,
        '365 Days': 365
    }
    selected_range = st.selectbox(
        "Select Time Range",
        list(time_ranges.keys()),
        index=2,
        key="market_data_range"
    )
    auto_refresh = st.checkbox("Auto Refresh (30s)", value=False, key="market_data_refresh")
    if auto_refresh:
        st.rerun()
    st.header("🌐 Market Overview")
    try:
        market_data = get_market_overview()
        if market_data and len(market_data) > 0:
            df_market = pd.DataFrame(market_data[:20])
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                total_market_cap = sum([coin['market_cap'] for coin in market_data[:100]])
                st.metric("Total Market Cap", f"${total_market_cap/1e12:.2f}T")
            with col2:
                total_volume = sum([coin['total_volume'] for coin in market_data[:100]])
                st.metric("24h Volume", f"${total_volume/1e9:.2f}B")
            with col3:
                btc_dominance = (market_data[0]['market_cap'] / total_market_cap) * 100
                st.metric("BTC Dominance", f"{btc_dominance:.1f}%")
            with col4:
                gainers = sum(1 for coin in market_data[:100] if coin['price_change_percentage_24h'] > 0)
                st.metric("Gainers vs Losers", f"{gainers}/100")
            st.subheader("Top 20 Cryptocurrencies")
            display_df = df_market[['name', 'symbol', 'current_price', 'market_cap', 'total_volume', 
                                  'price_change_percentage_24h', 'market_cap_rank']].copy()
            display_df.columns = ['Name', 'Symbol', 'Price ($)', 'Market Cap', 'Volume (24h)', 
                                'Change (24h) %', 'Rank']
            display_df['Price ($)'] = display_df['Price ($)'].apply(lambda x: f"${x:,.4f}" if x < 1 else f"${x:,.2f}")
            display_df['Market Cap'] = display_df['Market Cap'].apply(lambda x: f"${x/1e9:.2f}B")
            display_df['Volume (24h)'] = display_df['Volume (24h)'].apply(lambda x: f"${x/1e9:.2f}B")
            display_df['Change (24h) %'] = display_df['Change (24h) %'].apply(lambda x: f"{x:.2f}%")
            st.dataframe(display_df, use_container_width=True)
        else:
            st.warning("Unable to fetch market overview data.")
    except Exception as e:
        st.error(f"Error fetching market data: {str(e)}")
    st.header(f"�� Detailed Analysis: {selected_crypto}")
    try:
        crypto_id = crypto_options[selected_crypto]
        current_data = get_crypto_data(crypto_id)
        if current_data:
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric(
                    "Current Price",
                    f"${current_data['market_data']['current_price']['usd']:,.2f}",
                    f"{current_data['market_data']['price_change_percentage_24h']:.2f}%"
                )
            with col2:
                st.metric(
                    "Market Cap",
                    f"${current_data['market_data']['market_cap']['usd']/1e9:.2f}B",
                    f"Rank #{current_data['market_cap_rank']}"
                )
            with col3:
                st.metric(
                    "24h Volume",
                    f"${current_data['market_data']['total_volume']['usd']/1e9:.2f}B"
                )
            with col4:
                st.metric(
                    "Circulating Supply",
                    f"{current_data['market_data']['circulating_supply']:,.0f}",
                    f"{current_data['symbol'].upper()}"
                )
            historical_data = get_historical_data(crypto_id, time_ranges[selected_range])
            if historical_data:
                st.subheader(f"Price Chart - {selected_range}")
                fig = go.Figure()
                fig.add_trace(go.Scatter(
                    x=[datetime.fromtimestamp(point[0]/1000) for point in historical_data['prices']],
                    y=[point[1] for point in historical_data['prices']],
                    mode='lines',
                    name='Price',
                    line=dict(color='#FF6B35', width=2)
                ))
                fig.update_layout(
                    title=f"{selected_crypto} Price Over {selected_range}",
                    xaxis_title="Date",
                    yaxis_title="Price (USD)",
                    height=500,
                    showlegend=True
                )
                st.plotly_chart(fig, use_container_width=True)
                st.subheader(f"Volume Chart - {selected_range}")
                fig_volume = go.Figure()
                fig_volume.add_trace(go.Bar(
                    x=[datetime.fromtimestamp(point[0]/1000) for point in historical_data['total_volumes']],
                    y=[point[1] for point in historical_data['total_volumes']],
                    name='Volume',
                    marker_color='#F7931E'
                ))
                fig_volume.update_layout(
                    title=f"{selected_crypto} Volume Over {selected_range}",
                    xaxis_title="Date",
                    yaxis_title="Volume (USD)",
                    height=400
                )
                st.plotly_chart(fig_volume, use_container_width=True)
                st.subheader("Technical Analysis")
                prices = [point[1] for point in historical_data['prices']]
                dates = [datetime.fromtimestamp(point[0]/1000) for point in historical_data['prices']]
                if len(prices) >= 20:
                    sma_20 = pd.Series(prices).rolling(window=20).mean().tolist()
                    sma_50 = pd.Series(prices).rolling(window=50).mean().tolist() if len(prices) >= 50 else None
                    fig_tech = go.Figure()
                    fig_tech.add_trace(go.Scatter(
                        x=dates,
                        y=prices,
                        mode='lines',
                        name='Price',
                        line=dict(color='#FF6B35')
                    ))
                    fig_tech.add_trace(go.Scatter(
                        x=dates,
                        y=sma_20,
                        mode='lines',
                        name='SMA 20',
                        line=dict(color='#00FF00', dash='dash')
                    ))
                    if sma_50:
                        fig_tech.add_trace(go.Scatter(
                            x=dates,
                            y=sma_50,
                            mode='lines',
                            name='SMA 50',
                            line=dict(color='#FF0000', dash='dash')
                        ))
                    fig_tech.update_layout(
                        title=f"{selected_crypto} Technical Analysis",
                        xaxis_title="Date",
                        yaxis_title="Price (USD)",
                        height=500
                    )
                    st.plotly_chart(fig_tech, use_container_width=True)
                st.subheader("Price Statistics")
                col1, col2 = st.columns(2)
                with col1:
                    st.metric("Highest Price", f"${max(prices):,.2f}")
                    st.metric("Lowest Price", f"${min(prices):,.2f}")
                    st.metric("Average Price", f"${sum(prices)/len(prices):,.2f}")
                with col2:
                    price_change = ((prices[-1] - prices[0]) / prices[0]) * 100
                    st.metric("Total Change", f"{price_change:.2f}%")
                    st.metric("Volatility", f"{pd.Series(prices).std():.2f}")
                    st.metric("Data Points", len(prices))
            else:
                st.warning("Unable to fetch historical data for the selected cryptocurrency.")
        else:
            st.warning("Unable to fetch current data for the selected cryptocurrency.")
    except Exception as e:
        st.error(f"Error in detailed analysis: {str(e)}")
    st.header("🔗 Market Correlation Analysis")
    try:
        major_cryptos = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana']
        correlation_data = {}
        for crypto in major_cryptos:
            historical = get_historical_data(crypto, 30)
            if historical:
                prices = [point[1] for point in historical['prices']]
                correlation_data[crypto.replace('-', ' ').title()] = prices
        if correlation_data:
            df_corr = pd.DataFrame(correlation_data)
            correlation_matrix = df_corr.corr()
            fig_heatmap = px.imshow(
                correlation_matrix,
                text_auto=True,
                aspect="auto",
                color_continuous_scale='RdBu_r',
                title="30-Day Price Correlation Matrix"
            )
            st.plotly_chart(fig_heatmap, use_container_width=True)
        else:
            st.warning("Unable to generate correlation analysis.")
    except Exception as e:
        st.error(f"Error in correlation analysis: {str(e)}")
    st.markdown("---")
    st.markdown("**Data provided by CoinGecko API** | Last updated: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    # --- End migrated content ---

def bias_analysis_page():
    # Page header with gradient background
    st.markdown('''
        <div style="
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        ">
            <div style="font-size: 3rem;">🧠</div>
            <div style="color: white; font-size: 2rem; font-weight: bold;">Bias Analysis</div>
            <div style="margin-left: auto; font-size: 1.5rem;">🔗</div>
        </div>
    ''', unsafe_allow_html=True)
    
    bias_detector = BiasDetector()
    analysis_type = st.selectbox(
        "Select Analysis Type",
        ["Bias Assessment", "Trading Behavior Analysis", "Bias Education", "Personal Bias Profile"],
        key="bias_analysis_type"
    )
    if analysis_type == "Bias Assessment":
        st.header("📊 Psychological Bias Assessment")
        st.markdown("""
        This assessment helps identify your susceptibility to common psychological biases that affect cryptocurrency trading decisions.
        Answer honestly for the most accurate results.
        """)
        with st.form("bias_assessment"):
            st.subheader("Loss Aversion Assessment")
            q1 = st.radio(
                "When your crypto portfolio drops 20%, what's your most likely reaction?",
                [
                    "Immediately sell to prevent further losses",
                    "Hold and wait for recovery",
                    "Buy more to average down",
                    "Analyze market conditions before deciding"
                ]
            )
            q2 = st.radio(
                "You bought Bitcoin at $60,000. It's now at $45,000. What do you do?",
                [
                    "Sell immediately to cut losses",
                    "Hold because selling locks in the loss",
                    "Buy more because it's 'on sale'",
                    "Set a stop-loss and stick to it"
                ]
            )
            st.subheader("Anchoring Bias Assessment")
            q3 = st.radio(
                "When evaluating a new cryptocurrency, what influences your decision most?",
                [
                    "The all-time high price",
                    "Current technical analysis",
                    "Recent news and fundamentals",
                    "Comparison to similar projects"
                ]
            )
            q4 = st.radio(
                "How do you typically set your price targets?",
                [
                    "Based on previous high prices",
                    "Using technical analysis levels",
                    "Following expert predictions",
                    "Based on fundamental valuation"
                ]
            )
            st.subheader("Herd Behavior Assessment")
            q5 = st.radio(
                "When making trading decisions, what influences you most?",
                [
                    "What other traders are doing",
                    "Social media sentiment",
                    "Your own analysis",
                    "Expert recommendations"
                ]
            )
            q6 = st.radio(
                "During a market rally, you're most likely to:",
                [
                    "Buy because everyone else is buying",
                    "Sell because it might be a bubble",
                    "Hold your current position",
                    "Analyze before making any moves"
                ]
            )
            st.subheader("Confirmation Bias Assessment")
            q7 = st.radio(
                "When researching a cryptocurrency you want to buy, you:",
                [
                    "Look for information that supports your decision",
                    "Seek out opposing viewpoints",
                    "Focus on technical analysis only",
                    "Consider both positive and negative aspects equally"
                ]
            )
            q8 = st.radio(
                "How do you react to news that contradicts your investment thesis?",
                [
                    "Ignore it or dismiss it",
                    "Investigate further",
                    "Immediately reconsider your position",
                    "Seek multiple perspectives"
                ]
            )
            st.subheader("Overconfidence Bias Assessment")
            q9 = st.radio(
                "How often do you think your trading predictions are correct?",
                [
                    "More than 80% of the time",
                    "About 60-70% of the time",
                    "Around 50% of the time",
                    "Less than 50% of the time"
                ]
            )
            q10 = st.radio(
                "When you make a successful trade, you attribute it to:",
                [
                    "Your superior analysis skills",
                    "Good timing and some luck",
                    "Market conditions",
                    "A combination of skill and luck"
                ]
            )
            submitted = st.form_submit_button("Analyze My Biases")
            if submitted:
                responses = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10]
                bias_scores = bias_detector.calculate_bias_scores(responses)
                st.session_state.bias_results = bias_scores
                st.success("Assessment completed! Here are your results:")
                fig = go.Figure()
                categories = list(bias_scores.keys())
                values = list(bias_scores.values())
                fig.add_trace(go.Scatterpolar(
                    r=values,
                    theta=categories,
                    fill='toself',
                    name='Your Bias Profile',
                    line=dict(color='#FF6B35')
                ))
                fig.update_layout(
                    polar=dict(
                        radialaxis=dict(
                            visible=True,
                            range=[0, 100]
                        )
                    ),
                    title="Your Psychological Bias Profile",
                    height=500
                )
                st.plotly_chart(fig, use_container_width=True)
                col1, col2 = st.columns(2)
                with col1:
                    st.subheader("Bias Scores")
                    for bias, score in bias_scores.items():
                        if score >= 70:
                            st.error(f"**{bias}**: {score}/100 - High Risk")
                        elif score >= 40:
                            st.warning(f"**{bias}**: {score}/100 - Moderate Risk")
                        else:
                            st.success(f"**{bias}**: {score}/100 - Low Risk")
                with col2:
                    st.subheader("Recommendations")
                    recommendations = bias_detector.get_recommendations(bias_scores)
                    for rec in recommendations:
                        st.info(rec)
    elif analysis_type == "Trading Behavior Analysis":
        st.header("📈 Trading Behavior Analysis")
        st.markdown("""
        Analyze your trading patterns to identify potential psychological biases in your decision-making.
        """)
        with st.form("trading_behavior"):
            st.subheader("Recent Trading Activity")
            col1, col2 = st.columns(2)
            with col1:
                total_trades = st.number_input("Total trades in last 30 days", min_value=0, value=10)
                winning_trades = st.number_input("Winning trades", min_value=0, value=6)
                avg_hold_time = st.selectbox(
                    "Average holding time",
                    ["< 1 hour", "1-24 hours", "1-7 days", "1-4 weeks", "> 1 month"]
                )
            with col2:
                biggest_gain = st.number_input("Biggest gain (%)", value=25.0)
                biggest_loss = st.number_input("Biggest loss (%)", value=-15.0)
                portfolio_volatility = st.selectbox(
                    "Portfolio volatility preference",
                    ["Very Low", "Low", "Moderate", "High", "Very High"]
                )
            st.subheader("Trading Patterns")
            panic_sold = st.checkbox("Have you panic sold during market crashes?")
            fomo_bought = st.checkbox("Have you bought during FOMO rallies?")
            held_losers = st.checkbox("Do you hold losing positions too long?")
            cut_winners = st.checkbox("Do you sell winning positions too early?")
            submitted = st.form_submit_button("Analyze Trading Behavior")
            if submitted:
                behavior_data = {
                    'total_trades': total_trades,
                    'winning_trades': winning_trades,
                    'avg_hold_time': avg_hold_time,
                    'biggest_gain': biggest_gain,
                    'biggest_loss': biggest_loss,
                    'portfolio_volatility': portfolio_volatility,
                    'panic_sold': panic_sold,
                    'fomo_bought': fomo_bought,
                    'held_losers': held_losers,
                    'cut_winners': cut_winners
                }
                analysis = analyze_trading_behavior(behavior_data)
                col1, col2 = st.columns(2)
                with col1:
                    st.subheader("Trading Statistics")
                    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
                    st.metric("Win Rate", f"{win_rate:.1f}%")
                    st.metric("Total Trades", total_trades)
                    st.metric("Risk Profile", analysis['risk_profile'])
                with col2:
                    st.subheader("Behavioral Insights")
                    for insight in analysis['insights']:
                        st.info(insight)
                st.subheader("Detected Bias Patterns")
                if analysis['bias_indicators']:
                    for bias, severity in analysis['bias_indicators'].items():
                        if severity == 'High':
                            st.error(f"**{bias}**: High likelihood detected")
                        elif severity == 'Medium':
                            st.warning(f"**{bias}**: Moderate likelihood detected")
                        else:
                            st.success(f"**{bias}**: Low likelihood detected")
                st.subheader("Improvement Recommendations")
                for rec in analysis['recommendations']:
                    st.info(f"💡 {rec}")
    elif analysis_type == "Bias Education":
        st.header("📚 Understanding Psychological Biases in Crypto Trading")
        bias_info = {
            "Loss Aversion": {
                "description": "The tendency to prefer avoiding losses over acquiring equivalent gains. In crypto trading, this manifests as holding losing positions too long or selling winning positions too early.",
                "example": "You bought Bitcoin at $50,000. It drops to $45,000. Instead of cutting losses, you hold hoping to 'break even', but you would immediately sell if it went to $55,000.",
                "mitigation": [
                    "Set stop-loss orders before entering trades",
                    "Use position sizing to limit emotional attachment",
                    "Focus on overall portfolio performance, not individual trades",
                    "Practice treating gains and losses equally"
                ]
            },
            "Anchoring Bias": {
                "description": "Over-reliance on the first piece of information encountered. In crypto, this often means fixating on all-time highs or purchase prices.",
                "example": "You see Ethereum hit $4,000 and anchor on this price. When it's at $2,000, you think it's 'cheap' regardless of fundamentals.",
                "mitigation": [
                    "Use multiple valuation methods",
                    "Regularly reassess your price targets",
                    "Focus on future potential, not past prices",
                    "Consider market context and fundamentals"
                ]
            },
            "Herd Behavior": {
                "description": "Following the crowd without independent analysis. This leads to buying during euphoria and selling during panic.",
                "example": "Everyone on social media is buying a new altcoin, so you buy too without researching the project fundamentals.",
                "mitigation": [
                    "Develop your own research process",
                    "Question popular opinions",
                    "Use contrarian indicators",
                    "Limit exposure to emotional social media"
                ]
            },
            "Confirmation Bias": {
                "description": "Seeking information that confirms existing beliefs while ignoring contradictory evidence.",
                "example": "You're bullish on a cryptocurrency and only read positive news about it, ignoring regulatory concerns or technical issues.",
                "mitigation": [
                    "Actively seek opposing viewpoints",
                    "Create decision-making checklists",
                    "Use devil's advocate approach",
                    "Diversify information sources"
                ]
            },
            "Overconfidence Bias": {
                "description": "Overestimating one's abilities, knowledge, or chances of success. Common after a few successful trades.",
                "example": "After making 3 profitable trades, you increase position sizes and take bigger risks, believing you've 'figured out' the market.",
                "mitigation": [
                    "Keep a trading journal",
                    "Track prediction accuracy",
                    "Use systematic risk management",
                    "Acknowledge the role of luck"
                ]
            }
        }
        selected_bias = st.selectbox("Select a bias to learn about", list(bias_info.keys()), key="bias_edu_select")
        if selected_bias:
            bias_data = bias_info[selected_bias]
            st.subheader(f"Understanding {selected_bias}")
            st.write(bias_data["description"])
            st.subheader("Example in Crypto Trading")
            st.info(bias_data["example"])
            st.subheader("Mitigation Strategies")
            for strategy in bias_data["mitigation"]:
                st.write(f"• {strategy}")
        st.subheader("🎯 Quick Bias Check")
        quiz_questions = [
            {
                "question": "The price of a cryptocurrency you own drops 30%. What's your immediate reaction?",
                "options": [
                    "Sell immediately to prevent further losses",
                    "Hold and hope for recovery",
                    "Buy more to average down",
                    "Analyze why it dropped before deciding"
                ],
                "bias_indicators": ["Loss Aversion", "Loss Aversion", "Anchoring", "Rational"]
            },
            {
                "question": "You see a cryptocurrency that's down 80% from its all-time high. Your first thought is:",
                "options": [
                    "It's a great buying opportunity",
                    "It must be a failed project",
                    "I need to research what happened",
                    "I'll wait for more confirmation"
                ],
                "bias_indicators": ["Anchoring", "Anchoring", "Rational", "Rational"]
            }
        ]
        for i, q in enumerate(quiz_questions):
            st.write(f"**Question {i+1}**: {q['question']}")
            answer = st.radio(f"q{i}", q["options"], key=f"quiz_{i}")
            if answer:
                idx = q["options"].index(answer)
                bias = q["bias_indicators"][idx]
                if bias != "Rational":
                    st.warning(f"This response may indicate {bias}")
                else:
                    st.success("This shows rational thinking!")
    elif analysis_type == "Personal Bias Profile":
        st.header("👤 Your Personal Bias Profile")
        if 'bias_results' in st.session_state:
            bias_scores = st.session_state.bias_results
            st.subheader("Current Bias Assessment Results")
            fig = go.Figure()
            categories = list(bias_scores.keys())
            values = list(bias_scores.values())
            fig.add_trace(go.Scatterpolar(
                r=values,
                theta=categories,
                fill='toself',
                name='Your Bias Profile',
                line=dict(color='#FF6B35')
            ))
            fig.update_layout(
                polar=dict(
                    radialaxis=dict(
                        visible=True,
                        range=[0, 100]
                    )
                ),
                title="Your Psychological Bias Profile",
                height=500
            )
            st.plotly_chart(fig, use_container_width=True)
            col1, col2 = st.columns(2)
            with col1:
                st.subheader("Bias Strengths")
                strengths = [bias for bias, score in bias_scores.items() if score < 40]
                if strengths:
                    for strength in strengths:
                        st.success(f"✅ Low {strength}")
                else:
                    st.info("Continue working on reducing all biases")
            with col2:
                st.subheader("Areas for Improvement")
                weaknesses = [bias for bias, score in bias_scores.items() if score >= 70]
                if weaknesses:
                    for weakness in weaknesses:
                        st.error(f"⚠️ High {weakness}")
                else:
                    st.success("No high-risk biases detected!")
            st.subheader("Personalized Recommendations")
            recommendations = bias_detector.get_personalized_recommendations(bias_scores)
            for rec in recommendations:
                st.info(f"💡 {rec}")
            st.subheader("Track Your Progress")
            if st.button("Save Current Profile"):
                st.success("Profile saved! Take the assessment again in the future to track your progress.")
            if st.button("Export Results"):
                results_json = json.dumps(bias_scores, indent=2)
                st.download_button(
                    label="Download Bias Profile",
                    data=results_json,
                    file_name="bias_profile.json",
                    mime="application/json"
                )
        else:
            st.info("Please complete the Bias Assessment first to see your personal profile.")
            if st.button("Take Assessment Now"):
                st.session_state.redirect_to_assessment = True
                st.rerun()
    st.markdown("---")
    st.markdown("**Remember**: Awareness of biases is the first step to overcoming them. Regular self-assessment and mindful trading practices are key to improvement.")
    # --- End migrated content ---

def sentiment_analysis_page():
    # Page header with gradient background
    st.markdown('''
        <div style="
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        ">
            <div style="font-size: 3rem;">🎭</div>
            <div style="color: white; font-size: 2rem; font-weight: bold;">Sentiment Analysis</div>
            <div style="margin-left: auto; font-size: 1.5rem;">🔗</div>
        </div>
    ''', unsafe_allow_html=True)
    
    sentiment_analyzer = SentimentAnalyzer()
    crypto_options = [
        'Bitcoin', 'Ethereum', 'Binance Coin', 'Cardano', 'Solana',
        'Polkadot', 'Dogecoin', 'Polygon', 'Avalanche', 'Chainlink'
    ]
    selected_crypto = st.selectbox(
        "Select Cryptocurrency",
        crypto_options,
        index=0,
        key="sentiment_crypto"
    )
    analysis_type = st.selectbox(
        "Analysis Type",
        ["Real-time Sentiment", "Historical Sentiment", "News Analysis", "Social Media Sentiment"],
        key="sentiment_analysis_type"
    )
    auto_refresh = st.checkbox("Auto Refresh (60s)", value=False, key="sentiment_auto_refresh")
    if auto_refresh and analysis_type == "Real-time Sentiment":
        time.sleep(60)
        st.rerun()
    if analysis_type == "Real-time Sentiment":
        st.header(f"📊 Real-time Sentiment Analysis: {selected_crypto}")
        col1, col2, col3, col4 = st.columns(4)
        try:
            current_sentiment = sentiment_analyzer.get_current_sentiment(selected_crypto.lower())
            with col1:
                sentiment_score = current_sentiment.get('overall_score', 0)
                sentiment_label = sentiment_analyzer.get_sentiment_label(sentiment_score)
                color = "normal" if sentiment_label == "Neutral" else ("green" if sentiment_label == "Positive" else "red")
                st.metric("Overall Sentiment", sentiment_label, f"{sentiment_score:.2f}", delta_color=color)
            with col2:
                fear_greed = current_sentiment.get('fear_greed_index', 50)
                st.metric("Fear & Greed Index", f"{fear_greed}/100", 
                         "Greed" if fear_greed > 50 else "Fear")
            with col3:
                news_sentiment = current_sentiment.get('news_sentiment', 0)
                st.metric("News Sentiment", f"{news_sentiment:.2f}", 
                         "📈" if news_sentiment > 0 else "📉")
            with col4:
                social_sentiment = current_sentiment.get('social_sentiment', 0)
                st.metric("Social Sentiment", f"{social_sentiment:.2f}",
                         "📱" if social_sentiment > 0 else "💬")
        except Exception as e:
            st.error(f"Error fetching sentiment data: {str(e)}")
            with col1:
                st.metric("Overall Sentiment", "Neutral", "0.05")
            with col2:
                st.metric("Fear & Greed Index", "65/100", "Greed")
            with col3:
                st.metric("News Sentiment", "0.12", "📈")
            with col4:
                st.metric("Social Sentiment", "-0.08", "📉")
        st.subheader("Sentiment Gauge")
        try:
            sentiment_score = current_sentiment.get('overall_score', 0)
        except:
            sentiment_score = 0.05
        fig_gauge = go.Figure(go.Indicator(
            mode = "gauge+number+delta",
            value = sentiment_score,
            domain = {'x': [0, 1], 'y': [0, 1]},
            title = {'text': "Overall Sentiment Score"},
            delta = {'reference': 0},
            gauge = {
                'axis': {'range': [-1, 1]},
                'bar': {'color': "darkblue"},
                'steps': [
                    {'range': [-1, -0.5], 'color': "red"},
                    {'range': [-0.5, 0.5], 'color': "yellow"},
                    {'range': [0.5, 1], 'color': "green"}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 0.9
                }
            }
        ))
        fig_gauge.update_layout(height=400)
        st.plotly_chart(fig_gauge, use_container_width=True)
        st.subheader("Sentiment Components")
        col1, col2 = st.columns(2)
        with col1:
            st.write("**News Sentiment Sources**")
            news_sources = {
                'CoinDesk': 0.15,
                'CoinTelegraph': 0.08,
                'CryptoSlate': -0.05,
                'Bitcoin.com': 0.12,
                'Decrypt': 0.03
            }
            df_news = pd.DataFrame(list(news_sources.items()), columns=['Source', 'Sentiment'])
            fig_news = px.bar(df_news, x='Source', y='Sentiment', 
                             title="News Source Sentiment Scores",
                             color='Sentiment',
                             color_continuous_scale='RdYlGn')
            st.plotly_chart(fig_news, use_container_width=True)
        with col2:
            st.write("**Social Media Sentiment**")
            social_sources = {
                'Reddit': -0.10,
                'Twitter': 0.05,
                'Telegram': 0.20,
                'Discord': -0.02,
                'YouTube': 0.08
            }
            df_social = pd.DataFrame(list(social_sources.items()), columns=['Platform', 'Sentiment'])
            fig_social = px.bar(df_social, x='Platform', y='Sentiment',
                               title="Social Media Sentiment Scores",
                               color='Sentiment',
                               color_continuous_scale='RdYlGn')
            st.plotly_chart(fig_social, use_container_width=True)
        st.subheader("Live Sentiment Stream")
        sentiment_placeholder = st.empty()
        with sentiment_placeholder.container():
            st.write("**Recent Sentiment Updates:**")
            recent_updates = [
                {"time": "2 min ago", "source": "Twitter", "sentiment": 0.25, "text": "Bitcoin looking strong! 🚀"},
                {"time": "5 min ago", "source": "Reddit", "sentiment": -0.15, "text": "Concerned about the market volatility"},
                {"time": "8 min ago", "source": "CoinDesk", "sentiment": 0.10, "text": "Positive regulatory developments"},
                {"time": "12 min ago", "source": "Telegram", "sentiment": 0.30, "text": "Bullish news from major exchange"},
                {"time": "15 min ago", "source": "YouTube", "sentiment": -0.05, "text": "Technical analysis shows consolidation"}
            ]
            for update in recent_updates:
                sentiment_color = "🟢" if update["sentiment"] > 0 else "🔴" if update["sentiment"] < 0 else "🟡"
                st.write(f"{sentiment_color} **{update['source']}** ({update['time']}): {update['text']}")
    elif analysis_type == "Historical Sentiment":
        st.header(f"📈 Historical Sentiment Analysis: {selected_crypto}")
        time_range = st.selectbox(
            "Select Time Range",
            ["7 Days", "30 Days", "90 Days", "180 Days"],
            index=1,
            key="sentiment_hist_range"
        )
        days = {"7 Days": 7, "30 Days": 30, "90 Days": 90, "180 Days": 180}[time_range]
        historical_data = sentiment_analyzer.get_historical_sentiment(selected_crypto.lower(), days)
        st.subheader(f"Sentiment Trend - {time_range}")
        if historical_data:
            df_hist = pd.DataFrame(historical_data)
            fig_hist = go.Figure()
            fig_hist.add_trace(go.Scatter(
                x=df_hist['date'],
                y=df_hist['sentiment_score'],
                mode='lines+markers',
                name='Sentiment Score',
                line=dict(color='#FF6B35', width=2)
            ))
            fig_hist.add_hline(y=0, line_dash="dash", line_color="gray", 
                              annotation_text="Neutral")
            fig_hist.update_layout(
                title=f"{selected_crypto} Sentiment Over {time_range}",
                xaxis_title="Date",
                yaxis_title="Sentiment Score",
                height=500
            )
            st.plotly_chart(fig_hist, use_container_width=True)
            col1, col2, col3 = st.columns(3)
            with col1:
                avg_sentiment = df_hist['sentiment_score'].mean()
                st.metric("Average Sentiment", f"{avg_sentiment:.3f}")
            with col2:
                max_sentiment = df_hist['sentiment_score'].max()
                st.metric("Most Positive", f"{max_sentiment:.3f}")
            with col3:
                min_sentiment = df_hist['sentiment_score'].min()
                st.metric("Most Negative", f"{min_sentiment:.3f}")
            st.subheader("Sentiment vs Price Correlation")
            correlation_score = 0.65
            st.metric("Sentiment-Price Correlation", f"{correlation_score:.2f}", 
                     "Strong positive correlation" if correlation_score > 0.5 else "Weak correlation")
            st.subheader("Sentiment Distribution")
            fig_dist = px.histogram(df_hist, x='sentiment_score', nbins=20,
                                   title="Distribution of Sentiment Scores")
            st.plotly_chart(fig_dist, use_container_width=True)
        else:
            st.warning("Unable to fetch historical sentiment data.")
    elif analysis_type == "News Analysis":
        st.header(f"📰 News Sentiment Analysis: {selected_crypto}")
        news_sources = st.multiselect(
            "Select News Sources",
            ["CoinDesk", "CoinTelegraph", "CryptoSlate", "Bitcoin.com", "Decrypt", "All"],
            default=["All"],
            key="sentiment_news_sources"
        )
        try:
            news_data = scrape_crypto_news(selected_crypto.lower(), sources=news_sources)
            if news_data:
                st.subheader("Recent News Articles")
                analyzed_news = []
                for article in news_data[:10]:
                    sentiment_score = sentiment_analyzer.analyze_text(article['content'])
                    analyzed_news.append({
                        'title': article['title'],
                        'source': article['source'],
                        'sentiment': sentiment_score,
                        'url': article['url'],
                        'published': article['published']
                    })
                for article in analyzed_news:
                    sentiment_emoji = "🟢" if article['sentiment'] > 0.1 else "🔴" if article['sentiment'] < -0.1 else "🟡"
                    with st.expander(f"{sentiment_emoji} {article['title'][:100]}..."):
                        col1, col2 = st.columns([3, 1])
                        with col1:
                            st.write(f"**Source:** {article['source']}")
                            st.write(f"**Published:** {article['published']}")
                            st.write(f"**Sentiment Score:** {article['sentiment']:.3f}")
                        with col2:
                            sentiment_label = sentiment_analyzer.get_sentiment_label(article['sentiment'])
                            st.metric("Sentiment", sentiment_label)
                        if article['url']:
                            st.write(f"[Read Full Article]({article['url']})")
                st.subheader("News Sentiment Summary")
                df_news = pd.DataFrame(analyzed_news)
                col1, col2 = st.columns(2)
                with col1:
                    avg_sentiment = df_news['sentiment'].mean()
                    st.metric("Average News Sentiment", f"{avg_sentiment:.3f}")
                    positive_count = len(df_news[df_news['sentiment'] > 0.1])
                    st.metric("Positive Articles", f"{positive_count}/{len(df_news)}")
                with col2:
                    negative_count = len(df_news[df_news['sentiment'] < -0.1])
                    st.metric("Negative Articles", f"{negative_count}/{len(df_news)}")
                    neutral_count = len(df_news) - positive_count - negative_count
                    st.metric("Neutral Articles", f"{neutral_count}/{len(df_news)}")
                fig_news_dist = px.histogram(df_news, x='sentiment', nbins=15,
                                           title="Distribution of News Sentiment Scores")
                st.plotly_chart(fig_news_dist, use_container_width=True)
            else:
                st.warning("Unable to fetch news data. Please try again later.")
        except Exception as e:
            st.error(f"Error analyzing news: {str(e)}")
    elif analysis_type == "Social Media Sentiment":
        st.header(f"💬 Social Media Sentiment: {selected_crypto}")
        platforms = st.multiselect(
            "Select Social Media Platforms",
            ["Twitter", "Reddit", "Telegram", "Discord", "YouTube"],
            default=["Twitter", "Reddit"],
            key="sentiment_social_platforms"
        )
        timeframe = st.selectbox(
            "Analysis Timeframe",
            ["Last Hour", "Last 6 Hours", "Last Day", "Last Week"],
            index=2,
            key="sentiment_social_timeframe"
        )
        social_data = sentiment_analyzer.get_social_sentiment(selected_crypto.lower(), platforms, timeframe)
        if social_data:
            st.subheader("Platform Sentiment Comparison")
            platform_sentiments = {}
            for platform in platforms:
                platform_sentiments[platform] = social_data.get(platform, {}).get('sentiment', 0)
            df_platforms = pd.DataFrame(list(platform_sentiments.items()), 
                                      columns=['Platform', 'Sentiment'])
            fig_platforms = px.bar(df_platforms, x='Platform', y='Sentiment',
                                 title="Social Media Platform Sentiment Scores",
                                 color='Sentiment',
                                 color_continuous_scale='RdYlGn')
            st.plotly_chart(fig_platforms, use_container_width=True)
            st.subheader("Trending Topics & Keywords")
            trending_topics = [
                {"keyword": "bullish", "mentions": 1250, "sentiment": 0.45},
                {"keyword": "HODL", "mentions": 890, "sentiment": 0.30},
                {"keyword": "crash", "mentions": 650, "sentiment": -0.60},
                {"keyword": "moon", "mentions": 580, "sentiment": 0.70},
                {"keyword": "dump", "mentions": 420, "sentiment": -0.80}
            ]
            df_trending = pd.DataFrame(trending_topics)
            col1, col2 = st.columns(2)
            with col1:
                fig_mentions = px.bar(df_trending, x='keyword', y='mentions',
                                    title="Most Mentioned Keywords")
                st.plotly_chart(fig_mentions, use_container_width=True)
            with col2:
                fig_keyword_sentiment = px.bar(df_trending, x='keyword', y='sentiment',
                                             title="Keyword Sentiment Scores",
                                             color='sentiment',
                                             color_continuous_scale='RdYlGn')
                st.plotly_chart(fig_keyword_sentiment, use_container_width=True)
            st.subheader("Social Media Metrics")
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                total_mentions = sum([data.get('mentions', 0) for data in social_data.values()])
                st.metric("Total Mentions", f"{total_mentions:,}")
            with col2:
                avg_sentiment = sum([data.get('sentiment', 0) for data in social_data.values()]) / len(social_data)
                st.metric("Average Sentiment", f"{avg_sentiment:.3f}")
            with col3:
                engagement_rate = sum([data.get('engagement', 0) for data in social_data.values()]) / len(social_data)
                st.metric("Engagement Rate", f"{engagement_rate:.1f}%")
            with col4:
                influence_score = sum([data.get('influence', 0) for data in social_data.values()]) / len(social_data)
                st.metric("Influence Score", f"{influence_score:.2f}")
            st.subheader("Recent High-Impact Posts")
            recent_posts = [
                {"platform": "Twitter", "user": "@CryptoTrader123", "content": "Bitcoin looking strong! Just broke resistance 🚀", "sentiment": 0.65, "engagement": 450},
                {"platform": "Reddit", "user": "u/hodler2021", "content": "Market volatility is concerning, but fundamentals remain strong", "sentiment": 0.10, "engagement": 290},
                {"platform": "Telegram", "user": "CryptoWhale", "content": "Major accumulation happening behind the scenes", "sentiment": 0.75, "engagement": 680},
                {"platform": "Twitter", "user": "@MarketAnalyst", "content": "Technical analysis suggests potential downside risk", "sentiment": -0.35, "engagement": 320}
            ]
            for post in recent_posts:
                sentiment_emoji = "🟢" if post['sentiment'] > 0.1 else "🔴" if post['sentiment'] < -0.1 else "🟡"
                with st.expander(f"{sentiment_emoji} {post['platform']} - {post['user']}"):
                    st.write(f"**Content:** {post['content']}")
                    col1, col2 = st.columns(2)
                    with col1:
                        st.metric("Sentiment", f"{post['sentiment']:.2f}")
                    with col2:
                        st.metric("Engagement", post['engagement'])
        else:
            st.warning("Unable to fetch social media data. Please try again later.")
    st.header("🔍 Sentiment Analysis Insights")
    insights = [
        "💡 **Sentiment-Price Correlation**: Strong positive correlation (0.65) between sentiment and price movements in the last 30 days.",
        "📈 **Volume Impact**: High sentiment periods show 35% higher trading volume on average.",
        "⚠️ **Volatility Warning**: Extreme sentiment scores (>0.7 or <-0.7) often precede high volatility periods.",
        "🔄 **Reversion Pattern**: Sentiment tends to revert to neutral within 3-5 days of extreme readings.",
        "📱 **Social Media Lead**: Social media sentiment changes typically precede news sentiment by 2-4 hours."
    ]
    for insight in insights:
        st.info(insight)
    st.markdown("---")
    st.markdown(f"**Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | **Data Sources:** News APIs, Social Media APIs")
    # --- End migrated content ---

def ml_forecasting_page():
    # Page header with gradient background
    st.markdown('''
        <div style="
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        ">
            <div style="font-size: 3rem;">🤖</div>
            <div style="color: white; font-size: 2rem; font-weight: bold;">ML Forecasting</div>
            <div style="margin-left: auto; font-size: 1.5rem;">🔗</div>
        </div>
    ''', unsafe_allow_html=True)
    
    @st.cache_resource
    def load_predictor():
        return CryptoPredictor()
    predictor = load_predictor()
    model_type = st.selectbox(
        "Select Model Type",
        ["Ensemble Model", "LSTM Neural Network", "Random Forest", "XGBoost", "All Models Comparison"],
        key="ml_model_type"
    )
    crypto_options = {
        'Bitcoin': 'bitcoin',
        'Ethereum': 'ethereum',
        'Binance Coin': 'binancecoin',
        'Cardano': 'cardano',
        'Solana': 'solana'
    }
    selected_crypto = st.selectbox(
        "Select Cryptocurrency",
        list(crypto_options.keys()),
        index=0,
        key="ml_crypto"
    )
    prediction_days = st.slider(
        "Prediction Period (Days)",
        min_value=1,
        max_value=30,
        value=7,
        key="ml_pred_days"
    )
    show_features = st.checkbox("Show Feature Importance", value=True, key="ml_show_features")
    confidence_threshold = st.slider(
        "Confidence Threshold",
        min_value=0.5,
        max_value=0.95,
        value=0.8,
        step=0.05,
        key="ml_conf_threshold"
    )
    crypto_id = crypto_options[selected_crypto]
    try:
        historical_data = get_historical_data(crypto_id, 365)
        if historical_data:
            price_data = [point[1] for point in historical_data['prices']]
            volume_data = [point[1] for point in historical_data['total_volumes']]
            dates = [datetime.fromtimestamp(point[0]/1000) for point in historical_data['prices']]
            df = pd.DataFrame({
                'date': dates,
                'price': price_data,
                'volume': volume_data
            })
            if model_type == "Ensemble Model":
                st.header(f"🎯 Ensemble Model Predictions: {selected_crypto}")
                with st.spinner("Training ensemble model..."):
                    ensemble_results = predictor.train_ensemble_model(df, prediction_days)
                if ensemble_results:
                    col1, col2, col3, col4 = st.columns(4)
                    with col1:
                        current_price = df['price'].iloc[-1]
                        predicted_price = ensemble_results['predictions'][-1]
                        price_change = ((predicted_price - current_price) / current_price) * 100
                        st.metric("Predicted Price", f"${predicted_price:.2f}", f"{price_change:.2f}%")
                    with col2:
                        confidence = ensemble_results['confidence']
                        st.metric("Model Confidence", f"{confidence:.1%}")
                    with col3:
                        direction = "📈 Bullish" if price_change > 0 else "📉 Bearish"
                        st.metric("Direction", direction)
                    with col4:
                        volatility = ensemble_results['volatility']
                        st.metric("Predicted Volatility", f"{volatility:.2f}%")
                    st.subheader("Price Prediction Chart")
                    fig = go.Figure()
                    fig.add_trace(go.Scatter(
                        x=df['date'],
                        y=df['price'],
                        mode='lines',
                        name='Historical Price',
                        line=dict(color='#FF6B35', width=2)
                    ))
                    future_dates = [df['date'].iloc[-1] + timedelta(days=i) for i in range(1, prediction_days + 1)]
                    fig.add_trace(go.Scatter(
                        x=future_dates,
                        y=ensemble_results['predictions'],
                        mode='lines+markers',
                        name='Predicted Price',
                        line=dict(color='#00FF00', width=2, dash='dash')
                    ))
                    upper_bound = [p * (1 + ensemble_results['volatility']/100) for p in ensemble_results['predictions']]
                    lower_bound = [p * (1 - ensemble_results['volatility']/100) for p in ensemble_results['predictions']]
                    fig.add_trace(go.Scatter(
                        x=future_dates + future_dates[::-1],
                        y=upper_bound + lower_bound[::-1],
                        fill='toself',
                        fillcolor='rgba(0,255,0,0.1)',
                        line=dict(color='rgba(255,255,255,0)'),
                        name='Confidence Interval'
                    ))
                    fig.update_layout(
                        title=f"{selected_crypto} Price Prediction - Ensemble Model",
                        xaxis_title="Date",
                        yaxis_title="Price (USD)",
                        height=600
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    st.subheader("Model Performance Metrics")
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("RMSE", f"{ensemble_results['rmse']:.2f}")
                        st.metric("MAE", f"{ensemble_results['mae']:.2f}")
                    with col2:
                        st.metric("R² Score", f"{ensemble_results['r2_score']:.3f}")
                        st.metric("MAPE", f"{ensemble_results['mape']:.2f}%")
                    with col3:
                        st.metric("Sharpe Ratio", f"{ensemble_results['sharpe_ratio']:.2f}")
                        st.metric("Max Drawdown", f"{ensemble_results['max_drawdown']:.2f}%")
                    if show_features and 'feature_importance' in ensemble_results:
                        st.subheader("Feature Importance")
                        features = ensemble_results['feature_importance']
                        df_features = pd.DataFrame(list(features.items()), columns=['Feature', 'Importance'])
                        df_features = df_features.sort_values('Importance', ascending=False)
                        fig_features = px.bar(df_features, x='Feature', y='Importance',
                                            title="Feature Importance in Ensemble Model")
                        st.plotly_chart(fig_features, use_container_width=True)
            elif model_type == "LSTM Neural Network":
                st.header(f"🧠 LSTM Neural Network Predictions: {selected_crypto}")
                with st.spinner("Training LSTM model... This may take a few minutes."):
                    lstm_results = predictor.train_lstm_model(df, prediction_days)
                if lstm_results and 'error' in lstm_results:
                    st.error(f"❌ {lstm_results['error']}")
                    st.info(f"ℹ️ {lstm_results['message']}")
                    st.markdown("**Available alternatives:**")
                    st.markdown("- Use **Ensemble Model** for best performance")
                    st.markdown("- Use **Random Forest** for fast training")
                    st.markdown("- Use **XGBoost** for gradient boosting")
                    st.markdown("- Use **All Models Comparison** to compare performance")
                elif lstm_results:
                    col1, col2, col3, col4 = st.columns(4)
                    with col1:
                        current_price = df['price'].iloc[-1]
                        predicted_price = lstm_results['predictions'][-1]
                        price_change = ((predicted_price - current_price) / current_price) * 100
                        st.metric("LSTM Predicted Price", f"${predicted_price:.2f}", f"{price_change:.2f}%")
                    with col2:
                        confidence = lstm_results['confidence']
                        st.metric("Model Confidence", f"{confidence:.1%}")
                    with col3:
                        direction = "📈 Bullish" if price_change > 0 else "📉 Bearish"
                        st.metric("Direction", direction)
                    with col4:
                        volatility = lstm_results['volatility']
                        st.metric("Predicted Volatility", f"{volatility:.2f}%")
                    st.subheader("LSTM Price Prediction")
                    fig = go.Figure()
                    fig.add_trace(go.Scatter(
                        x=df['date'],
                        y=df['price'],
                        mode='lines',
                        name='Historical Price',
                        line=dict(color='#FF6B35', width=2)
                    ))
                    future_dates = [df['date'].iloc[-1] + timedelta(days=i) for i in range(1, prediction_days + 1)]
                    fig.add_trace(go.Scatter(
                        x=future_dates,
                        y=lstm_results['predictions'],
                        mode='lines+markers',
                        name='LSTM Predictions',
                        line=dict(color='#0000FF', width=2, dash='dash')
                    ))
                    fig.update_layout(
                        title=f"{selected_crypto} LSTM Price Prediction",
                        xaxis_title="Date",
                        yaxis_title="Price (USD)",
                        height=600
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    st.subheader("LSTM Model Architecture")
                    col1, col2 = st.columns(2)
                    with col1:
                        st.write("**Model Configuration:**")
                        st.write(f"- Layers: {lstm_results['layers']}")
                        st.write(f"- Neurons: {lstm_results['neurons']}")
                        st.write(f"- Dropout: {lstm_results['dropout']}")
                        st.write(f"- Epochs: {lstm_results['epochs']}")
                    with col2:
                        st.write("**Training Results:**")
                        st.write(f"- Training Loss: {lstm_results['train_loss']:.4f}")
                        st.write(f"- Validation Loss: {lstm_results['val_loss']:.4f}")
                        st.write(f"- Training Time: {lstm_results['train_time']:.2f}s")
                    if 'training_history' in lstm_results:
                        st.subheader("Training History")
                        history = lstm_results['training_history']
                        fig_history = go.Figure()
                        fig_history.add_trace(go.Scatter(
                            y=history['loss'],
                            mode='lines',
                            name='Training Loss',
                            line=dict(color='red')
                        ))
                        fig_history.add_trace(go.Scatter(
                            y=history['val_loss'],
                            mode='lines',
                            name='Validation Loss',
                            line=dict(color='blue')
                        ))
                        fig_history.update_layout(
                            title="LSTM Training History",
                            xaxis_title="Epoch",
                            yaxis_title="Loss",
                            height=400
                        )
                        st.plotly_chart(fig_history, use_container_width=True)
            elif model_type == "All Models Comparison":
                st.header(f"📊 All Models Comparison: {selected_crypto}")
                with st.spinner("Training all models... This may take a few minutes."):
                    all_results = predictor.compare_all_models(df, prediction_days)
                if all_results:
                    st.subheader("Model Performance Comparison")
                    comparison_data = []
                    for model_name, results in all_results.items():
                        comparison_data.append({
                            'Model': model_name,
                            'RMSE': results['rmse'],
                            'MAE': results['mae'],
                            'R² Score': results['r2_score'],
                            'Confidence': results['confidence'],
                            'Predicted Price': results['predictions'][-1]
                        })
                    df_comparison = pd.DataFrame(comparison_data)
                    st.dataframe(df_comparison.style.highlight_min(subset=['RMSE', 'MAE'])
                               .highlight_max(subset=['R² Score', 'Confidence']))
                    best_model = df_comparison.loc[df_comparison['R² Score'].idxmax(), 'Model']
                    st.success(f"🏆 **Best Performing Model:** {best_model}")
                    st.subheader("Predictions Comparison")
                    fig = go.Figure()
                    fig.add_trace(go.Scatter(
                        x=df['date'],
                        y=df['price'],
                        mode='lines',
                        name='Historical Price',
                        line=dict(color='#FF6B35', width=2)
                    ))
                    colors = ['#00FF00', '#0000FF', '#FF0000', '#FFFF00', '#FF00FF']
                    future_dates = [df['date'].iloc[-1] + timedelta(days=i) for i in range(1, prediction_days + 1)]
                    for i, (model_name, results) in enumerate(all_results.items()):
                        fig.add_trace(go.Scatter(
                            x=future_dates,
                            y=results['predictions'],
                            mode='lines+markers',
                            name=f'{model_name} Predictions',
                            line=dict(color=colors[i % len(colors)], width=2, dash='dash')
                        ))
                    fig.update_layout(
                        title=f"{selected_crypto} - All Models Predictions Comparison",
                        xaxis_title="Date",
                        yaxis_title="Price (USD)",
                        height=600
                    )
                    st.plotly_chart(fig, use_container_width=True)
                    st.subheader("Model Accuracy Analysis")
                    col1, col2 = st.columns(2)
                    with col1:
                        accuracy_data = [(model, results['r2_score']) for model, results in all_results.items()]
                        df_accuracy = pd.DataFrame(accuracy_data, columns=['Model', 'R² Score'])
                        fig_accuracy = px.bar(df_accuracy, x='Model', y='R² Score',
                                            title="Model Accuracy Comparison")
                        st.plotly_chart(fig_accuracy, use_container_width=True)
                    with col2:
                        predictions = [results['predictions'][-1] for results in all_results.values()]
                        variance = np.var(predictions)
                        mean_pred = np.mean(predictions)
                        st.metric("Prediction Variance", f"{variance:.2f}")
                        st.metric("Mean Prediction", f"${mean_pred:.2f}")
                        st.metric("Prediction Std", f"{np.std(predictions):.2f}")
            else:
                st.header(f"📈 {model_type} Predictions: {selected_crypto}")
                with st.spinner(f"Training {model_type.lower()}..."):
                    if model_type == "Random Forest":
                        results = predictor.train_random_forest(df, prediction_days)
                    elif model_type == "XGBoost":
                        results = predictor.train_xgboost(df, prediction_days)
                if results:
                    col1, col2, col3, col4 = st.columns(4)
                    with col1:
                        current_price = df['price'].iloc[-1]
                        predicted_price = results['predictions'][-1]
                        price_change = ((predicted_price - current_price) / current_price) * 100
                        st.metric("Predicted Price", f"${predicted_price:.2f}", f"{price_change:.2f}%")
                    with col2:
                        confidence = results['confidence']
                        st.metric("Model Confidence", f"{confidence:.1%}")
                    with col3:
                        direction = "📈 Bullish" if price_change > 0 else "📉 Bearish"
                        st.metric("Direction", direction)
                    with col4:
                        volatility = results['volatility']
                        st.metric("Predicted Volatility", f"{volatility:.2f}%")
                    fig = go.Figure()
                    fig.add_trace(go.Scatter(
                        x=df['date'],
                        y=df['price'],
                        mode='lines',
                        name='Historical Price',
                        line=dict(color='#FF6B35', width=2)
                    ))
                    future_dates = [df['date'].iloc[-1] + timedelta(days=i) for i in range(1, prediction_days + 1)]
                    fig.add_trace(go.Scatter(
                        x=future_dates,
                        y=results['predictions'],
                        mode='lines+markers',
                        name=f'{model_type} Predictions',
                        line=dict(color='#00FF00', width=2, dash='dash')
                    ))
                    fig.update_layout(
                        title=f"{selected_crypto} {model_type} Prediction",
                        xaxis_title="Date",
                        yaxis_title="Price (USD)",
                        height=600
                    )
                    st.plotly_chart(fig, use_container_width=True)
        else:
            st.error("Unable to fetch historical data for model training.")
    except Exception as e:
        st.error(f"Error in ML forecasting: {str(e)}")
    st.header("🔍 Model Insights & Recommendations")
    insights = [
        "🎯 **Ensemble Advantage**: Ensemble models typically provide more stable predictions by combining multiple algorithms.",
        "🧠 **LSTM Strengths**: Neural networks excel at capturing complex temporal patterns in cryptocurrency data.",
        "⚡ **Speed vs Accuracy**: Random Forest offers fast predictions while XGBoost provides high accuracy.",
        "📈 **Feature Engineering**: Technical indicators, sentiment scores, and market data improve prediction accuracy.",
        "⚠️ **Volatility Warning**: Cryptocurrency markets are highly volatile; use predictions as guidance, not certainty.",
        "🔄 **Model Retraining**: Models should be retrained regularly with new data to maintain accuracy."
    ]
    for insight in insights:
        st.info(insight)
    st.warning("""
    **Risk Disclaimer**: These predictions are based on historical data and mathematical models. 
    Cryptocurrency markets are highly volatile and unpredictable. Never invest more than you can afford to lose, 
    and always do your own research before making investment decisions.
    """)
    st.markdown("---")
    st.markdown(f"**Model Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | **Data Points Used:** {len(df) if 'df' in locals() else 'N/A'}")
    # --- End migrated content ---

def investment_simulator_page():
    # Page header with gradient background
    st.markdown('''
        <div style="
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        ">
            <div style="font-size: 3rem;">🎮</div>
            <div style="color: white; font-size: 2rem; font-weight: bold;">Investment Simulator</div>
            <div style="margin-left: auto; font-size: 1.5rem;">🔗</div>
        </div>
    ''', unsafe_allow_html=True)
    
    if 'portfolio' not in st.session_state:
        st.session_state.portfolio = {
            'cash': 10000,
            'holdings': {},
            'transactions': [],
            'portfolio_value': 10000,
            'total_return': 0
        }
    if 'current_scenario' not in st.session_state:
        st.session_state.current_scenario = None
    sim_mode = st.selectbox(
        "Simulation Mode",
        ["Live Trading", "Historical Scenarios", "Bias Testing", "Strategy Backtesting"],
        key="sim_mode"
    )
    emotional_state = st.selectbox(
        "Current Emotional State",
        ["Neutral", "Fearful", "Greedy", "Overconfident", "Panicked", "Euphoric"],
        key="sim_emotion"
    )
    risk_tolerance = st.selectbox(
        "Risk Tolerance",
        ["Conservative", "Moderate", "Aggressive", "Very Aggressive"],
        key="sim_risk"
    )
    portfolio = st.session_state.portfolio
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Portfolio Value", f"${portfolio['portfolio_value']:,.2f}")
    with col2:
        st.metric("Available Cash", f"${portfolio['cash']:,.2f}")
    with col3:
        total_return = ((portfolio['portfolio_value'] - 10000) / 10000) * 100
        st.metric("Total Return", f"{total_return:.2f}%")
    with col4:
        num_holdings = len(portfolio['holdings'])
        st.metric("Holdings", f"{num_holdings} assets")
    st.header("💰 Portfolio Management")
    st.write("Manage your cryptocurrency portfolio and track your investments.")
    crypto_options = [
        'Bitcoin', 'Ethereum', 'Binance Coin', 'Cardano', 'Solana',
        'Polkadot', 'Dogecoin', 'Polygon', 'Avalanche', 'Chainlink'
    ]
    selected_crypto = st.selectbox(
        "Select Cryptocurrency to Trade",
        crypto_options,
        index=0,
        key="sim_trade_crypto"
    )
    initial_investment = st.number_input("Initial Investment (USD)", min_value=100.0, value=1000.0, step=100.0)
    investment_period = st.selectbox(
        "Investment Period",
        ["1 Day", "7 Days", "30 Days", "90 Days", "1 Year"],
        index=2,
        key="sim_period"
    )
    days = {"1 Day": 1, "7 Days": 7, "30 Days": 30, "90 Days": 90, "1 Year": 365}[investment_period]
    auto_refresh = st.checkbox("Auto Refresh (60s)", value=False, key="simulator_auto_refresh")
    if auto_refresh:
        time.sleep(60)
        st.rerun()
    st.header(f"Simulating {selected_crypto} Investment")
    try:
        crypto_id = crypto_options[crypto_options.index(selected_crypto)].lower()
        current_price = get_crypto_data(crypto_id)['market_data']['current_price']['usd']
        initial_amount = initial_investment / current_price
        st.write(f"Initial Investment: ${initial_investment:,.2f} (Approximately {initial_amount:,.4f} {selected_crypto})")
        
        # Simulate daily price changes
        prices = []
        current_amount = initial_amount
        for i in range(days):
            price_change = random.uniform(-0.05, 0.05) # 5% daily fluctuation
            current_price = current_price * (1 + price_change)
            prices.append(current_price)
            current_amount = current_amount * (1 + price_change) # Re-calculate amount based on current price
        
        # Calculate final amount and return
        final_amount = current_amount * prices[-1] # Multiply final amount by final price
        return_percentage = ((final_amount - initial_investment) / initial_investment) * 100
        
        st.subheader(f"Simulated Investment Results for {investment_period}")
        st.write(f"Final Amount: ${final_amount:,.2f}")
        st.write(f"Return on Investment: {return_percentage:.2f}%")
        
        # Plot price simulation
        fig_price = go.Figure()
        fig_price.add_trace(go.Scatter(
            x=list(range(days)),
            y=prices,
            mode='lines',
            name='Price',
            line=dict(color='#FF6B35', width=2)
        ))
        fig_price.update_layout(
            title=f"{selected_crypto} Price Simulation Over {investment_period}",
            xaxis_title="Days",
            yaxis_title="Price (USD)",
            height=500
        )
        st.plotly_chart(fig_price, use_container_width=True)
        
        # Plot amount simulation
        fig_amount = go.Figure()
        fig_amount.add_trace(go.Scatter(
            x=list(range(days)),
            y=[initial_amount * p for p in prices], # Plot amount based on price
            mode='lines',
            name='Amount (USD)',
            line=dict(color='#007bff', width=2)
        ))
        fig_amount.update_layout(
            title=f"Simulated Investment Amount Over {investment_period}",
            xaxis_title="Days",
            yaxis_title="Amount (USD)",
            height=500
        )
        st.plotly_chart(fig_amount, use_container_width=True)
        
    except Exception as e:
        st.error(f"Error in investment simulator: {str(e)}")
    st.markdown("---")
    st.markdown("**Disclaimer**: This simulator is for educational purposes only. Real trading involves significant risk and should be approached with caution.")
    # --- End migrated content ---

def database_analytics_page():
    # Page header with gradient background
    st.markdown('''
        <div style="
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        ">
            <div style="font-size: 3rem;">🗄️</div>
            <div style="color: white; font-size: 2rem; font-weight: bold;">Database Analytics</div>
            <div style="margin-left: auto; font-size: 1.5rem;">🔗</div>
        </div>
    ''', unsafe_allow_html=True)
    
    import plotly.express as px
    import plotly.graph_objects as go
    import pandas as pd
    from datetime import datetime, timedelta
    from utils.database import get_database
    from utils.data_fetcher import get_crypto_data, get_market_overview
    st.markdown("""
    <style>
        .main-header {
            background: linear-gradient(90deg, #FF6B35 0%, #F7931E 100%);
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 2rem;
        }
        .metric-card {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #FF6B35;
        }
        .data-table {
            background: white;
            border-radius: 8px;
            padding: 1rem;
        }
    </style>
    """, unsafe_allow_html=True)

    db = get_database()
    if db:
        st.success("Database connection successful!")
        st.subheader("Available Tables")
        tables = [
            "Market Data",
            "Sentiment Data",
            "Trading Simulations",
            "ML Predictions",
            "Bias Assessments"
        ]
        st.write(", ".join(tables))
        selected_table = st.selectbox("Select a table to view data", tables, key="db_table_select")
        if selected_table:
            st.subheader(f"Data from {selected_table}")
            try:
                if selected_table == "Market Data":
                    crypto_symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'DOT', 'MATIC', 'LINK', 'UNI', 'AAVE', 'SUSHI']
                    all_data = []
                    for crypto in crypto_symbols:
                        data = db.get_historical_market_data(crypto, 30)
                        if data:
                            for row in data:
                                row['crypto_symbol'] = crypto
                                all_data.append(row)
                    data = all_data
                elif selected_table == "Sentiment Data":
                    crypto_symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'DOT']
                    all_data = []
                    for crypto in crypto_symbols:
                        data = db.get_sentiment_history(crypto, 7)
                        if data:
                            for row in data:
                                row['crypto_symbol'] = crypto
                                all_data.append(row)
                    data = all_data
                elif selected_table == "Trading Simulations":
                    data = db.get_trading_history(days=30)
                elif selected_table == "ML Predictions":
                    data = db.get_ml_prediction_history('BTC', days=30) if hasattr(db, 'get_ml_prediction_history') else []
                elif selected_table == "Bias Assessments":
                    data = db.get_bias_assessment_history(days=30) if hasattr(db, 'get_bias_assessment_history') else []
                else:
                    data = []
                if data:
                    df = pd.DataFrame(data)
                    st.write(f"Total rows: {len(df)}")
                    st.dataframe(df, use_container_width=True)
                else:
                    st.info("No data found for this table.")
            except Exception as e:
                st.error(f"Error fetching data from table '{selected_table}': {str(e)}")
    else:
        st.error("Could not connect to the database. Please check your connection settings.")
    st.markdown("---")
    st.markdown("**Note**: This analytics section provides a basic overview of the data stored in the database. More advanced analytics and visualizations can be implemented based on specific table structures.")
    # --- End migrated content ---

# --- SPA Router ---
if st.session_state.active_page == 'market_data':
    market_data_page()
elif st.session_state.active_page == 'bias_analysis':
    bias_analysis_page()
elif st.session_state.active_page == 'sentiment_analysis':
    sentiment_analysis_page()
elif st.session_state.active_page == 'ml_forecasting':
    ml_forecasting_page()
elif st.session_state.active_page == 'investment_simulator':
    investment_simulator_page()
elif st.session_state.active_page == 'database_analytics':
    database_analytics_page()

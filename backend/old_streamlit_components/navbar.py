import streamlit as st

NAV_ITEMS = [
    {"label": "Market Data", "icon": "fa-chart-line", "page": "market_data"},
    {"label": "Bias Analysis", "icon": "fa-brain", "page": "bias_analysis"},
    {"label": "Sentiment Analysis", "icon": "fa-face-smile", "page": "sentiment_analysis"},
    {"label": "ML Forecasting", "icon": "fa-robot", "page": "ml_forecasting"},
    {"label": "Simulator", "icon": "fa-gamepad", "page": "investment_simulator"},
    {"label": "Analytics", "icon": "fa-database", "page": "database_analytics"},
]

def render_navbar(active_page):
    st.markdown('''
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
    .neuro-navbar {
        width: 100vw;
        background: #fff;
        color: #222;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem 0;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .neuro-navbar ul {
        list-style: none;
        display: flex;
        gap: 2.5rem;
        margin: 0;
        padding: 0;
    }
    .neuro-navbar li {
        display: flex;
        align-items: center;
    }
    .neuro-navbar a {
        color: #222;
        text-decoration: none;
        font-size: 1.1rem;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        position: relative;
        transition: color 0.2s;
    }
    .neuro-navbar a .nav-underline {
        position: absolute;
        left: 0;
        bottom: 0.2rem;
        width: 100%;
        height: 2px;
        background: #FF6B35;
        transform: scaleX(0);
        transition: transform 0.25s;
        border-radius: 2px;
    }
    .neuro-navbar a:hover {
        color: #FF6B35;
        background: rgba(255,107,53,0.07);
    }
    .neuro-navbar a:hover .nav-underline,
    .neuro-navbar .active .nav-underline {
        transform: scaleX(1);
    }
    .neuro-navbar .active {
        color: #FF6B35 !important;
        background: rgba(255,107,53,0.12);
    }
    @media (max-width: 900px) {
        .neuro-navbar ul { gap: 1.2rem; }
        .neuro-navbar a { font-size: 1rem; padding: 0.5rem 0.5rem; }
    }
    @media (max-width: 600px) {
        .neuro-navbar ul { gap: 0.5rem; }
        .neuro-navbar a { font-size: 0.95rem; padding: 0.4rem 0.3rem; }
    }
    section[data-testid="stSidebar"], header, footer { display: none !important; }
    .block-container { padding-top: 4.5rem !important; }
    </style>
    ''', unsafe_allow_html=True)
    nav_html = '<nav class="neuro-navbar"><ul>'
    for item in NAV_ITEMS:
        active = 'active' if active_page == item['page'] else ''
        nav_html += f"<li><a href='?page={item['page']}' class='{active}'><i class='fa {item['icon']}'></i> {item['label']}<span class='nav-underline'></span></a></li>"
    nav_html += '</ul></nav>'
    st.markdown(nav_html, unsafe_allow_html=True) 
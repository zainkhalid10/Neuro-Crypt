# Neuro-Crypt
NeuroCrypt-Behavioral Crypto Analytics Platform Overview NeuroCrypt is a behavioral cryptocurrency analytics platform that combines psychology, sentiment analysis, and machine learning to support crypto trading decisions. It provides real-time market data, psychological bias detection, sentiment analysis, ML forecasting, and an investment simulator
Key Features
1. Market Data Analysis
Real-time cryptocurrency prices and volume data
Historical data visualization with customizable time ranges
Support for 10+ major cryptocurrencies (Bitcoin, Ethereum, etc.)
Interactive charts with technical indicators
Stock market data integration
Multiple chart types (line, bar, candlestick)
2. Bias Analysis
Psychological bias assessment questionnaire
Trading behavior analysis
Personal bias profiling
Educational content on cognitive biases affecting trading decisions
3. Sentiment Analysis
Real-time sentiment tracking from news and social media
News sentiment analysis from multiple crypto news sources
Social media sentiment monitoring
Historical sentiment trends visualization
4. ML Forecasting
Multiple ML models: LSTM, Random Forest, XGBoost, Ensemble
Technical indicator generation
Price prediction with confidence intervals
Model comparison and performance metrics
5. Investment Simulator
Virtual portfolio management
Scenario-based trading simulations
Bias testing environments
Strategy backtesting capabilities
User-specific session data persistence (saved to database)
6. User Authentication & Dashboard
Secure user signup and login system
JWT-based authentication
User dashboard with account information
Personalized trading history and simulator data
Protected routes for authenticated features
7. Analytics & View
Comprehensive analytics dashboard
Trade logs and transaction history
Database visualization and management
Performance metrics tracking
Technology Stack
Frontend (React/Next.js)
Framework: Next.js 15.4.4 with App Router
UI: React 19, Tailwind CSS 4
Charts: Recharts, React Financial Charts
State Management: React Context API
Authentication: JWT tokens with localStorage persistence
Backend (Python)
Web Framework: Flask (for auth API), Streamlit (legacy)
Data Processing: Pandas, NumPy
Machine Learning: Scikit-learn, XGBoost, TensorFlow/Keras
Sentiment Analysis: TextBlob, VADER Sentiment
Database: MongoDB (for user data and sessions), SQLite/PostgreSQL (legacy)
Authentication: PyJWT, Passlib (PBKDF2-SHA256)
External APIs
CoinGecko API: Cryptocurrency market data
Binance API: Real-time crypto price data
Finnhub API: Stock market data
News APIs: CoinDesk, CoinTelegraph, CryptoSlate, Bitcoin.com, Decrypt
Architecture
System Components
Frontend Application (neurocrypt-react/)
Next.js application with TypeScript
Component-based architecture
Protected routes for authenticated features
Real-time data visualization
Backend Services (backend/)
Flask authentication API (auth_api.py)
Utility modules for data processing, ML, sentiment analysis
MongoDB integration for user data persistence
Streamlit app (legacy)
Database
MongoDB for user authentication, sessions, and trading data
User-specific simulator state persistence
Security Features
Secure password hashing (PBKDF2-SHA256)
JWT-based authentication
Protected API endpoints
CORS configuration
Input validation and error handling
User Experience
Modern, responsive UI with Tailwind CSS
Real-time data updates
Interactive charts and visualizations
Personalized dashboard for logged-in users
Session persistence across logins

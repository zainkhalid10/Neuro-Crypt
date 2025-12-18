# NeuroCrypt - Behavioral Crypto Analytics Platform

![NeuroCrypt](https://img.shields.io/badge/NeuroCrypt-Behavioral%20Crypto%20Analytics-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## 📋 Overview

**NeuroCrypt** is a comprehensive behavioral cryptocurrency analytics platform that combines psychology, sentiment analysis, and machine learning to provide insights for crypto trading decisions. The application integrates real-time market data, psychological bias detection, sentiment analysis, ML forecasting, and investment simulation to help users make more informed trading decisions.

## ✨ Key Features

### 🔐 User Authentication & Dashboard
- Secure user signup and login system with JWT authentication
- Personalized user dashboard with account information
- User-specific trading history and simulator data persistence
- Protected routes for authenticated features

### 📊 Market Data Analysis
- Real-time cryptocurrency prices and volume data from Binance API
- Stock market data integration via Finnhub API
- Historical data visualization with customizable time ranges
- Support for 10+ major cryptocurrencies (Bitcoin, Ethereum, etc.)
- Interactive charts with multiple chart types (line, bar, candlestick)
- Technical indicators and zoom/scroll functionality

### 🧠 Bias Analysis
- Psychological bias assessment questionnaire
- Trading behavior analysis
- Personal bias profiling
- Educational content on cognitive biases affecting trading decisions
- Bias detection in trading patterns

### 🎭 Sentiment Analysis
- Real-time sentiment tracking from news and social media
- News sentiment analysis from multiple crypto news sources
- Social media sentiment monitoring
- Historical sentiment trends visualization
- VADER and TextBlob sentiment analysis

### 🤖 ML Forecasting
- Multiple ML models: **LSTM**, **Random Forest**, **XGBoost**, **Ensemble**
- Technical indicator generation
- Price prediction with confidence intervals
- Model comparison and performance metrics
- Real-time forecasting capabilities

### 💰 Investment Simulator
- Virtual portfolio management
- Scenario-based trading simulations
- Bias testing environments
- Strategy backtesting capabilities
- User-specific session data persistence (saved to MongoDB)
- Real-time profit/loss tracking

### 📈 Analytics & View
- Comprehensive analytics dashboard
- Trade logs and transaction history
- Database visualization and management
- Performance metrics tracking
- User-specific trade history

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.4.4 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts, React Financial Charts
- **State Management**: React Context API
- **Authentication**: JWT tokens with localStorage persistence
- **Type Safety**: TypeScript 5

### Backend
- **Web Framework**: Flask 3.0.3 (Authentication API)
- **Legacy Framework**: Streamlit 1.46.1
- **Data Processing**: Pandas 2.3.1, NumPy 2.3.1
- **Machine Learning**: 
  - Scikit-learn 1.7.0
  - XGBoost 3.0.2
  - TensorFlow 2.14.0
- **Sentiment Analysis**: 
  - TextBlob 0.19.0
  - VADER Sentiment 3.3.2
- **Database**: 
  - MongoDB (PyMongo 4.6.0) - Primary database
  - SQLAlchemy 2.0.41 - Legacy support
- **Authentication**: 
  - PyJWT 2.9.0
  - Passlib (PBKDF2-SHA256)
- **Web Scraping**: Trafilatura 2.0.0
- **HTTP Requests**: Requests 2.32.4

### External APIs
- **Binance API**: Real-time cryptocurrency price data
- **Finnhub API**: Stock market data
- **CoinGecko API**: Cryptocurrency market data (legacy)
- **News APIs**: CoinDesk, CoinTelegraph, CryptoSlate, Bitcoin.com, Decrypt

## 🏗️ Architecture

### System Components

```
NeuroCrypt/
├── neurocrypt-react/          # Next.js Frontend Application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   ├── dashboard/     # User dashboard
│   │   │   ├── market-data/   # Market data page
│   │   │   ├── bias-analysis/ # Bias analysis (protected)
│   │   │   ├── sentiment-analysis/ # Sentiment analysis (protected)
│   │   │   ├── ml-forecasting/ # ML forecasting (protected)
│   │   │   ├── investment-simulator/ # Investment simulator (protected)
│   │   │   ├── analytics/     # Analytics (protected)
│   │   │   └── view/          # View page (protected)
│   │   ├── components/        # React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MarketData.tsx
│   │   │   ├── BiasAnalysis.tsx
│   │   │   ├── SentimentAnalysis.tsx
│   │   │   ├── MLForecasting.tsx
│   │   │   ├── InvestmentSimulator.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── View.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.tsx # Authentication context
│   │   └── lib/               # Utilities
│   │       ├── auth.ts        # Authentication helpers
│   │       └── api.ts         # API helpers
│   └── package.json
│
└── backend/                   # Python Backend
    ├── auth_api.py            # Flask Authentication API
    ├── app.py                 # Streamlit app (legacy)
    ├── simulator_api.py       # Simulator API
    ├── utils/
    │   └── utils/
    │       ├── data_fetcher.py      # Market data fetching
    │       ├── ml_models.py         # ML models
    │       ├── sentiment_analyzer.py # Sentiment analysis
    │       ├── bias_detector.py     # Bias detection
    │       ├── news_scraper.py      # News scraping
    │       ├── mongodb_db.py        # MongoDB operations
    │       └── database.py          # Legacy database (SQLAlchemy)
    └── requirements.txt
```

### Database Schema (MongoDB)

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  username: String,
  password_hash: String,
  role: String,
  is_active: Boolean,
  created_at: DateTime,
  last_login: DateTime
}
```

#### Simulator States Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  account_balance: Number,
  portfolio: Array,
  trading_history: Array,
  last_updated: DateTime
}
```

#### Trading History Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  symbol: String,
  action: String, // 'buy' or 'sell'
  amount: Number,
  price: Number,
  profit_loss: Number,
  timestamp: DateTime
}
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **MongoDB** (running locally or connection string)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zainkhalid10/Neuro-Crypt.git
   cd Neuro-Crypt
   ```

2. **Set up the Frontend**
   ```bash
   cd neurocrypt-react
   npm install
   ```

3. **Set up the Backend**
   ```bash
   cd ../backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**

   Create `neurocrypt-react/.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5002
   NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key
   ```

   Create `backend/.env` (optional):
   ```env
   MONGODB_URI=mongodb://localhost:27017/neurocrypt
   AUTH_API_PORT=5002
   ```

5. **Start MongoDB**
   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Or run manually
   mongod --config /opt/homebrew/etc/mongod.conf
   ```

6. **Run the Application**

   **Terminal 1 - Backend (Flask Auth API)**
   ```bash
   cd backend
   source .venv/bin/activate
   AUTH_API_PORT=5002 python auth_api.py
   ```

   **Terminal 2 - Frontend (Next.js)**
   ```bash
   cd neurocrypt-react
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000 (or 3001 if 3000 is occupied)
   - Auth API: http://localhost:5002

## 📡 API Endpoints

### Authentication Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - User logout

### User Data Endpoints

- `GET /auth/dashboard` - Get user dashboard summary
- `GET /auth/trades` - Get user trading history
- `GET /auth/simulator-state` - Get user simulator state
- `POST /auth/simulator-state` - Save user simulator state
- `DELETE /auth/simulator-state` - Delete user simulator state

## 🔒 Security Features

- **Password Hashing**: PBKDF2-SHA256 (no length restrictions)
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Frontend route protection
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Environment Variables**: Secure API key management

## 🎯 Key Features in Detail

### Market Data
- Real-time price updates (30-second intervals)
- Multiple chart types: Line, Bar, Candlestick
- Zoom and scroll functionality
- Support for crypto and stock markets
- Historical data with customizable intervals

### Bias Analysis
- Comprehensive psychological bias assessment
- Trading behavior pattern recognition
- Personalized bias profile generation
- Educational resources on cognitive biases

### Sentiment Analysis
- Multi-source sentiment aggregation
- Real-time news sentiment tracking
- Social media sentiment monitoring
- Historical sentiment trend analysis

### ML Forecasting
- Ensemble model approach for better accuracy
- Multiple time horizon predictions
- Confidence interval calculations
- Model performance comparison

### Investment Simulator
- Virtual portfolio with real-time prices
- Buy/sell operations with profit/loss tracking
- User-specific session persistence
- Trading history with detailed analytics

## 📝 Project Structure

```
NeuroCrypt/
├── .gitignore
├── README.md
├── replit.md
├── neurocrypt-react/          # Next.js frontend
│   ├── src/
│   │   ├── app/              # Pages
│   │   ├── components/       # React components
│   │   ├── context/          # Context providers
│   │   └── lib/              # Utilities
│   ├── public/               # Static assets
│   └── package.json
└── backend/                  # Python backend
    ├── auth_api.py          # Flask auth API
    ├── app.py               # Streamlit app
    ├── utils/                # Utility modules
    └── requirements.txt
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Zain Khalid** - [@zainkhalid10](https://github.com/zainkhalid10)

## 🙏 Acknowledgments

- Binance API for cryptocurrency data
- Finnhub for stock market data
- Next.js and React communities
- Python data science ecosystem

## 🔮 Future Enhancements

- [ ] Real-time WebSocket connections for live data
- [ ] Mobile app (React Native)
- [ ] Advanced portfolio analytics
- [ ] Social trading features
- [ ] AI-powered trading recommendations
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Export trading reports (PDF/CSV)
- [ ] Advanced risk management tools
- [ ] Integration with more exchanges

## 📞 Support

For support, email of.mzain@gmail.com or open an issue in the repository.

---

**Made with ❤️ for the crypto trading community**


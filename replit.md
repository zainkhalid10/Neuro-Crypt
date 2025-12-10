# NeuroCrypt - Behavioral Crypto Analytics

## Overview

NeuroCrypt is a comprehensive behavioral cryptocurrency analytics platform that combines psychology, sentiment analysis, and machine learning to provide insights for crypto trading decisions. The application integrates real-time market data, psychological bias detection, sentiment analysis, ML forecasting, and investment simulation to help users make more informed trading decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Database Integration (2025-01-15)**: Added comprehensive PostgreSQL database functionality with SQLAlchemy ORM
  - Created database schema for market data, sentiment analysis, trading simulations, ML predictions, and bias assessments
  - Integrated database saving across all major components
  - Added Database Analytics page for data visualization and management
  - Fixed TensorFlow compatibility issues with proper error handling

## System Architecture

### Frontend Architecture
- **Framework**: Streamlit-based web application with multi-page navigation
- **UI Components**: Custom CSS styling with NeuroCrypt branding using orange gradient themes
- **Visualization**: Plotly for interactive charts and graphs
- **Layout**: Wide layout with expandable sidebar for controls and navigation

### Backend Architecture
- **Core Framework**: Python-based modular architecture
- **Data Processing**: Pandas for data manipulation and NumPy for numerical operations
- **API Integration**: RESTful API calls to external services with rate limiting
- **ML Pipeline**: Scikit-learn, XGBoost, and TensorFlow for predictive modeling
- **Sentiment Processing**: TextBlob and VADER for natural language sentiment analysis

### Key Components

#### 1. Market Data Module (`pages/1_Market_Data.py`)
- Real-time cryptocurrency price and volume data
- Historical data visualization with customizable time ranges
- Support for 10+ major cryptocurrencies
- Interactive charts with technical indicators

#### 2. Bias Analysis Module (`pages/2_Bias_Analysis.py`)
- Psychological bias assessment questionnaire
- Trading behavior analysis
- Personal bias profiling
- Educational content on cognitive biases

#### 3. Sentiment Analysis Module (`pages/3_Sentiment_Analysis.py`)
- Real-time sentiment tracking
- News sentiment analysis
- Social media sentiment monitoring
- Historical sentiment trends

#### 4. ML Forecasting Module (`pages/4_ML_Forecasting.py`)
- Multiple ML models: LSTM, Random Forest, XGBoost, Ensemble
- Technical indicator generation
- Price prediction with confidence intervals
- Model comparison and performance metrics

#### 5. Investment Simulator (`pages/5_Investment_Simulator.py`)
- Virtual portfolio management
- Scenario-based trading simulations
- Bias testing environments
- Strategy backtesting capabilities
- Database integration for trading history persistence

#### 6. Database Analytics (`pages/6_Database_Analytics.py`)
- Comprehensive database visualization and management
- Market data analytics and historical trends
- Sentiment analysis data exploration
- Trading simulation history and performance metrics
- ML prediction tracking and model comparison
- Bias assessment results and patterns

## Data Flow

1. **Data Ingestion**: External APIs fetch real-time crypto data, news, and social media content
2. **Data Processing**: Raw data is cleaned, normalized, and enhanced with technical indicators
3. **Analysis Layer**: Multiple analysis engines process data for bias detection, sentiment scoring, and ML predictions
4. **Visualization**: Processed data is presented through interactive Plotly charts and Streamlit components
5. **User Interaction**: Users interact with controls and receive real-time feedback through the web interface

## External Dependencies

### APIs and Data Sources
- **CoinGecko API**: Primary source for cryptocurrency market data
- **News APIs**: Multiple crypto news sources (CoinDesk, CoinTelegraph, CryptoSlate, Bitcoin.com, Decrypt)
- **Social Media APIs**: Twitter/X and Reddit for sentiment analysis

### Python Libraries
- **Web Framework**: Streamlit for UI, Plotly for visualization
- **Data Processing**: Pandas, NumPy for data manipulation
- **Machine Learning**: Scikit-learn, XGBoost, TensorFlow/Keras
- **Sentiment Analysis**: TextBlob, VADER Sentiment
- **Web Scraping**: Trafilatura for content extraction
- **HTTP Requests**: Requests library with rate limiting

### Database Architecture
- **Database**: PostgreSQL with SQLAlchemy ORM (fallback to SQLite)
- **Tables**:
  - `market_data`: Real-time cryptocurrency price and volume data
  - `sentiment_data`: News and social media sentiment analysis results
  - `trading_simulations`: Virtual trading records with bias analysis
  - `ml_predictions`: Machine learning model predictions and performance metrics
  - `bias_assessments`: Psychological bias assessment results
  - `users`: User profiles and preferences (ready for future authentication)
- **Database Manager**: Centralized database operations with error handling and connection management

### Environment Variables
- API keys for various services (CoinGecko, news sources, social media)
- Configuration parameters for rate limiting and data sources
- Database connection strings (DATABASE_URL, PGHOST, PGUSER, PGPASSWORD, etc.)

## Key Architectural Decisions

### 1. Modular Page Structure
- **Problem**: Need for organized, scalable UI with distinct functional areas
- **Solution**: Streamlit multi-page application with separate modules for each major feature
- **Benefits**: Clear separation of concerns, easier maintenance, better user experience

### 2. Utility-Based Backend Architecture
- **Problem**: Avoid code duplication and maintain clean separation between UI and business logic
- **Solution**: Centralized utility modules for data fetching, ML models, sentiment analysis, and bias detection
- **Benefits**: Reusable components, easier testing, cleaner codebase

### 3. External API Integration Strategy
- **Problem**: Reliable data access with rate limiting and error handling
- **Solution**: Centralized DataFetcher class with built-in rate limiting and error handling
- **Benefits**: Consistent API usage, reduced risk of rate limiting, better error recovery

### 4. Multi-Model ML Approach
- **Problem**: Single ML models may not capture market complexity
- **Solution**: Ensemble approach with multiple algorithms (LSTM, Random Forest, XGBoost)
- **Benefits**: Better prediction accuracy, model comparison capabilities, reduced overfitting risk

### 5. Session State Management
- **Problem**: Need to maintain user state across page navigation
- **Solution**: Streamlit session state for portfolio data and user preferences
- **Benefits**: Persistent user experience, ability to maintain complex state

## Deployment Strategy

### Development Environment
- Local development with Streamlit server
- Environment variables for API keys and configuration
- Modular structure allows for easy testing of individual components

### Production Considerations
- Streamlit Cloud or similar platform deployment
- Environment variable management for API keys
- Caching strategies for expensive operations (ML model loading, data fetching)
- Rate limiting compliance for external APIs

### Scalability Approach
- Modular architecture supports horizontal scaling
- Caching mechanisms reduce external API calls
- Session state management allows for user-specific data persistence
- Component-based structure enables selective feature deployment

## Security Considerations

- API key management through environment variables
- Rate limiting to prevent API abuse
- Input validation for user-provided data
- Secure handling of financial simulation data

## Future Enhancement Opportunities

- Database integration for historical data storage
- User authentication and personalized profiles
- Advanced ML model deployment and versioning
- Real-time alerting system
- Mobile-responsive design improvements
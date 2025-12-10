import os
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy import inspect, text, or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import json
from passlib.context import CryptContext

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    password_hash = Column(String(255), nullable=False, default='')
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    role = Column(String(20), default='user')
    bias_profile = Column(Text)  # JSON string of bias scores
    risk_tolerance = Column(String(20))  # 'low', 'medium', 'high'
    trading_experience = Column(String(20))  # 'beginner', 'intermediate', 'advanced'

class MarketData(Base):
    __tablename__ = 'market_data'
    
    id = Column(Integer, primary_key=True)
    crypto_symbol = Column(String(10), nullable=False)
    price = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    market_cap = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    price_change_24h = Column(Float)
    volume_change_24h = Column(Float)

class SentimentData(Base):
    __tablename__ = 'sentiment_data'
    
    id = Column(Integer, primary_key=True)
    crypto_symbol = Column(String(10), nullable=False)
    source = Column(String(50), nullable=False)  # 'news', 'social', 'reddit', 'twitter'
    sentiment_score = Column(Float, nullable=False)
    sentiment_label = Column(String(20))  # 'positive', 'negative', 'neutral'
    article_title = Column(String(200))
    article_content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

class TradingSimulation(Base):
    __tablename__ = 'trading_simulations'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)  # Link to user if authentication is added
    crypto_symbol = Column(String(10), nullable=False)
    action = Column(String(10), nullable=False)  # 'buy', 'sell'
    amount = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    emotional_state = Column(String(20))
    bias_factors = Column(Text)  # JSON string of bias influences
    timestamp = Column(DateTime, default=datetime.utcnow)
    profit_loss = Column(Float)

class MLPredictions(Base):
    __tablename__ = 'ml_predictions'
    
    id = Column(Integer, primary_key=True)
    crypto_symbol = Column(String(10), nullable=False)
    model_type = Column(String(50), nullable=False)  # 'random_forest', 'xgboost', 'lstm', 'ensemble'
    predicted_price = Column(Float, nullable=False)
    confidence_score = Column(Float)
    prediction_days = Column(Integer)
    actual_price = Column(Float)  # To be filled later for model evaluation
    timestamp = Column(DateTime, default=datetime.utcnow)
    model_metrics = Column(Text)  # JSON string of model performance metrics

class BiasAssessment(Base):
    __tablename__ = 'bias_assessments'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    assessment_type = Column(String(50), nullable=False)  # 'questionnaire', 'trading_behavior'
    bias_scores = Column(Text, nullable=False)  # JSON string of bias scores
    recommendations = Column(Text)  # JSON string of recommendations
    timestamp = Column(DateTime, default=datetime.utcnow)

class DatabaseManager:
    def __init__(self):
        self.engine = None
        self.Session = None
        # Use PBKDF2-SHA256 to avoid bcrypt's 72-byte password limit.
        self.pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
        self.init_database()
    
    def init_database(self):
        """Initialize database connection and create tables"""
        try:
            if DATABASE_URL:
                # Use PostgreSQL
                self.engine = create_engine(DATABASE_URL)
                print("Using PostgreSQL database")
            else:
                # Fallback to SQLite
                self.engine = create_engine('sqlite:///neurocrypt.db')
                print("Using SQLite database")
            
            Base.metadata.create_all(self.engine)
            self.Session = sessionmaker(bind=self.engine)
            self._ensure_user_table_columns()
            print("Database initialized successfully")
        except Exception as e:
            print(f"Database initialization error: {str(e)}")
            # Fallback to SQLite if PostgreSQL fails
            self.engine = create_engine('sqlite:///neurocrypt.db')
            Base.metadata.create_all(self.engine)
            self.Session = sessionmaker(bind=self.engine)
            self._ensure_user_table_columns()
            print("Fallback to SQLite database")

    def _ensure_user_table_columns(self):
        """Ensure new auth columns exist when migrating older databases."""
        try:
            inspector = inspect(self.engine)
            columns = {col['name'] for col in inspector.get_columns('users')}
            with self.engine.connect() as conn:
                if 'password_hash' not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) DEFAULT ''"))
                if 'is_active' not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"))
                if 'last_login' not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
                if 'role' not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'"))
            print("User table columns verified")
        except Exception as e:
            # In SQLite the ALTER TABLE statements above will succeed even if columns exist,
            # but in case of errors we log and continue so legacy databases still function.
            print(f"User table migration warning: {str(e)}")
    
    def get_session(self):
        """Get database session"""
        return self.Session()

    # --- Authentication helpers ---
    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password or "")

    def verify_password(self, plain_password: str, password_hash: str) -> bool:
        try:
            return self.pwd_context.verify(
                plain_password or "", password_hash
            )
        except Exception:
            return False

    def create_user(self, username: str, email: str, password: str, **extra_fields):
        """Create a new user with hashed password."""
        session = self.get_session()
        try:
            existing = session.query(User).filter(
                or_(User.email == email, User.username == username)
            ).first()
            if existing:
                raise ValueError("User with that email or username already exists.")
            
            user = User(
                username=username,
                email=email.lower(),
                password_hash=self.hash_password(password),
                bias_profile=extra_fields.get('bias_profile'),
                risk_tolerance=extra_fields.get('risk_tolerance'),
                trading_experience=extra_fields.get('trading_experience'),
                role=extra_fields.get('role', 'user'),
                is_active=extra_fields.get('is_active', True)
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
        except IntegrityError as exc:
            session.rollback()
            raise ValueError("Unable to create user - integrity error.") from exc
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_user_by_email(self, email: str):
        session = self.get_session()
        try:
            return session.query(User).filter(User.email == email.lower()).first()
        finally:
            session.close()

    def get_user_by_id(self, user_id: int):
        session = self.get_session()
        try:
            return session.query(User).filter(User.id == user_id).first()
        finally:
            session.close()

    def authenticate_user(self, email: str, password: str):
        user = self.get_user_by_email(email)
        if user and self.verify_password(password, user.password_hash):
            self.update_last_login(user.id)
            return user
        return None

    def update_last_login(self, user_id: int):
        session = self.get_session()
        try:
            session.query(User).filter(User.id == user_id).update(
                {"last_login": datetime.utcnow()}
            )
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def serialize_user(self, user):
        if not user:
            return None
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'risk_tolerance': user.risk_tolerance,
            'trading_experience': user.trading_experience,
            'bias_profile': json.loads(user.bias_profile) if user.bias_profile else None,
            'role': user.role,
            'is_active': user.is_active,
            'last_login': user.last_login.isoformat() if user.last_login else None
        }
    
    def save_market_data(self, crypto_symbol, price, volume, market_cap=None, price_change_24h=None, volume_change_24h=None):
        """Save market data to database"""
        session = self.get_session()
        try:
            market_data = MarketData(
                crypto_symbol=crypto_symbol,
                price=price,
                volume=volume,
                market_cap=market_cap,
                price_change_24h=price_change_24h,
                volume_change_24h=volume_change_24h
            )
            session.add(market_data)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            print(f"Error saving market data: {str(e)}")
            return False
        finally:
            session.close()
    
    def save_sentiment_data(self, crypto_symbol, source, sentiment_score, sentiment_label, article_title=None, article_content=None):
        """Save sentiment data to database"""
        session = self.get_session()
        try:
            sentiment_data = SentimentData(
                crypto_symbol=crypto_symbol,
                source=source,
                sentiment_score=sentiment_score,
                sentiment_label=sentiment_label,
                article_title=article_title,
                article_content=article_content
            )
            session.add(sentiment_data)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            print(f"Error saving sentiment data: {str(e)}")
            return False
        finally:
            session.close()
    
    def save_trading_simulation(self, crypto_symbol, action, amount, price, emotional_state, bias_factors, profit_loss=None):
        """Save trading simulation to database"""
        session = self.get_session()
        try:
            trading_sim = TradingSimulation(
                crypto_symbol=crypto_symbol,
                action=action,
                amount=amount,
                price=price,
                emotional_state=emotional_state,
                bias_factors=json.dumps(bias_factors) if isinstance(bias_factors, dict) else bias_factors,
                profit_loss=profit_loss
            )
            session.add(trading_sim)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            print(f"Error saving trading simulation: {str(e)}")
            return False
        finally:
            session.close()
    
    def save_ml_prediction(self, crypto_symbol, model_type, predicted_price, confidence_score, prediction_days, model_metrics):
        """Save ML prediction to database"""
        session = self.get_session()
        try:
            ml_prediction = MLPredictions(
                crypto_symbol=crypto_symbol,
                model_type=model_type,
                predicted_price=predicted_price,
                confidence_score=confidence_score,
                prediction_days=prediction_days,
                model_metrics=json.dumps(model_metrics) if isinstance(model_metrics, dict) else model_metrics
            )
            session.add(ml_prediction)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            print(f"Error saving ML prediction: {str(e)}")
            return False
        finally:
            session.close()
    
    def save_bias_assessment(self, assessment_type, bias_scores, recommendations):
        """Save bias assessment to database"""
        session = self.get_session()
        try:
            bias_assessment = BiasAssessment(
                assessment_type=assessment_type,
                bias_scores=json.dumps(bias_scores) if isinstance(bias_scores, dict) else bias_scores,
                recommendations=json.dumps(recommendations) if isinstance(recommendations, dict) else recommendations
            )
            session.add(bias_assessment)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            print(f"Error saving bias assessment: {str(e)}")
            return False
        finally:
            session.close()
    
    def get_historical_market_data(self, crypto_symbol, days=30):
        """Get historical market data from database"""
        session = self.get_session()
        try:
            query = session.query(MarketData).filter(
                MarketData.crypto_symbol == crypto_symbol
            ).order_by(MarketData.timestamp.desc()).limit(days * 24)  # Assuming hourly data
            
            results = query.all()
            return [{
                'timestamp': result.timestamp,
                'price': result.price,
                'volume': result.volume,
                'market_cap': result.market_cap,
                'price_change_24h': result.price_change_24h
            } for result in results]
        except Exception as e:
            print(f"Error fetching historical market data: {str(e)}")
            return []
        finally:
            session.close()
    
    def get_sentiment_history(self, crypto_symbol, days=7):
        """Get sentiment history from database"""
        session = self.get_session()
        try:
            query = session.query(SentimentData).filter(
                SentimentData.crypto_symbol == crypto_symbol
            ).order_by(SentimentData.timestamp.desc()).limit(days * 10)  # Multiple entries per day
            
            results = query.all()
            return [{
                'timestamp': result.timestamp,
                'source': result.source,
                'sentiment_score': result.sentiment_score,
                'sentiment_label': result.sentiment_label,
                'article_title': result.article_title
            } for result in results]
        except Exception as e:
            print(f"Error fetching sentiment history: {str(e)}")
            return []
        finally:
            session.close()
    
    def get_trading_history(self, user_id=None, crypto_symbol=None, days=30):
        """Get trading simulation history"""
        session = self.get_session()
        try:
            query = session.query(TradingSimulation)
            if user_id:
                query = query.filter(TradingSimulation.user_id == user_id)
            if crypto_symbol:
                query = query.filter(TradingSimulation.crypto_symbol == crypto_symbol)
            
            results = query.order_by(TradingSimulation.timestamp.desc()).limit(days * 5).all()
            return [{
                'timestamp': result.timestamp.isoformat() if result.timestamp else None,
                'crypto_symbol': result.crypto_symbol,
                'action': result.action,
                'amount': result.amount,
                'price': result.price,
                'emotional_state': result.emotional_state,
                'bias_factors': json.loads(result.bias_factors) if result.bias_factors else {},
                'profit_loss': result.profit_loss
            } for result in results]
        except Exception as e:
            print(f"Error fetching trading history: {str(e)}")
            return []
        finally:
            session.close()
    
    def get_ml_prediction_history(self, crypto_symbol, model_type=None, days=7):
        """Get ML prediction history"""
        session = self.get_session()
        try:
            query = session.query(MLPredictions).filter(
                MLPredictions.crypto_symbol == crypto_symbol
            )
            
            if model_type:
                query = query.filter(MLPredictions.model_type == model_type)
            
            results = query.order_by(MLPredictions.timestamp.desc()).limit(days * 2).all()
            return [{
                'timestamp': result.timestamp,
                'model_type': result.model_type,
                'predicted_price': result.predicted_price,
                'confidence_score': result.confidence_score,
                'prediction_days': result.prediction_days,
                'actual_price': result.actual_price,
                'model_metrics': json.loads(result.model_metrics) if result.model_metrics else {}
            } for result in results]
        except Exception as e:
            print(f"Error fetching ML prediction history: {str(e)}")
            return []
        finally:
            session.close()
    
    def get_bias_assessment_history(self, assessment_type=None, days=30):
        """Get bias assessment history"""
        session = self.get_session()
        try:
            query = session.query(BiasAssessment)
            if assessment_type:
                query = query.filter(BiasAssessment.assessment_type == assessment_type)
            
            results = query.order_by(BiasAssessment.timestamp.desc()).limit(days).all()
            return [{
                'timestamp': result.timestamp,
                'assessment_type': result.assessment_type,
                'bias_scores': json.loads(result.bias_scores) if result.bias_scores else {},
                'recommendations': json.loads(result.recommendations) if result.recommendations else {}
            } for result in results]
        except Exception as e:
            print(f"Error fetching bias assessment history: {str(e)}")
            return []
        finally:
            session.close()

# Global database manager instance
db_manager = DatabaseManager()

def get_database():
    """Get database manager instance"""
    return db_manager
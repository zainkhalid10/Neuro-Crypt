import os
from datetime import datetime
from typing import Optional, Dict, Any, List
from passlib.context import CryptContext

try:
    from pymongo import MongoClient
    from pymongo.errors import DuplicateKeyError, ConnectionFailure, ServerSelectionTimeoutError
    from bson import ObjectId
    MONGO_AVAILABLE = True
except ImportError:
    MONGO_AVAILABLE = False
    ObjectId = None
    print("PyMongo not available. Please install: pip install pymongo")

# Password hashing context
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class MongoDBManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.init_database()

    def init_database(self):
        """Initialize MongoDB connection"""
        if not MONGO_AVAILABLE:
            raise ImportError("PyMongo is required for MongoDB support")
        
        try:
            # Get MongoDB connection string from environment
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            db_name = os.getenv('MONGODB_DB_NAME', 'neurocrypt')
            
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[db_name]
            
            # Test connection
            self.client.server_info()
            print(f"Connected to MongoDB database: {db_name}")
            
            # Create indexes
            self._create_indexes()
            
        except ConnectionFailure as e:
            print(f"MongoDB connection failed: {str(e)}")
            raise
        except Exception as e:
            print(f"Error initializing MongoDB: {str(e)}")
            raise

    def _create_indexes(self):
        """Create necessary indexes for performance"""
        try:
            # Users collection indexes
            self.db.users.create_index("email", unique=True)
            self.db.users.create_index("username", unique=True)
            
            # Trading simulations indexes
            self.db.trading_simulations.create_index("user_id")
            self.db.trading_simulations.create_index("timestamp")
            self.db.trading_simulations.create_index([("user_id", 1), ("timestamp", -1)])
            
            # Market data indexes
            self.db.market_data.create_index("crypto_symbol")
            self.db.market_data.create_index("timestamp")
            
            # Sentiment data indexes
            self.db.sentiment_data.create_index("crypto_symbol")
            self.db.sentiment_data.create_index("timestamp")
            
            # ML predictions indexes
            self.db.ml_predictions.create_index("crypto_symbol")
            self.db.ml_predictions.create_index("timestamp")
            
            # Bias assessments indexes
            self.db.bias_assessments.create_index("user_id")
            self.db.bias_assessments.create_index("timestamp")
            
            # Simulator state indexes
            self.db.simulator_states.create_index("user_id", unique=True)
            self.db.simulator_states.create_index("updated_at")
            
        except Exception as e:
            print(f"Error creating indexes: {str(e)}")

    def hash_password(self, password: str) -> str:
        """Hash a password using PBKDF2"""
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)

    def create_user(self, username: str, email: str, password: str, role: str = "user") -> Dict[str, Any]:
        """Create a new user"""
        try:
            # Check if user already exists
            if self.db.users.find_one({"$or": [{"email": email.lower()}, {"username": username}]}):
                raise ValueError("User with this email or username already exists")
            
            user_doc = {
                "username": username,
                "email": email.lower(),
                "password_hash": self.hash_password(password),
                "role": role,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "last_login": None,
                "bias_profile": None,
                "risk_tolerance": None,
                "trading_experience": None
            }
            
            result = self.db.users.insert_one(user_doc)
            user_doc["id"] = str(result.inserted_id)
            user_doc.pop("password_hash", None)
            user_doc.pop("_id", None)
            return user_doc
            
        except DuplicateKeyError:
            raise ValueError("User with this email or username already exists")
        except Exception as e:
            print(f"Error creating user: {str(e)}")
            raise

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            user = self.db.users.find_one({"email": email.lower()})
            if user:
                user["id"] = str(user["_id"])
                user.pop("_id", None)
                return user
            return None
        except Exception as e:
            print(f"Error getting user by email: {str(e)}")
            return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            from bson import ObjectId
            user = self.db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                user["id"] = str(user["_id"])
                user.pop("_id", None)
                return user
            return None
        except Exception as e:
            print(f"Error getting user by id: {str(e)}")
            return None

    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate a user"""
        try:
            user = self.db.users.find_one({"email": email.lower()})
            if not user:
                return None
            
            if not self.verify_password(password, user.get("password_hash", "")):
                return None
            
            if not user.get("is_active", True):
                return None
            
            # Update last login
            from bson import ObjectId
            self.db.users.update_one(
                {"_id": ObjectId(user["_id"])},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            
            user["id"] = str(user["_id"])
            user.pop("_id", None)
            user.pop("password_hash", None)
            return user
            
        except Exception as e:
            print(f"Error authenticating user: {str(e)}")
            return None

    def serialize_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Serialize user for API response"""
        if not user:
            return {}
        
        serialized = {
            "id": user.get("id") or str(user.get("_id", "")),
            "username": user.get("username", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "user"),
            "is_active": user.get("is_active", True),
            "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
            "last_login": user.get("last_login").isoformat() if user.get("last_login") else None
        }
        
        # Remove _id if present
        serialized.pop("_id", None)
        serialized.pop("password_hash", None)
        
        return serialized

    def save_trading_simulation(self, user_id: Optional[str], crypto_symbol: str, action: str, 
                               amount: float, price: float, emotional_state: Optional[str] = None,
                               bias_factors: Optional[Dict] = None, profit_loss: Optional[float] = None) -> bool:
        """Save trading simulation to database"""
        try:
            trade_doc = {
                "user_id": ObjectId(user_id) if user_id else None,
                "crypto_symbol": crypto_symbol,
                "action": action,
                "amount": amount,
                "price": price,
                "emotional_state": emotional_state,
                "bias_factors": bias_factors or {},
                "profit_loss": profit_loss,
                "timestamp": datetime.utcnow()
            }
            
            self.db.trading_simulations.insert_one(trade_doc)
            return True
        except Exception as e:
            print(f"Error saving trading simulation: {str(e)}")
            return False

    def get_trading_history(self, user_id: Optional[str] = None, crypto_symbol: Optional[str] = None, days: int = 30) -> List[Dict[str, Any]]:
        """Get trading simulation history"""
        try:
            from datetime import timedelta
            
            query = {}
            if user_id:
                query["user_id"] = ObjectId(user_id)
            if crypto_symbol:
                query["crypto_symbol"] = crypto_symbol
            
            # Add date filter
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            query["timestamp"] = {"$gte": cutoff_date}
            
            results = self.db.trading_simulations.find(query).sort("timestamp", -1).limit(days * 5)
            
            trades = []
            for result in results:
                trade = {
                    "timestamp": result.get("timestamp").isoformat() if result.get("timestamp") else None,
                    "crypto_symbol": result.get("crypto_symbol", ""),
                    "action": result.get("action", ""),
                    "amount": result.get("amount", 0),
                    "price": result.get("price", 0),
                    "emotional_state": result.get("emotional_state"),
                    "bias_factors": result.get("bias_factors", {}),
                    "profit_loss": result.get("profit_loss")
                }
                trades.append(trade)
            
            return trades
        except Exception as e:
            print(f"Error fetching trading history: {str(e)}")
            return []

    def save_simulator_state(self, user_id: str, state: Dict[str, Any]) -> bool:
        """Save investment simulator state for a user"""
        try:
            if not user_id:
                raise ValueError("User ID is required")
            self.db.simulator_states.update_one(
                {"user_id": ObjectId(user_id)},
                {"$set": {"state": state, "updated_at": datetime.utcnow()}},
                upsert=True
            )
            return True
        except Exception as e:
            print(f"Error saving simulator state: {str(e)}")
            return False

    def get_simulator_state(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get investment simulator state for a user"""
        try:
            if not user_id:
                return None
            result = self.db.simulator_states.find_one({"user_id": ObjectId(user_id)})
            if result:
                return {
                    "state": result.get("state"),
                    "updated_at": result.get("updated_at").isoformat() if result.get("updated_at") else None
                }
            return None
        except Exception as e:
            print(f"Error fetching simulator state: {str(e)}")
            return None

    def delete_simulator_state(self, user_id: str) -> bool:
        """Delete simulator state for a user"""
        try:
            if not user_id:
                return False
            self.db.simulator_states.delete_one({"user_id": ObjectId(user_id)})
            return True
        except Exception as e:
            print(f"Error deleting simulator state: {str(e)}")
            return False

    def get_dashboard_summary(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Aggregate dashboard data for a user"""
        summary = {
            "simulator": None,
            "trades": [],
            "trade_count": 0,
            "last_trade": None
        }
        try:
            simulator_state = self.get_simulator_state(user_id)
            if simulator_state and simulator_state.get("state"):
                summary["simulator"] = simulator_state
            trades = self.get_trading_history(user_id=user_id, days=days)
            summary["trades"] = trades[:10]
            summary["trade_count"] = len(trades)
            summary["last_trade"] = trades[0] if trades else None
        except Exception as e:
            print(f"Error building dashboard summary: {str(e)}")
        return summary

    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()


# Global database manager instance
_mongo_db_manager: Optional[MongoDBManager] = None


def get_mongodb():
    """Get MongoDB manager instance"""
    global _mongo_db_manager
    if _mongo_db_manager is None:
        _mongo_db_manager = MongoDBManager()
    return _mongo_db_manager


import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')
from utils.database import get_database

# TensorFlow imports with error handling
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("TensorFlow not available. LSTM models will be disabled.")
except Exception as e:
    TENSORFLOW_AVAILABLE = False
    print(f"TensorFlow error: {str(e)}. LSTM models will be disabled.")

class CryptoPredictor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_columns = []
        
    def prepare_features(self, df):
        """Prepare technical indicators and features for ML models"""
        df = df.copy()
        
        # Technical indicators
        df['price_change'] = df['price'].pct_change()
        df['volume_change'] = df['volume'].pct_change()
        
        # Moving averages
        df['ma_7'] = df['price'].rolling(window=7).mean()
        df['ma_14'] = df['price'].rolling(window=14).mean()
        df['ma_21'] = df['price'].rolling(window=21).mean()
        
        # Relative Strength Index (RSI)
        delta = df['price'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        df['bb_middle'] = df['price'].rolling(window=20).mean()
        bb_std = df['price'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
        df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
        df['bb_position'] = (df['price'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
        
        # Volatility
        df['volatility'] = df['price'].rolling(window=14).std()
        
        # Price momentum
        df['momentum_3'] = df['price'] / df['price'].shift(3) - 1
        df['momentum_7'] = df['price'] / df['price'].shift(7) - 1
        
        # Volume indicators
        df['volume_sma'] = df['volume'].rolling(window=20).mean()
        df['volume_ratio'] = df['volume'] / df['volume_sma']
        
        # Lagged features
        for lag in [1, 2, 3, 5, 7]:
            df[f'price_lag_{lag}'] = df['price'].shift(lag)
            df[f'volume_lag_{lag}'] = df['volume'].shift(lag)
        
        # Future target (what we want to predict)
        df['target'] = df['price'].shift(-1)
        
        return df
    
    def train_ensemble_model(self, df, prediction_days=7):
        """Train ensemble model combining multiple algorithms"""
        try:
            # Prepare features
            df_features = self.prepare_features(df)
            df_features = df_features.dropna()
            
            if len(df_features) < 50:
                return None
            
            # Select feature columns
            feature_cols = [col for col in df_features.columns if col not in ['date', 'price', 'target']]
            self.feature_columns = feature_cols
            
            X = df_features[feature_cols]
            y = df_features['target']
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, shuffle=False
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train individual models
            models = {
                'rf': RandomForestRegressor(n_estimators=100, random_state=42),
                'gbr': GradientBoostingRegressor(n_estimators=100, random_state=42),
                'xgb': xgb.XGBRegressor(n_estimators=100, random_state=42)
            }
            
            predictions = {}
            model_scores = {}
            
            for name, model in models.items():
                if name == 'xgb':
                    model.fit(X_train, y_train)
                    pred = model.predict(X_test)
                else:
                    model.fit(X_train_scaled, y_train)
                    pred = model.predict(X_test_scaled)
                
                predictions[name] = pred
                model_scores[name] = r2_score(y_test, pred)
                self.models[name] = model
            
            # Ensemble prediction (weighted average)
            weights = np.array([model_scores[name] for name in models.keys()])
            weights = weights / weights.sum()  # Normalize weights
            
            ensemble_pred = np.zeros_like(list(predictions.values())[0])
            for i, (name, pred) in enumerate(predictions.items()):
                ensemble_pred += weights[i] * pred
            
            # Calculate metrics
            rmse = np.sqrt(mean_squared_error(y_test, ensemble_pred))
            mae = mean_absolute_error(y_test, ensemble_pred)
            r2 = r2_score(y_test, ensemble_pred)
            mape = np.mean(np.abs((y_test - ensemble_pred) / y_test)) * 100
            
            # Generate future predictions
            future_predictions = []
            last_features = X.iloc[-1:].values
            
            for _ in range(prediction_days):
                # Scale features for prediction
                last_features_scaled = self.scaler.transform(last_features)
                
                # Get predictions from each model
                pred_rf = self.models['rf'].predict(last_features_scaled)[0]
                pred_gbr = self.models['gbr'].predict(last_features_scaled)[0]
                pred_xgb = self.models['xgb'].predict(last_features)[0]
                
                # Ensemble prediction
                ensemble_pred_single = (
                    weights[0] * pred_rf + 
                    weights[1] * pred_gbr + 
                    weights[2] * pred_xgb
                )
                
                future_predictions.append(ensemble_pred_single)
                
                # Update features for next prediction (simplified)
                last_features = last_features.copy()
                last_features[0][0] = ensemble_pred_single  # Update price
            
            # Feature importance (from Random Forest)
            feature_importance = dict(zip(
                feature_cols, 
                self.models['rf'].feature_importances_
            ))
            
            # Calculate additional metrics
            returns = np.diff(y_test) / y_test[:-1]
            sharpe_ratio = np.mean(returns) / np.std(returns) * np.sqrt(252) if np.std(returns) > 0 else 0
            
            drawdowns = []
            peak = y_test.iloc[0]
            for price in y_test:
                if price > peak:
                    peak = price
                drawdown = (price - peak) / peak * 100
                drawdowns.append(drawdown)
            max_drawdown = min(drawdowns)
            
            return {
                'predictions': future_predictions,
                'confidence': min(r2, 0.95),  # Cap confidence at 95%
                'volatility': np.std(y_test.pct_change().dropna()) * 100,
                'rmse': rmse,
                'mae': mae,
                'r2_score': r2,
                'mape': mape,
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': abs(max_drawdown),
                'feature_importance': feature_importance,
                'model_weights': dict(zip(models.keys(), weights))
            }
            
        except Exception as e:
            print(f"Error in ensemble model training: {str(e)}")
            return None
    
    def train_lstm_model(self, df, prediction_days=7):
        """Train LSTM neural network model"""
        if not TENSORFLOW_AVAILABLE:
            return {
                'error': 'TensorFlow not available',
                'message': 'LSTM models require TensorFlow which is currently not available. Please use other models like Random Forest or XGBoost.',
                'predictions': [],
                'confidence': 0.0,
                'volatility': 0.0,
                'rmse': 0.0,
                'mae': 0.0,
                'r2_score': 0.0,
                'layers': 0,
                'neurons': 0,
                'dropout': 0.0,
                'epochs': 0,
                'train_loss': 0.0,
                'val_loss': 0.0,
                'train_time': 0.0,
                'training_history': {'loss': [], 'val_loss': []}
            }
        
        try:
            # Prepare data for LSTM
            prices = df['price'].values
            volumes = df['volume'].values
            
            # Create sequences
            sequence_length = 60
            if len(prices) < sequence_length + 10:
                return None
            
            # Normalize data
            price_scaler = StandardScaler()
            volume_scaler = StandardScaler()
            
            prices_scaled = price_scaler.fit_transform(prices.reshape(-1, 1))
            volumes_scaled = volume_scaler.fit_transform(volumes.reshape(-1, 1))
            
            # Combine features
            features = np.hstack([prices_scaled, volumes_scaled])
            
            # Create sequences
            X, y = [], []
            for i in range(sequence_length, len(features)):
                X.append(features[i-sequence_length:i])
                y.append(prices_scaled[i])
            
            X, y = np.array(X), np.array(y)
            
            # Split data
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            
            # Build LSTM model
            model = Sequential([
                LSTM(50, return_sequences=True, input_shape=(sequence_length, 2)),
                Dropout(0.2),
                LSTM(50, return_sequences=True),
                Dropout(0.2),
                LSTM(50),
                Dropout(0.2),
                Dense(25),
                Dense(1)
            ])
            
            model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
            
            # Train model
            early_stopping = EarlyStopping(patience=10, restore_best_weights=True)
            history = model.fit(
                X_train, y_train,
                batch_size=32,
                epochs=50,
                validation_data=(X_test, y_test),
                callbacks=[early_stopping],
                verbose=0
            )
            
            # Make predictions
            test_predictions = model.predict(X_test)
            
            # Inverse transform
            test_predictions_actual = price_scaler.inverse_transform(test_predictions)
            y_test_actual = price_scaler.inverse_transform(y_test)
            
            # Calculate metrics
            rmse = np.sqrt(mean_squared_error(y_test_actual, test_predictions_actual))
            mae = mean_absolute_error(y_test_actual, test_predictions_actual)
            r2 = r2_score(y_test_actual, test_predictions_actual)
            
            # Generate future predictions
            future_predictions = []
            last_sequence = features[-sequence_length:]
            
            for _ in range(prediction_days):
                pred_scaled = model.predict(last_sequence.reshape(1, sequence_length, 2))[0]
                pred_actual = price_scaler.inverse_transform(pred_scaled.reshape(-1, 1))[0][0]
                future_predictions.append(pred_actual)
                
                # Update sequence
                new_row = np.array([[pred_scaled[0], volumes_scaled[-1][0]]])
                last_sequence = np.vstack([last_sequence[1:], new_row])
            
            return {
                'predictions': future_predictions,
                'confidence': min(r2, 0.90),
                'volatility': np.std(np.diff(y_test_actual) / y_test_actual[:-1]) * 100,
                'rmse': rmse,
                'mae': mae,
                'r2_score': r2,
                'layers': 3,
                'neurons': 50,
                'dropout': 0.2,
                'epochs': len(history.history['loss']),
                'train_loss': history.history['loss'][-1],
                'val_loss': history.history['val_loss'][-1],
                'train_time': 0.0,  # Simplified
                'training_history': history.history
            }
            
        except Exception as e:
            print(f"Error in LSTM model training: {str(e)}")
            return None
    
    def train_random_forest(self, df, prediction_days=7):
        """Train Random Forest model"""
        try:
            df_features = self.prepare_features(df)
            df_features = df_features.dropna()
            
            if len(df_features) < 50:
                return None
            
            feature_cols = [col for col in df_features.columns if col not in ['date', 'price', 'target']]
            X = df_features[feature_cols]
            y = df_features['target']
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, shuffle=False
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train Random Forest
            model = RandomForestRegressor(
                n_estimators=200,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train_scaled, y_train)
            
            # Predictions
            predictions = model.predict(X_test_scaled)
            
            # Metrics
            rmse = np.sqrt(mean_squared_error(y_test, predictions))
            mae = mean_absolute_error(y_test, predictions)
            r2 = r2_score(y_test, predictions)
            
            # Future predictions
            future_predictions = []
            last_features = X.iloc[-1:].values
            
            for _ in range(prediction_days):
                last_features_scaled = self.scaler.transform(last_features)
                pred = model.predict(last_features_scaled)[0]
                future_predictions.append(pred)
                
                # Update features for next prediction
                last_features = last_features.copy()
                last_features[0][0] = pred
            
            return {
                'predictions': future_predictions,
                'confidence': min(r2, 0.85),
                'volatility': np.std(y_test.pct_change().dropna()) * 100,
                'rmse': rmse,
                'mae': mae,
                'r2_score': r2,
                'feature_importance': dict(zip(feature_cols, model.feature_importances_))
            }
            
        except Exception as e:
            print(f"Error in Random Forest training: {str(e)}")
            return None
    
    def train_xgboost(self, df, prediction_days=7):
        """Train XGBoost model"""
        try:
            df_features = self.prepare_features(df)
            df_features = df_features.dropna()
            
            if len(df_features) < 50:
                return None
            
            feature_cols = [col for col in df_features.columns if col not in ['date', 'price', 'target']]
            X = df_features[feature_cols]
            y = df_features['target']
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, shuffle=False
            )
            
            # Train XGBoost
            model = xgb.XGBRegressor(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y_train)
            
            # Predictions
            predictions = model.predict(X_test)
            
            # Metrics
            rmse = np.sqrt(mean_squared_error(y_test, predictions))
            mae = mean_absolute_error(y_test, predictions)
            r2 = r2_score(y_test, predictions)
            
            # Future predictions
            future_predictions = []
            last_features = X.iloc[-1:].values
            
            for _ in range(prediction_days):
                pred = model.predict(last_features)[0]
                future_predictions.append(pred)
                
                # Update features for next prediction
                last_features = last_features.copy()
                last_features[0][0] = pred
            
            return {
                'predictions': future_predictions,
                'confidence': min(r2, 0.90),
                'volatility': np.std(y_test.pct_change().dropna()) * 100,
                'rmse': rmse,
                'mae': mae,
                'r2_score': r2,
                'feature_importance': dict(zip(feature_cols, model.feature_importances_))
            }
            
        except Exception as e:
            print(f"Error in XGBoost training: {str(e)}")
            return None
    
    def compare_all_models(self, df, prediction_days=7):
        """Compare all models and return results"""
        results = {}
        
        # Train each model
        ensemble_result = self.train_ensemble_model(df, prediction_days)
        if ensemble_result:
            results['Ensemble'] = ensemble_result
        
        # Only train LSTM if TensorFlow is available
        if TENSORFLOW_AVAILABLE:
            lstm_result = self.train_lstm_model(df, prediction_days)
            if lstm_result and 'error' not in lstm_result:
                results['LSTM'] = lstm_result
        
        rf_result = self.train_random_forest(df, prediction_days)
        if rf_result:
            results['Random Forest'] = rf_result
        
        xgb_result = self.train_xgboost(df, prediction_days)
        if xgb_result:
            results['XGBoost'] = xgb_result
        
        return results if results else None

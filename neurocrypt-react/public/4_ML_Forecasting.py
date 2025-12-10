import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from utils.ml_models import CryptoPredictor
from utils.data_fetcher import get_historical_data
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

st.set_page_config(
    page_title="ML Forecasting - NeuroCrypt",
    page_icon="🤖",
    layout="wide"
)

st.title("🤖 Machine Learning Cryptocurrency Forecasting")

# Initialize ML predictor
@st.cache_resource
def load_predictor():
    return CryptoPredictor()

predictor = load_predictor()

# Sidebar controls
st.sidebar.header("ML Forecasting Controls")

# Model selection
model_type = st.sidebar.selectbox(
    "Select Model Type",
    ["Ensemble Model", "LSTM Neural Network", "Random Forest", "XGBoost", "All Models Comparison"]
)

# Cryptocurrency selection
crypto_options = {
    'Bitcoin': 'bitcoin',
    'Ethereum': 'ethereum',
    'Binance Coin': 'binancecoin',
    'Cardano': 'cardano',
    'Solana': 'solana'
}

selected_crypto = st.sidebar.selectbox(
    "Select Cryptocurrency",
    list(crypto_options.keys()),
    index=0
)

# Prediction timeframe
prediction_days = st.sidebar.slider(
    "Prediction Period (Days)",
    min_value=1,
    max_value=30,
    value=7
)

# Feature importance toggle
show_features = st.sidebar.checkbox("Show Feature Importance", value=True)

# Model confidence threshold
confidence_threshold = st.sidebar.slider(
    "Confidence Threshold",
    min_value=0.5,
    max_value=0.95,
    value=0.8,
    step=0.05
)

# Main content
crypto_id = crypto_options[selected_crypto]

# Load historical data for training
try:
    historical_data = get_historical_data(crypto_id, 365)  # 1 year of data
    
    if historical_data:
        # Prepare data for ML models
        price_data = [point[1] for point in historical_data['prices']]
        volume_data = [point[1] for point in historical_data['total_volumes']]
        dates = [datetime.fromtimestamp(point[0]/1000) for point in historical_data['prices']]
        
        # Create DataFrame
        df = pd.DataFrame({
            'date': dates,
            'price': price_data,
            'volume': volume_data
        })
        
        # Train models and make predictions
        if model_type == "Ensemble Model":
            st.header(f"🎯 Ensemble Model Predictions: {selected_crypto}")
            
            # Train ensemble model
            with st.spinner("Training ensemble model..."):
                ensemble_results = predictor.train_ensemble_model(df, prediction_days)
            
            if ensemble_results:
                # Display prediction results
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
                
                # Prediction chart
                st.subheader("Price Prediction Chart")
                
                fig = go.Figure()
                
                # Historical prices
                fig.add_trace(go.Scatter(
                    x=df['date'],
                    y=df['price'],
                    mode='lines',
                    name='Historical Price',
                    line=dict(color='#FF6B35', width=2)
                ))
                
                # Predictions
                future_dates = [df['date'].iloc[-1] + timedelta(days=i) for i in range(1, prediction_days + 1)]
                
                fig.add_trace(go.Scatter(
                    x=future_dates,
                    y=ensemble_results['predictions'],
                    mode='lines+markers',
                    name='Predicted Price',
                    line=dict(color='#00FF00', width=2, dash='dash')
                ))
                
                # Confidence intervals
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
                
                # Model performance metrics
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
                
                # Feature importance (if enabled)
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
            
            # Train LSTM model
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
                # Display LSTM results
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
                
                # LSTM prediction chart
                st.subheader("LSTM Price Prediction")
                
                fig = go.Figure()
                
                # Historical prices
                fig.add_trace(go.Scatter(
                    x=df['date'],
                    y=df['price'],
                    mode='lines',
                    name='Historical Price',
                    line=dict(color='#FF6B35', width=2)
                ))
                
                # LSTM predictions
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
                
                # LSTM model architecture
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
                
                # Training history
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
            
            # Train all models
            with st.spinner("Training all models... This may take a few minutes."):
                all_results = predictor.compare_all_models(df, prediction_days)
            
            if all_results:
                # Model comparison table
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
                
                # Best model recommendation
                best_model = df_comparison.loc[df_comparison['R² Score'].idxmax(), 'Model']
                st.success(f"🏆 **Best Performing Model:** {best_model}")
                
                # Predictions comparison chart
                st.subheader("Predictions Comparison")
                
                fig = go.Figure()
                
                # Historical prices
                fig.add_trace(go.Scatter(
                    x=df['date'],
                    y=df['price'],
                    mode='lines',
                    name='Historical Price',
                    line=dict(color='#FF6B35', width=2)
                ))
                
                # All model predictions
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
                
                # Model accuracy over time
                st.subheader("Model Accuracy Analysis")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    # Accuracy by model
                    accuracy_data = [(model, results['r2_score']) for model, results in all_results.items()]
                    df_accuracy = pd.DataFrame(accuracy_data, columns=['Model', 'R² Score'])
                    
                    fig_accuracy = px.bar(df_accuracy, x='Model', y='R² Score',
                                        title="Model Accuracy Comparison")
                    st.plotly_chart(fig_accuracy, use_container_width=True)
                
                with col2:
                    # Prediction variance
                    predictions = [results['predictions'][-1] for results in all_results.values()]
                    variance = np.var(predictions)
                    mean_pred = np.mean(predictions)
                    
                    st.metric("Prediction Variance", f"{variance:.2f}")
                    st.metric("Mean Prediction", f"${mean_pred:.2f}")
                    st.metric("Prediction Std", f"{np.std(predictions):.2f}")
        
        else:
            # Individual model types (Random Forest, XGBoost)
            st.header(f"📈 {model_type} Predictions: {selected_crypto}")
            
            with st.spinner(f"Training {model_type.lower()}..."):
                if model_type == "Random Forest":
                    results = predictor.train_random_forest(df, prediction_days)
                elif model_type == "XGBoost":
                    results = predictor.train_xgboost(df, prediction_days)
            
            if results:
                # Display results similar to ensemble model
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
                
                # Prediction chart
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

# Model insights and recommendations
st.header("🔍 Model Insights & Recommendations")

insights = [
    "🎯 **Ensemble Advantage**: Ensemble models typically provide more stable predictions by combining multiple algorithms.",
    "🧠 **LSTM Strengths**: Neural networks excel at capturing complex temporal patterns in cryptocurrency data.",
    "⚡ **Speed vs Accuracy**: Random Forest offers fast predictions while XGBoost provides high accuracy.",
    "📊 **Feature Engineering**: Technical indicators, sentiment scores, and market data improve prediction accuracy.",
    "⚠️ **Volatility Warning**: Cryptocurrency markets are highly volatile; use predictions as guidance, not certainty.",
    "🔄 **Model Retraining**: Models should be retrained regularly with new data to maintain accuracy."
]

for insight in insights:
    st.info(insight)

# Risk disclaimer
st.warning("""
**Risk Disclaimer**: These predictions are based on historical data and mathematical models. 
Cryptocurrency markets are highly volatile and unpredictable. Never invest more than you can afford to lose, 
and always do your own research before making investment decisions.
""")

# Footer
st.markdown("---")
st.markdown(f"**Model Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | **Data Points Used:** {len(df) if 'df' in locals() else 'N/A'}")

import requests
import os
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import re
import time

class SentimentAnalyzer:
    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        self.crypto_keywords = {
            'bitcoin': ['bitcoin', 'btc', 'satoshi'],
            'ethereum': ['ethereum', 'eth', 'vitalik'],
            'binancecoin': ['binance', 'bnb', 'binance coin'],
            'cardano': ['cardano', 'ada', 'charles hoskinson'],
            'solana': ['solana', 'sol', 'phantom'],
            'polkadot': ['polkadot', 'dot', 'kusama'],
            'dogecoin': ['dogecoin', 'doge', 'elon musk'],
            'polygon': ['polygon', 'matic', 'layer 2'],
            'avalanche': ['avalanche', 'avax', 'subnet'],
            'chainlink': ['chainlink', 'link', 'oracle']
        }
        
    def analyze_text(self, text):
        """Analyze sentiment of given text using multiple methods"""
        if not text or len(text.strip()) == 0:
            return 0.0
            
        try:
            # Clean text
            text = self.clean_text(text)
            
            # TextBlob analysis
            blob = TextBlob(text)
            textblob_score = blob.sentiment.polarity
            
            # VADER analysis
            vader_scores = self.vader_analyzer.polarity_scores(text)
            vader_score = vader_scores['compound']
            
            # Combine scores (weighted average)
            combined_score = (textblob_score * 0.4) + (vader_score * 0.6)
            
            # Apply crypto-specific adjustments
            crypto_adjustment = self.get_crypto_sentiment_adjustment(text)
            final_score = combined_score + crypto_adjustment
            
            # Normalize to [-1, 1] range
            return max(-1.0, min(1.0, final_score))
            
        except Exception as e:
            print(f"Error in sentiment analysis: {str(e)}")
            return 0.0
    
    def clean_text(self, text):
        """Clean and preprocess text for sentiment analysis"""
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove mentions and hashtags symbols but keep the words
        text = re.sub(r'[@#]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def get_crypto_sentiment_adjustment(self, text):
        """Apply crypto-specific sentiment adjustments"""
        text_lower = text.lower()
        adjustment = 0.0
        
        # Positive crypto terms
        positive_terms = ['moon', 'bullish', 'hodl', 'diamond hands', 'to the moon', 'pump', 'rally', 'surge']
        for term in positive_terms:
            if term in text_lower:
                adjustment += 0.1
        
        # Negative crypto terms
        negative_terms = ['dump', 'bearish', 'crash', 'fud', 'rugpull', 'scam', 'panic sell', 'rekt']
        for term in negative_terms:
            if term in text_lower:
                adjustment -= 0.1
        
        # Neutral but important terms
        neutral_terms = ['dip', 'volatility', 'correction', 'consolidation']
        for term in neutral_terms:
            if term in text_lower:
                adjustment += 0.05  # Slight positive as they indicate normal market behavior
        
        return max(-0.3, min(0.3, adjustment))
    
    def get_sentiment_label(self, score):
        """Convert sentiment score to label"""
        if score > 0.1:
            return "Positive"
        elif score < -0.1:
            return "Negative"
        else:
            return "Neutral"
    
    def get_current_sentiment(self, crypto_name):
        """Get current sentiment for a cryptocurrency"""
        try:
            # In a real implementation, this would fetch from news APIs, social media APIs, etc.
            # For now, we'll simulate real-time sentiment analysis
            
            # Simulate news sentiment
            news_sentiment = self.simulate_news_sentiment(crypto_name)
            
            # Simulate social media sentiment
            social_sentiment = self.simulate_social_sentiment(crypto_name)
            
            # Calculate overall sentiment
            overall_score = (news_sentiment * 0.4) + (social_sentiment * 0.6)
            
            # Simulate fear & greed index
            fear_greed_index = self.simulate_fear_greed_index(crypto_name)
            
            return {
                'overall_score': overall_score,
                'news_sentiment': news_sentiment,
                'social_sentiment': social_sentiment,
                'fear_greed_index': fear_greed_index,
                'timestamp': datetime.now()
            }
            
        except Exception as e:
            print(f"Error getting current sentiment: {str(e)}")
            return {
                'overall_score': 0.0,
                'news_sentiment': 0.0,
                'social_sentiment': 0.0,
                'fear_greed_index': 50,
                'timestamp': datetime.now()
            }
    
    def simulate_news_sentiment(self, crypto_name):
        """Simulate news sentiment analysis"""
        # This would typically fetch from news APIs
        # For now, generate realistic sentiment based on current market conditions
        
        # Simulate different news sources with varying sentiment
        news_sources = {
            'coindesk': np.random.normal(0.05, 0.2),
            'cointelegraph': np.random.normal(0.1, 0.15),
            'cryptoslate': np.random.normal(-0.02, 0.18),
            'bitcoin_com': np.random.normal(0.08, 0.16),
            'decrypt': np.random.normal(0.03, 0.14)
        }
        
        # Weight by source credibility
        weights = {
            'coindesk': 0.25,
            'cointelegraph': 0.20,
            'cryptoslate': 0.15,
            'bitcoin_com': 0.20,
            'decrypt': 0.20
        }
        
        weighted_sentiment = sum(sentiment * weights[source] for source, sentiment in news_sources.items())
        
        return max(-1.0, min(1.0, weighted_sentiment))
    
    def simulate_social_sentiment(self, crypto_name):
        """Simulate social media sentiment analysis"""
        # This would typically use Twitter API, Reddit API, etc.
        
        # Simulate different social media platforms
        social_platforms = {
            'twitter': np.random.normal(0.02, 0.25),
            'reddit': np.random.normal(-0.05, 0.20),
            'telegram': np.random.normal(0.15, 0.30),
            'discord': np.random.normal(0.01, 0.18),
            'youtube': np.random.normal(0.08, 0.22)
        }
        
        # Weight by platform influence
        weights = {
            'twitter': 0.30,
            'reddit': 0.25,
            'telegram': 0.20,
            'discord': 0.10,
            'youtube': 0.15
        }
        
        weighted_sentiment = sum(sentiment * weights[platform] for platform, sentiment in social_platforms.items())
        
        return max(-1.0, min(1.0, weighted_sentiment))
    
    def simulate_fear_greed_index(self, crypto_name):
        """Simulate fear & greed index"""
        # This would typically use actual Fear & Greed Index API
        
        # Generate realistic fear & greed values
        base_value = 50
        volatility = np.random.normal(0, 15)
        
        # Adjust based on simulated market conditions
        market_condition = np.random.choice(['bull', 'bear', 'neutral'], p=[0.3, 0.2, 0.5])
        
        if market_condition == 'bull':
            base_value += 20
        elif market_condition == 'bear':
            base_value -= 20
        
        fear_greed = base_value + volatility
        
        return max(0, min(100, int(fear_greed)))
    
    def get_historical_sentiment(self, crypto_name, days):
        """Get historical sentiment data"""
        try:
            historical_data = []
            end_date = datetime.now()
            
            for i in range(days):
                date = end_date - timedelta(days=i)
                
                # Simulate historical sentiment with some trend
                base_sentiment = np.random.normal(0.05, 0.15)
                
                # Add some trend based on date
                trend_factor = np.sin(i * 0.1) * 0.1
                sentiment_score = base_sentiment + trend_factor
                
                historical_data.append({
                    'date': date,
                    'sentiment_score': max(-1.0, min(1.0, sentiment_score)),
                    'volume': np.random.randint(100, 1000),
                    'source_count': np.random.randint(5, 50)
                })
            
            return sorted(historical_data, key=lambda x: x['date'])
            
        except Exception as e:
            print(f"Error getting historical sentiment: {str(e)}")
            return []
    
    def get_social_sentiment(self, crypto_name, platforms, timeframe):
        """Get social media sentiment for specific platforms"""
        try:
            social_data = {}
            
            for platform in platforms:
                # Simulate platform-specific sentiment
                if platform.lower() == 'twitter':
                    sentiment = np.random.normal(0.1, 0.2)
                    mentions = np.random.randint(500, 5000)
                    engagement = np.random.uniform(2.0, 8.0)
                    
                elif platform.lower() == 'reddit':
                    sentiment = np.random.normal(-0.05, 0.18)
                    mentions = np.random.randint(100, 1000)
                    engagement = np.random.uniform(1.5, 6.0)
                    
                elif platform.lower() == 'telegram':
                    sentiment = np.random.normal(0.2, 0.25)
                    mentions = np.random.randint(50, 500)
                    engagement = np.random.uniform(3.0, 10.0)
                    
                elif platform.lower() == 'discord':
                    sentiment = np.random.normal(0.05, 0.15)
                    mentions = np.random.randint(20, 200)
                    engagement = np.random.uniform(2.5, 7.0)
                    
                elif platform.lower() == 'youtube':
                    sentiment = np.random.normal(0.08, 0.20)
                    mentions = np.random.randint(10, 100)
                    engagement = np.random.uniform(1.0, 5.0)
                    
                else:
                    sentiment = np.random.normal(0.0, 0.15)
                    mentions = np.random.randint(50, 500)
                    engagement = np.random.uniform(2.0, 6.0)
                
                social_data[platform.lower()] = {
                    'sentiment': max(-1.0, min(1.0, sentiment)),
                    'mentions': mentions,
                    'engagement': engagement,
                    'influence': np.random.uniform(0.1, 1.0)
                }
            
            return social_data
            
        except Exception as e:
            print(f"Error getting social sentiment: {str(e)}")
            return {}
    
    def analyze_sentiment_correlation(self, crypto_name, price_data):
        """Analyze correlation between sentiment and price movements"""
        try:
            # Get historical sentiment
            sentiment_data = self.get_historical_sentiment(crypto_name, len(price_data))
            
            if not sentiment_data or len(sentiment_data) != len(price_data):
                return None
            
            # Calculate correlation
            sentiment_scores = [data['sentiment_score'] for data in sentiment_data]
            price_changes = [price_data[i] - price_data[i-1] if i > 0 else 0 for i in range(len(price_data))]
            
            correlation = np.corrcoef(sentiment_scores, price_changes)[0, 1]
            
            return {
                'correlation': correlation,
                'sentiment_mean': np.mean(sentiment_scores),
                'sentiment_std': np.std(sentiment_scores),
                'price_volatility': np.std(price_changes),
                'analysis': self.interpret_correlation(correlation)
            }
            
        except Exception as e:
            print(f"Error analyzing sentiment correlation: {str(e)}")
            return None
    
    def interpret_correlation(self, correlation):
        """Interpret correlation coefficient"""
        if correlation > 0.7:
            return "Strong positive correlation - sentiment strongly predicts price movements"
        elif correlation > 0.3:
            return "Moderate positive correlation - sentiment has some predictive power"
        elif correlation > -0.3:
            return "Weak correlation - sentiment has limited predictive power"
        elif correlation > -0.7:
            return "Moderate negative correlation - sentiment moves opposite to price"
        else:
            return "Strong negative correlation - sentiment strongly contrarian to price"
    
    def get_sentiment_alerts(self, crypto_name, threshold=0.7):
        """Get sentiment-based alerts"""
        try:
            current_sentiment = self.get_current_sentiment(crypto_name)
            
            alerts = []
            
            # Extreme sentiment alerts
            if abs(current_sentiment['overall_score']) > threshold:
                direction = "extremely positive" if current_sentiment['overall_score'] > 0 else "extremely negative"
                alerts.append({
                    'type': 'extreme_sentiment',
                    'message': f"Sentiment is {direction} ({current_sentiment['overall_score']:.2f})",
                    'severity': 'high'
                })
            
            # Fear & Greed alerts
            if current_sentiment['fear_greed_index'] > 80:
                alerts.append({
                    'type': 'extreme_greed',
                    'message': f"Extreme greed detected ({current_sentiment['fear_greed_index']}/100)",
                    'severity': 'medium'
                })
            elif current_sentiment['fear_greed_index'] < 20:
                alerts.append({
                    'type': 'extreme_fear',
                    'message': f"Extreme fear detected ({current_sentiment['fear_greed_index']}/100)",
                    'severity': 'medium'
                })
            
            # Sentiment divergence alerts
            news_social_diff = abs(current_sentiment['news_sentiment'] - current_sentiment['social_sentiment'])
            if news_social_diff > 0.5:
                alerts.append({
                    'type': 'sentiment_divergence',
                    'message': f"Large divergence between news and social sentiment ({news_social_diff:.2f})",
                    'severity': 'low'
                })
            
            return alerts
            
        except Exception as e:
            print(f"Error getting sentiment alerts: {str(e)}")
            return []

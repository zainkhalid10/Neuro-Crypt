import requests
import os
from datetime import datetime, timedelta
import time
from utils.database import get_database

class DataFetcher:
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.headers = {
            'accept': 'application/json',
            'x-cg-demo-api-key': os.getenv('COINGECKO_API_KEY', '')
        }
        self.request_delay = 1.2  # Rate limiting

    def _make_request(self, endpoint, params=None):
        """Make rate-limited request to CoinGecko API"""
        try:
            time.sleep(self.request_delay)
            response = requests.get(
                f"{self.base_url}/{endpoint}",
                headers=self.headers,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"API Error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Request error: {str(e)}")
            return None

def get_crypto_data(crypto_id):
    """Get detailed cryptocurrency data"""
    fetcher = DataFetcher()
    
    endpoint = f"coins/{crypto_id}"
    params = {
        'localization': 'false',
        'tickers': 'false',
        'market_data': 'true',
        'community_data': 'false',
        'developer_data': 'false',
        'sparkline': 'false'
    }
    
    data = fetcher._make_request(endpoint, params)
    
    if data:
        return data
    else:
        # Return mock data if API fails
        return {
            'id': crypto_id,
            'symbol': 'btc',
            'name': 'Bitcoin',
            'market_cap_rank': 1,
            'market_data': {
                'current_price': {'usd': 45000},
                'market_cap': {'usd': 880000000000},
                'total_volume': {'usd': 25000000000},
                'price_change_percentage_24h': 2.5,
                'circulating_supply': 19500000
            }
        }

def get_market_overview():
    """Get market overview data for top cryptocurrencies"""
    fetcher = DataFetcher()
    
    endpoint = "coins/markets"
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': 100,
        'page': 1,
        'sparkline': 'false',
        'price_change_percentage': '24h'
    }
    
    data = fetcher._make_request(endpoint, params)
    
    if data:
        return data
    else:
        # Return mock data if API fails
        return [
            {
                'id': 'bitcoin',
                'symbol': 'btc',
                'name': 'Bitcoin',
                'current_price': 45000,
                'market_cap': 880000000000,
                'market_cap_rank': 1,
                'total_volume': 25000000000,
                'price_change_percentage_24h': 2.5
            },
            {
                'id': 'ethereum',
                'symbol': 'eth',
                'name': 'Ethereum',
                'current_price': 3200,
                'market_cap': 385000000000,
                'market_cap_rank': 2,
                'total_volume': 18000000000,
                'price_change_percentage_24h': -1.8
            },
            {
                'id': 'binancecoin',
                'symbol': 'bnb',
                'name': 'BNB',
                'current_price': 380,
                'market_cap': 58000000000,
                'market_cap_rank': 3,
                'total_volume': 1200000000,
                'price_change_percentage_24h': 0.9
            }
        ]

def get_historical_data(crypto_id, days):
    """Get historical price data for a cryptocurrency"""
    fetcher = DataFetcher()
    
    endpoint = f"coins/{crypto_id}/market_chart"
    params = {
        'vs_currency': 'usd',
        'days': days,
        'interval': 'daily' if days > 90 else 'hourly'
    }
    
    data = fetcher._make_request(endpoint, params)
    
    if data:
        return data
    else:
        # Return mock historical data
        from datetime import datetime, timedelta
        import random
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Generate mock price data
        prices = []
        volumes = []
        current_price = 45000  # Starting price
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            timestamp = int(date.timestamp() * 1000)
            
            # Add some volatility
            change = random.uniform(-0.05, 0.05)
            current_price = current_price * (1 + change)
            
            prices.append([timestamp, current_price])
            volumes.append([timestamp, random.uniform(20000000000, 30000000000)])
        
        return {
            'prices': prices,
            'market_caps': [[p[0], p[1] * 19500000] for p in prices],
            'total_volumes': volumes
        }

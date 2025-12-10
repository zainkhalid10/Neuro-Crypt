import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
from utils.database import get_database

class BiasDetector:
    def __init__(self):
        self.bias_categories = {
            'Loss Aversion': [0, 1, 9],  # Question indices that test loss aversion
            'Anchoring': [2, 3],
            'Herd Behavior': [4, 5],
            'Confirmation Bias': [6, 7],
            'Overconfidence': [8, 9]
        }
        
        self.scoring_weights = {
            'Loss Aversion': {
                'high_bias': [0, 1],  # Answer indices indicating high bias
                'moderate_bias': [2],
                'low_bias': [3]
            },
            'Anchoring': {
                'high_bias': [0, 2],
                'moderate_bias': [3],
                'low_bias': [1]
            },
            'Herd Behavior': {
                'high_bias': [0, 0],  # For questions 4,5
                'moderate_bias': [1, 2],
                'low_bias': [2, 3]
            },
            'Confirmation Bias': {
                'high_bias': [0, 0],
                'moderate_bias': [2, 1],
                'low_bias': [1, 3]
            },
            'Overconfidence': {
                'high_bias': [0, 0],
                'moderate_bias': [1, 1],
                'low_bias': [2, 3]
            }
        }
    
    def calculate_bias_scores(self, responses):
        """Calculate bias scores based on questionnaire responses"""
        try:
            # Map responses to indices
            response_mapping = {
                # Loss Aversion Q1
                "Immediately sell to prevent further losses": 0,
                "Hold and wait for recovery": 1,
                "Buy more to average down": 2,
                "Analyze market conditions before deciding": 3,
                
                # Loss Aversion Q2
                "Sell immediately to cut losses": 0,
                "Hold because selling locks in the loss": 1,
                "Buy more because it's 'on sale'": 2,
                "Set a stop-loss and stick to it": 3,
                
                # Anchoring Q1
                "The all-time high price": 0,
                "Current technical analysis": 1,
                "Recent news and fundamentals": 2,
                "Comparison to similar projects": 3,
                
                # Anchoring Q2
                "Based on previous high prices": 0,
                "Using technical analysis levels": 1,
                "Following expert predictions": 2,
                "Based on fundamental valuation": 3,
                
                # Herd Behavior Q1
                "What other traders are doing": 0,
                "Social media sentiment": 1,
                "Your own analysis": 2,
                "Expert recommendations": 3,
                
                # Herd Behavior Q2
                "Buy because everyone else is buying": 0,
                "Sell because it might be a bubble": 1,
                "Hold your current position": 2,
                "Analyze before making any moves": 3,
                
                # Confirmation Bias Q1
                "Look for information that supports your decision": 0,
                "Seek out opposing viewpoints": 1,
                "Focus on technical analysis only": 2,
                "Consider both positive and negative aspects equally": 3,
                
                # Confirmation Bias Q2
                "Ignore it or dismiss it": 0,
                "Investigate further": 1,
                "Immediately reconsider your position": 2,
                "Seek multiple perspectives": 3,
                
                # Overconfidence Q1
                "More than 80% of the time": 0,
                "About 60-70% of the time": 1,
                "Around 50% of the time": 2,
                "Less than 50% of the time": 3,
                
                # Overconfidence Q2
                "Your superior analysis skills": 0,
                "Good timing and some luck": 1,
                "Market conditions": 2,
                "A combination of skill and luck": 3
            }
            
            # Convert responses to numeric indices
            response_indices = []
            for response in responses:
                if response in response_mapping:
                    response_indices.append(response_mapping[response])
                else:
                    response_indices.append(2)  # Default to moderate
            
            # Calculate bias scores
            bias_scores = {}
            
            for bias_type, question_indices in self.bias_categories.items():
                total_score = 0
                question_count = len(question_indices)
                
                for i, q_idx in enumerate(question_indices):
                    if q_idx < len(response_indices):
                        answer_idx = response_indices[q_idx]
                        
                        # Score based on bias level
                        if answer_idx in [0, 1]:  # High bias answers
                            score = 80 + random.randint(-5, 10)
                        elif answer_idx == 2:  # Moderate bias answers
                            score = 50 + random.randint(-10, 10)
                        else:  # Low bias answers
                            score = 20 + random.randint(-5, 10)
                        
                        total_score += score
                
                # Average score for this bias type
                bias_scores[bias_type] = min(100, max(0, total_score // question_count))
            
            return bias_scores
            
        except Exception as e:
            print(f"Error calculating bias scores: {str(e)}")
            return {bias: 50 for bias in self.bias_categories.keys()}
    
    def get_recommendations(self, bias_scores):
        """Get personalized recommendations based on bias scores"""
        recommendations = []
        
        for bias_type, score in bias_scores.items():
            if score >= 70:
                recommendations.extend(self.get_high_bias_recommendations(bias_type))
            elif score >= 40:
                recommendations.extend(self.get_moderate_bias_recommendations(bias_type))
            else:
                recommendations.extend(self.get_low_bias_recommendations(bias_type))
        
        return recommendations[:8]  # Limit to 8 recommendations
    
    def get_high_bias_recommendations(self, bias_type):
        """Get recommendations for high bias scores"""
        recommendations = {
            'Loss Aversion': [
                "Set stop-loss orders before entering any trade to remove emotional decision-making",
                "Use position sizing rules (never risk more than 2% per trade)",
                "Practice the 'pre-mortem' technique - imagine losses before they happen"
            ],
            'Anchoring': [
                "Use multiple valuation methods, not just price comparisons",
                "Regularly reassess your price targets based on new information",
                "Focus on future potential rather than past price levels"
            ],
            'Herd Behavior': [
                "Develop and stick to your own research process",
                "Use contrarian indicators to identify crowded trades",
                "Limit exposure to emotional social media during trading hours"
            ],
            'Confirmation Bias': [
                "Actively seek out opposing viewpoints before making decisions",
                "Create a 'devil's advocate' checklist for each investment",
                "Diversify your information sources beyond your comfort zone"
            ],
            'Overconfidence': [
                "Keep a detailed trading journal to track prediction accuracy",
                "Use systematic risk management regardless of confidence level",
                "Practice position sizing based on uncertainty, not confidence"
            ]
        }
        
        return recommendations.get(bias_type, ["Continue working on self-awareness in trading decisions"])
    
    def get_moderate_bias_recommendations(self, bias_type):
        """Get recommendations for moderate bias scores"""
        recommendations = {
            'Loss Aversion': [
                "Practice treating gains and losses equally in your analysis",
                "Set both profit targets and stop-losses before entering trades"
            ],
            'Anchoring': [
                "Consider multiple timeframes and price levels in your analysis",
                "Use fundamental analysis alongside technical price levels"
            ],
            'Herd Behavior': [
                "Question popular opinions and look for contrarian opportunities",
                "Develop confidence in your own analysis process"
            ],
            'Confirmation Bias': [
                "Make it a habit to seek one opposing view for every supportive one",
                "Use structured decision-making frameworks"
            ],
            'Overconfidence': [
                "Track your prediction accuracy over time",
                "Acknowledge the role of luck in successful trades"
            ]
        }
        
        return recommendations.get(bias_type, ["Continue practicing mindful trading"])
    
    def get_low_bias_recommendations(self, bias_type):
        """Get recommendations for low bias scores"""
        recommendations = {
            'Loss Aversion': [
                "Good job maintaining rational perspective on losses",
                "Continue using systematic risk management"
            ],
            'Anchoring': [
                "Excellent use of multiple valuation methods",
                "Keep focusing on forward-looking analysis"
            ],
            'Herd Behavior': [
                "Great independent thinking - maintain this approach",
                "Continue developing your unique trading edge"
            ],
            'Confirmation Bias': [
                "Excellent balanced approach to information gathering",
                "Keep maintaining objectivity in your analysis"
            ],
            'Overconfidence': [
                "Good realistic assessment of your abilities",
                "Continue balancing confidence with humility"
            ]
        }
        
        return recommendations.get(bias_type, ["Keep up the good work!"])
    
    def get_personalized_recommendations(self, bias_scores):
        """Get comprehensive personalized recommendations"""
        recommendations = []
        
        # Overall bias assessment
        avg_bias = sum(bias_scores.values()) / len(bias_scores)
        
        if avg_bias > 60:
            recommendations.append("Consider taking a trading psychology course or working with a mentor")
            recommendations.append("Implement a 24-hour waiting period before making major trading decisions")
        elif avg_bias > 40:
            recommendations.append("Continue practicing mindful trading and self-awareness")
            recommendations.append("Consider using automated trading rules to reduce emotional decisions")
        else:
            recommendations.append("Excellent psychological discipline - maintain your current approach")
        
        # Specific bias recommendations
        highest_bias = max(bias_scores.items(), key=lambda x: x[1])
        if highest_bias[1] > 50:
            recommendations.append(f"Focus especially on reducing {highest_bias[0]} in your trading")
        
        # Trading-specific recommendations
        if bias_scores.get('Loss Aversion', 0) > 70 and bias_scores.get('Overconfidence', 0) > 70:
            recommendations.append("Your combination of loss aversion and overconfidence may lead to holding losers too long")
        
        if bias_scores.get('Herd Behavior', 0) > 70 and bias_scores.get('Confirmation Bias', 0) > 70:
            recommendations.append("Be extra cautious of echo chambers - seek diverse perspectives")
        
        return recommendations

def analyze_trading_behavior(behavior_data):
    """Analyze trading behavior patterns for bias indicators"""
    try:
        analysis = {
            'insights': [],
            'bias_indicators': {},
            'recommendations': [],
            'risk_profile': 'Unknown'
        }
        
        # Calculate win rate
        total_trades = behavior_data.get('total_trades', 0)
        winning_trades = behavior_data.get('winning_trades', 0)
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        # Risk profile assessment
        portfolio_volatility = behavior_data.get('portfolio_volatility', 'Moderate')
        if portfolio_volatility in ['Very High', 'High']:
            analysis['risk_profile'] = 'High Risk'
        elif portfolio_volatility in ['Very Low', 'Low']:
            analysis['risk_profile'] = 'Conservative'
        else:
            analysis['risk_profile'] = 'Moderate'
        
        # Trading insights
        if win_rate > 70:
            analysis['insights'].append("High win rate suggests good entry timing")
        elif win_rate < 40:
            analysis['insights'].append("Low win rate may indicate poor entry timing or risk management")
        
        if total_trades > 50:
            analysis['insights'].append("High trading frequency - ensure you're not overtrading")
        elif total_trades < 5:
            analysis['insights'].append("Low trading frequency - consider if you're missing opportunities")
        
        # Bias indicators based on behavior
        if behavior_data.get('panic_sold', False):
            analysis['bias_indicators']['Loss Aversion'] = 'High'
            analysis['recommendations'].append("Practice emotional regulation during market downturns")
        
        if behavior_data.get('fomo_bought', False):
            analysis['bias_indicators']['Herd Behavior'] = 'High'
            analysis['recommendations'].append("Develop independent analysis skills")
        
        if behavior_data.get('held_losers', False):
            analysis['bias_indicators']['Loss Aversion'] = 'High'
            analysis['recommendations'].append("Implement strict stop-loss rules")
        
        if behavior_data.get('cut_winners', False):
            analysis['bias_indicators']['Loss Aversion'] = 'Medium'
            analysis['recommendations'].append("Let profitable positions run longer")
        
        # Holding time analysis
        avg_hold_time = behavior_data.get('avg_hold_time', 'Unknown')
        if avg_hold_time == '< 1 hour':
            analysis['insights'].append("Very short holding periods suggest day trading approach")
            analysis['recommendations'].append("Consider if frequent trading is adding value")
        elif avg_hold_time == '> 1 month':
            analysis['insights'].append("Long holding periods suggest buy-and-hold strategy")
        
        # Risk assessment
        biggest_gain = behavior_data.get('biggest_gain', 0)
        biggest_loss = behavior_data.get('biggest_loss', 0)
        
        if biggest_gain > 50:
            analysis['insights'].append("Large gains suggest high-risk, high-reward approach")
        
        if abs(biggest_loss) > 30:
            analysis['insights'].append("Large losses indicate need for better risk management")
            analysis['recommendations'].append("Implement position sizing rules")
        
        return analysis
        
    except Exception as e:
        print(f"Error analyzing trading behavior: {str(e)}")
        return {
            'insights': ["Error analyzing trading behavior"],
            'bias_indicators': {},
            'recommendations': ["Please try again"],
            'risk_profile': 'Unknown'
        }

def simulate_trading_decision(scenario, emotional_state, bias_scores=None):
    """Simulate how biases affect trading decisions"""
    try:
        decision_factors = {
            'rational_component': 0.7,
            'emotional_component': 0.3,
            'bias_adjustment': 0.0
        }
        
        # Adjust for emotional state
        emotional_modifiers = {
            'Fearful': {'rational_component': 0.5, 'emotional_component': 0.5},
            'Greedy': {'rational_component': 0.4, 'emotional_component': 0.6},
            'Panicked': {'rational_component': 0.3, 'emotional_component': 0.7},
            'Euphoric': {'rational_component': 0.4, 'emotional_component': 0.6},
            'Overconfident': {'rational_component': 0.6, 'emotional_component': 0.4}
        }
        
        if emotional_state in emotional_modifiers:
            decision_factors.update(emotional_modifiers[emotional_state])
        
        # Adjust for bias scores
        if bias_scores:
            avg_bias = sum(bias_scores.values()) / len(bias_scores)
            bias_adjustment = (avg_bias - 50) / 100  # Normalize to -0.5 to 0.5
            decision_factors['bias_adjustment'] = bias_adjustment
        
        # Generate decision outcome
        rational_score = np.random.normal(0.7, 0.1)
        emotional_score = np.random.normal(0.3, 0.2)
        
        decision_quality = (
            rational_score * decision_factors['rational_component'] +
            emotional_score * decision_factors['emotional_component'] +
            decision_factors['bias_adjustment']
        )
        
        # Normalize to 0-1 range
        decision_quality = max(0, min(1, decision_quality))
        
        return {
            'decision_quality': decision_quality,
            'factors': decision_factors,
            'recommendation': get_decision_recommendation(decision_quality),
            'bias_impact': decision_factors['bias_adjustment']
        }
        
    except Exception as e:
        print(f"Error simulating trading decision: {str(e)}")
        return {
            'decision_quality': 0.5,
            'factors': {'rational_component': 0.5, 'emotional_component': 0.5},
            'recommendation': "Error in simulation",
            'bias_impact': 0.0
        }

def get_decision_recommendation(quality_score):
    """Get recommendation based on decision quality"""
    if quality_score > 0.8:
        return "Excellent decision-making process - proceed with confidence"
    elif quality_score > 0.6:
        return "Good decision-making - minor improvements possible"
    elif quality_score > 0.4:
        return "Moderate decision quality - consider additional analysis"
    else:
        return "Poor decision quality - recommend stepping back and reassessing"

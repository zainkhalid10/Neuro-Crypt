'use client'

import { useState } from 'react'
import { Brain, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'

const biases = [
  {
    name: 'Confirmation Bias',
    description: 'Seeking information that confirms existing beliefs',
    risk: 'High',
    symptoms: ['Only reading bullish news', 'Ignoring bearish signals', 'Selective data interpretation'],
    mitigation: ['Seek opposing viewpoints', 'Use diverse data sources', 'Question your assumptions']
  },
  {
    name: 'Anchoring Bias',
    description: 'Relying too heavily on first piece of information',
    risk: 'Medium',
    symptoms: ['Fixing on initial price', 'Not adjusting to new data', 'Overvaluing first impressions'],
    mitigation: ['Update analysis regularly', 'Consider multiple timeframes', 'Reassess positions']
  },
  {
    name: 'Herd Mentality',
    description: 'Following the crowd without independent analysis',
    risk: 'High',
    symptoms: ['FOMO buying', 'Panic selling', 'Following social media trends'],
    mitigation: ['Do your own research', 'Set clear entry/exit rules', 'Ignore market noise']
  },
  {
    name: 'Loss Aversion',
    description: 'Fearing losses more than valuing gains',
    risk: 'Medium',
    symptoms: ['Holding losing positions too long', 'Selling winners too early', 'Avoiding necessary risks'],
    mitigation: ['Set stop losses', 'Take profits systematically', 'Focus on risk/reward ratios']
  },
  {
    name: 'Overconfidence',
    description: 'Overestimating trading abilities and knowledge',
    risk: 'High',
    symptoms: ['Overtrading', 'Ignoring risk management', 'Dismissing contrary evidence'],
    mitigation: ['Keep trading journal', 'Review past mistakes', 'Stay humble']
  }
]

export default function BiasAnalysis() {
  const [selectedBias, setSelectedBias] = useState(biases[0])
  const [userResponses, setUserResponses] = useState<{[key: string]: number}>({})
  const [assessmentComplete, setAssessmentComplete] = useState(false)

  const handleResponse = (biasName: string, score: number) => {
    setUserResponses(prev => ({
      ...prev,
      [biasName]: score
    }))
  }

  const calculateRiskScore = () => {
    const totalScore = Object.values(userResponses).reduce((sum, score) => sum + score, 0)
    const maxScore = biases.length * 5
    return Math.round((totalScore / maxScore) * 100)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'High Risk', color: 'text-red-400', bg: 'bg-red-900/20' }
    if (score >= 60) return { level: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
    return { level: 'Low Risk', color: 'text-green-400', bg: 'bg-green-900/20' }
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🧠 Cognitive Bias Analysis</h1>
          <p className="text-gray-400">Identify and mitigate psychological biases in your trading decisions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bias Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Bias Information</h2>
            <div className="space-y-4">
              {biases.map((bias) => (
                <div
                  key={bias.name}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedBias.name === bias.name
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedBias(bias)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{bias.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      bias.risk === 'High' ? 'bg-red-900/20 text-red-400' :
                      bias.risk === 'Medium' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-green-900/20 text-green-400'
                    }`}>
                      {bias.risk} Risk
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{bias.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Bias Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">{selectedBias.name}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Symptoms</h3>
                <ul className="space-y-1">
                  {selectedBias.symptoms.map((symptom, index) => (
                    <li key={index} className="text-gray-400 text-sm flex items-center">
                      <XCircle className="h-4 w-4 text-red-400 mr-2" />
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Mitigation Strategies</h3>
                <ul className="space-y-1">
                  {selectedBias.mitigation.map((strategy, index) => (
                    <li key={index} className="text-gray-400 text-sm flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Self Assessment */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Self Assessment</h2>
          <p className="text-gray-400 mb-6">Rate how much each bias affects your trading decisions (1 = Never, 5 = Always)</p>
          
          <div className="space-y-4">
            {biases.map((bias) => (
              <div key={bias.name} className="border-b border-gray-700 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{bias.name}</span>
                  <span className="text-gray-400 text-sm">
                    Score: {userResponses[bias.name] || 0}/5
                  </span>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleResponse(bias.name, score)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-all duration-300 hover:scale-110 ${
                        userResponses[bias.name] === score
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(userResponses).length === biases.length && (
            <div className="mt-6 p-4 rounded-lg bg-gray-700">
              <h3 className="text-white font-medium mb-2">Risk Assessment Result</h3>
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded ${getRiskLevel(calculateRiskScore()).bg}`}>
                  <span className={`font-bold ${getRiskLevel(calculateRiskScore()).color}`}>
                    {getRiskLevel(calculateRiskScore()).level}
                  </span>
                </div>
                <span className="text-gray-400">
                  Overall Score: {calculateRiskScore()}%
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {calculateRiskScore() >= 80 
                  ? 'High risk of bias affecting your trading. Consider implementing more strict risk management.'
                  : calculateRiskScore() >= 60
                  ? 'Moderate risk. Focus on the identified biases and their mitigation strategies.'
                  : 'Low risk. Continue with your current approach while remaining vigilant.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Trading Psychology Tips */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Trading Psychology Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Keep a Trading Journal</h3>
                  <p className="text-gray-400 text-sm">Document your decisions and emotions to identify patterns</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Set Clear Rules</h3>
                  <p className="text-gray-400 text-sm">Establish entry, exit, and risk management rules before trading</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Take Breaks</h3>
                  <p className="text-gray-400 text-sm">Step away from screens to maintain mental clarity</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Avoid Overtrading</h3>
                  <p className="text-gray-400 text-sm">Quality over quantity in your trading decisions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Manage Emotions</h3>
                  <p className="text-gray-400 text-sm">Don't let fear or greed drive your decisions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-medium">Stay Disciplined</h3>
                  <p className="text-gray-400 text-sm">Stick to your trading plan regardless of market conditions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
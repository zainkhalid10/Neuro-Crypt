'use client'

import { Brain, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Brain className="h-6 w-6 text-blue-400" />
            <div>
              <span className="text-white font-semibold text-lg">NeuroCrypt</span>
              <p className="text-gray-400 text-sm">AI-Powered Crypto Analysis</p>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>© 2024 All rights reserved by</span>
            <span className="text-blue-400 font-medium">NeuroCrypt</span>
          </div>
          
          {/* Made with Love */}
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-400" />
            <span>for crypto traders</span>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
            <div className="flex space-x-6 mb-2 sm:mb-0">
              <span>Live Market Data</span>
              <span>•</span>
              <span>Real-time Analysis</span>
              <span>•</span>
              <span>AI-Powered Insights</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 
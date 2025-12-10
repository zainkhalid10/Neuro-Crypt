'use client'

import PageLayout from '@/components/PageLayout'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [activeSection, setActiveSection] = useState('about')
  const [welcomeText, setWelcomeText] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [videoOpacity, setVideoOpacity] = useState(0.3)
  const [secondPageVisible, setSecondPageVisible] = useState(false)
  const [aboutUsVisible, setAboutUsVisible] = useState(false)
  const secondPageRef = useRef(null)
  const aboutUsRef = useRef(null)

  // Typewriter effect for welcome text - only show once per site visit
  useEffect(() => {
    // Reset second page visibility for fresh animation on each visit
    setSecondPageVisible(false)
    setAboutUsVisible(false)
    
    // For testing - remove this line after testing
    localStorage.removeItem('neurocrypt-welcome-seen')
    
    const hasSeenWelcome = localStorage.getItem('neurocrypt-welcome-seen')
    console.log('Welcome seen:', hasSeenWelcome) // Debug log
    console.log('showWelcome state:', showWelcome) // Debug log
    
    if (!hasSeenWelcome) {
      console.log('Showing welcome effect') // Debug log
      setShowWelcome(true) // Explicitly set to true
      const text = "WELCOME TO NEUROCRYPT"
      let index = 0
      
      const typeWriter = () => {
        if (index < text.length) {
          setWelcomeText(text.slice(0, index + 1))
          index++
          setTimeout(typeWriter, 50)
        } else {
          // Start fade out after 0.5 seconds
          setTimeout(() => {
            setFadeOut(true)
            // Hide welcome text after fade animation completes
            setTimeout(() => {
              setShowWelcome(false)
              localStorage.setItem('neurocrypt-welcome-seen', 'true')
            }, 500) // 500ms fade duration
          }, 500)
        }
      }
      
      typeWriter()
    } else {
      console.log('Welcome already seen, skipping') // Debug log
      // If already seen, don't show welcome
      setShowWelcome(false)
    }
  }, [])

  // Handle video play continuously in loop with fade effects
  useEffect(() => {
    const video = document.querySelector('#video1') as HTMLVideoElement
    
    if (video) {
      console.log('Starting video playback')
      video.currentTime = 0
      video.play()
      
      // Add fade effects for first and last second
      const handleTimeUpdate = () => {
        const duration = video.duration
        const currentTime = video.currentTime
        
        // Fade in during first second
        if (currentTime <= 1) {
          const fadeProgress = currentTime / 1
          setVideoOpacity(0.3 * fadeProgress)
        }
        
        // Fade out during last second
        if (duration && currentTime >= duration - 1) {
          const fadeProgress = (currentTime - (duration - 1)) / 1
          setVideoOpacity(0.3 * (1 - fadeProgress))
        }
        
        // Normal opacity for middle portion
        if (currentTime > 1 && currentTime < duration - 1) {
          setVideoOpacity(0.3)
        }
      }
      
      video.addEventListener('timeupdate', handleTimeUpdate)
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [])

  // Handle scroll effect for page 2 - auto-scroll to About section
  useEffect(() => {
    // Ensure page starts at top and prevent any auto-scroll
    window.scrollTo(0, 0)
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
    
    // Reset scroll position after a short delay to ensure it takes effect
    setTimeout(() => {
      window.scrollTo(0, 0)
      setIsPageLoaded(true)
    }, 200)
    
    const handleScroll = () => {
      if (isPageLoaded) {
        setScrollY(window.scrollY)
        
        // Reset second page animation when at top of page
        if (window.scrollY <= 100) {
          setSecondPageVisible(false)
          setAboutUsVisible(false)
        }
        
        // Page 2: Auto-scroll to About section when user scrolls down
        if (window.scrollY > 100 && activeSection !== 'about') {
          console.log('Page 2: Auto-scrolling to About section')
          
          // Switch to About section
          setActiveSection('about')
          
          // Smooth scroll to About section after a short delay
          setTimeout(() => {
            const aboutSection = document.querySelector('[data-section="about"]')
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: 'smooth' })
            }
          }, 100)
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isPageLoaded, activeSection])

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSecondPageVisible(true)
        } else {
          setSecondPageVisible(false)
        }
      },
      { threshold: 0.1 }
    )
    if (secondPageRef.current) {
      observer.observe(secondPageRef.current)
    }
    return () => {
      if (secondPageRef.current) observer.unobserve(secondPageRef.current)
    }
  }, [])

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutUsVisible(true)
        } else {
          setAboutUsVisible(false)
        }
      },
      { threshold: 0.1 }
    )
    if (aboutUsRef.current) {
      observer.observe(aboutUsRef.current)
    }
    return () => {
      if (aboutUsRef.current) observer.unobserve(aboutUsRef.current)
    }
  }, [])

  return (
    <PageLayout showNavbar={!showWelcome}>
      <div className="min-h-screen bg-gray-900 text-white pt-20 relative">
        {/* Background Video with Cross-Fade Dissolve */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <video
            id="video1"
            muted
            loop
            autoPlay
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ zIndex: -1, opacity: videoOpacity }}
          >
            <source src="/Images/bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        {/* Content overlay */}
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Typewriter Effect */}
          {showWelcome && (
              <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
              <div className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent mb-4">
                  {welcomeText}
                  <span className="animate-pulse">|</span>
                </div>
                <div className="text-xl text-gray-300 animate-fade-in">
                  Your AI-Powered Financial Analytics Platform
                </div>
              </div>
            </div>
          )}
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/Images/logo.png" 
                alt="NeuroCrypt Logo" 
                className="h-[500px] w-auto object-contain"
              />
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Your advanced platform for real-time market analysis, AI-powered insights, and comprehensive financial data visualization.
            </p>
              {/* Moving Horizontal Bar */}
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 py-4 mb-8 -mx-32 mt-10 -mb-2" style={{ marginTop: 'calc(2.5rem + 3px)' }}>
                <div className="animate-marquee-single whitespace-nowrap">
                  <span className="text-white font-bold text-4xl w-full text-center">THINK. TRADE. TRANSFORM</span>
                </div>
              </div>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setActiveSection('about')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-110 hover:shadow-lg ${activeSection === 'about' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg'}`}
              >
                About Us
              </button>
              </div>
          </div>

            {/* Page 1: About Us Section */}
            <div ref={aboutUsRef} className={`min-h-screen transition-all duration-700 ${aboutUsVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
              <div 
                data-section="about"
                className={`max-w-4xl mx-auto transition-all duration-1000 ${scrollY > 200 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
              >
              <h2 className="text-3xl font-bold text-center mb-8">About NeuroCrypt</h2>
                <div className={`grid md:grid-cols-2 gap-8 mb-12 transition-all duration-1000 ${scrollY > 250 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">Our Mission</h3>
                  <p className="text-gray-300 leading-relaxed">
                    To democratize access to advanced financial analytics and provide retail investors with institutional-grade tools for market analysis, 
                    enabling informed decision-making in an increasingly complex financial landscape.
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">Our Vision</h3>
                  <p className="text-gray-300 leading-relaxed">
                    To become the leading platform that bridges the gap between sophisticated financial analysis and everyday investors, 
                    making complex market data accessible and actionable for everyone.
                  </p>
                </div>
              </div>
                <div className={`bg-gray-800 rounded-lg p-8 mb-8 hover:shadow-lg transition-all duration-300 transition-all duration-1000 ${scrollY > 300 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                  <h3 className="text-2xl font-semibold mb-6 text-center text-blue-400">Our Features</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📊</div>
                      <h4 className="text-lg font-semibold mb-2">Market Data</h4>
                    <p className="text-gray-300 text-sm">
                        Real-time cryptocurrency and stock market data with advanced charting capabilities
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-4">🤖</div>
                      <h4 className="text-lg font-semibold mb-2">AI Analytics</h4>
                    <p className="text-gray-300 text-sm">
                      Machine learning models for price prediction and market sentiment analysis
                    </p>
                  </div>
                    <div className="text-center">
                      <div className="text-4xl mb-4">💰</div>
                      <h4 className="text-lg font-semibold mb-2">Investment Tools</h4>
                      <p className="text-gray-300 text-sm">
                        Investment simulator, portfolio tracking, and risk management tools
                      </p>
                    </div>
                  <div className="text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <h4 className="text-lg font-semibold mb-2">Advanced Analytics</h4>
                    <p className="text-gray-300 text-sm">
                        Bias detection, sentiment analysis, and comprehensive market insights
                    </p>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

            {/* Page 2: Additional Content */}
            <div ref={secondPageRef} className={`min-h-screen transition-all duration-700 ${secondPageVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
              <div className="max-w-4xl mx-auto">
                <div className={`bg-gray-800 rounded-lg p-8 hover:shadow-lg transition-all duration-300 transition-all duration-1000 ${scrollY > 450 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <h3 className="text-2xl font-semibold mb-6 text-center text-blue-400">Why Choose NeuroCrypt?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-blue-400 text-xl">✓</div>
                    <div>
                      <h4 className="font-semibold mb-1">Comprehensive Coverage</h4>
                      <p className="text-gray-300 text-sm">Access to both cryptocurrency and traditional stock markets in one platform</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="text-blue-400 text-xl">✓</div>
                    <div>
                      <h4 className="font-semibold mb-1">Real-Time Updates</h4>
                      <p className="text-gray-300 text-sm">Live data feeds with automatic refresh and historical analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="text-blue-400 text-xl">✓</div>
                    <div>
                      <h4 className="font-semibold mb-1">Advanced Visualization</h4>
                      <p className="text-gray-300 text-sm">Interactive charts with multiple timeframes and chart types</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="text-blue-400 text-xl">✓</div>
                    <div>
                      <h4 className="font-semibold mb-1">AI-Powered Insights</h4>
                      <p className="text-gray-300 text-sm">Machine learning models for market prediction and sentiment analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="text-blue-400 text-xl">✓</div>
                    <div>
                      <h4 className="font-semibold mb-1">User-Friendly Interface</h4>
                      <p className="text-gray-300 text-sm">Intuitive design that makes complex data accessible to all users</p>
                    </div>
                  </div>
                </div>
              </div>

                {/* Statistics Section */}
                <div className={`text-center mt-16 mb-16 transition-all duration-1000 ${scrollY > 500 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                  <h3 className="text-3xl font-bold mb-8 text-blue-400">Our Impact</h3>
                  <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="text-4xl font-bold text-blue-400 mb-2">2025</div>
                      <div className="text-lg text-gray-300">Founded</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="text-4xl font-bold text-blue-400 mb-2">1000+</div>
                      <div className="text-lg text-gray-300">Users Worldwide</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="text-4xl font-bold text-blue-400 mb-2">4+</div>
                      <div className="text-lg text-gray-300">Years in Industry</div>
                </div>
                  </div>
                </div>

          {/* Call to Action */}
                <div className={`text-center mt-16 transition-all duration-1000 ${scrollY > 600 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-gray-300 mb-8">Explore our advanced market analysis tools and start making informed investment decisions.</p>
            <div className="flex justify-center space-x-4">
              <a 
                href="/market-data" 
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                View Market Data
              </a>
              <a 
                href="/contact-us" 
                      className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                Contact Us
              </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

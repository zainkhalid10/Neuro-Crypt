'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Linkedin, Facebook, Instagram, Github, Users } from 'lucide-react'

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We\'ll get back to you soon.')
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  const teamMembers = [
    {
      name: 'Hamna Imran',
      role: 'Data Scientist',
      image: '/Images/hamna.jpeg',
      email: 'i229844@nu.edu.pk',
      linkedin: 'https://www.linkedin.com/in/hamna-imran-0688792b9/',
      github: 'https://github.com/hamnaiimran',
      description: 'AI/ML specialist focused on predictive analytics and market sentiment analysis.'
    },
    {
      name: 'Muhammad Zain',
      role: 'Lead Developer',
      image: '/Images/zain.jpeg',
      email: 'i212507@nu.edu.pk',
      linkedin: 'https://www.linkedin.com/in/muhammad-zain-a0313630b/',
      github: 'https://github.com/zainkhalid10',
      description: 'Full-stack developer with expertise in React, Next.js, and blockchain technologies.'
    },
    {
      name: 'Laiqa Eman',
      role: 'Fintech Explorer',
      image: '/Images/Laiqa.jpeg',
      email: 'I229951@nu.edu.pk',
      linkedin: 'https://www.linkedin.com/in/laiqa-eman-969255341',
      github: 'https://github.com/laiqeman',
      description: 'Passionate about Digital Finance, Economic Analysis, and Innovation.'
    },
    {
      name: 'Ibrahim Irfan',
      role: 'Financial Analyst',
      image: '/Images/ibrahim.jpeg',
      email: 'i229951@nu.edu.pk',
      linkedin: 'https://www.linkedin.com/in/ibrahim-irfan-2b2246308/',
      github: 'https://github.com/IBRAHIMBHATTI2604',
      description: 'Specialized in financial forecasting and portfolio management.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Get in touch with the NeuroCrypt team. We're here to help you navigate the world of crypto trading with AI-powered insights.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-center gap-8 mb-16">
          {/* Contact Form (centered) */}
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
              <Send className="mr-2 text-blue-400" />
              Send us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's this about?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us more about your inquiry..."
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Social Media and Contact Section (merged, icons in a row) */}
        <div className="bg-gray-800 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Follow Us & Get In Touch</h2>
          <div className="flex flex-col md:flex-row justify-center md:space-x-8 space-y-6 md:space-y-0 items-center">
            {/* Social Icons */}
            <div className="flex space-x-8 mb-6 md:mb-0">
              <a href="https://www.linkedin.com/company/neurocrypt/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 hover:scale-110">
                <Linkedin className="w-8 h-8 text-blue-400 mb-2" />
                <span className="text-sm text-gray-300">LinkedIn</span>
              </a>
              <a href="#" className="flex flex-col items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 hover:scale-110">
                <Facebook className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm text-gray-300">Facebook</span>
              </a>
              <a href="#" className="flex flex-col items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 hover:scale-110">
                <Instagram className="w-8 h-8 text-pink-500 mb-2" />
                <span className="text-sm text-gray-300">Instagram</span>
              </a>
              <a href="#" className="flex flex-col items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 hover:scale-110">
                <Github className="w-8 h-8 text-white mb-2" />
                <span className="text-sm text-gray-300">GitHub</span>
              </a>
            </div>
            {/* Contact Info as icons */}
            <div className="flex space-x-8">
              <a href="mailto:contact@neurocrypt.com" className="flex flex-col items-center p-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200 hover:scale-110" title="Email">
                <Mail className="w-8 h-8 text-white mb-2" />
                <span className="text-sm text-white">Email</span>
              </a>
              <a href="tel:+15551234567" className="flex flex-col items-center p-4 bg-green-500 rounded-lg hover:bg-green-600 transition duration-200 hover:scale-110" title="Phone">
                <Phone className="w-8 h-8 text-white mb-2" />
                <span className="text-sm text-white">Phone</span>
              </a>
              <a href="https://maps.google.com/?q=FAST+NUCES+Islamabad+Pakistan" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-purple-500 rounded-lg hover:bg-purple-600 transition duration-200 hover:scale-110" title="Location">
                <MapPin className="w-8 h-8 text-white mb-2" />
                <span className="text-sm text-white">Location</span>
              </a>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center">
            <Users className="mr-2 text-blue-400" />
            Meet the Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <img src={member.image} alt={member.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-blue-500" />
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-blue-400 text-sm mb-2">{member.role}</p>
                <p className="text-gray-300 text-xs mb-3">{member.description}</p>
                <div className="flex justify-center space-x-2 mb-2">
                  {member.linkedin && member.linkedin !== '#' && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition duration-200 hover:scale-110" title="LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.github && member.github !== '#' && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition duration-200 hover:scale-110" title="GitHub">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition duration-200 hover:scale-110" title="Email">
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
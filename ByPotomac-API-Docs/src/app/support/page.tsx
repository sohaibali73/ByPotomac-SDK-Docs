'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const faqs = [
    {
      question: 'How do I get started with the ByPotomac SDK?',
      answer: 'Start by reading our Getting Started guide in the Documentation section. It will walk you through setting up your environment, obtaining API keys, and making your first API calls.',
      category: 'Getting Started',
    },
    {
      question: 'What are the rate limits for the API?',
      answer: 'The API has different rate limits depending on the endpoint: Authentication endpoints allow 60 requests per minute per IP, Chat API allows 30 requests per minute per user, and general API endpoints allow 120 requests per minute per user.',
      category: 'Rate Limits',
    },
    {
      question: 'How do I handle authentication errors?',
      answer: 'Authentication errors typically occur when your API key is invalid, expired, or missing. Check that you are sending the correct Authorization header and that your API key has not expired. You can regenerate API keys from your dashboard.',
      category: 'Authentication',
    },
    {
      question: 'Can I use the API for commercial applications?',
      answer: 'Yes, the ByPotomac SDK API can be used for commercial applications. Please review our Terms of Service for specific licensing and usage requirements.',
      category: 'Licensing',
    },
    {
      question: 'How do I report a bug or issue?',
      answer: 'You can report bugs through our GitHub repository issues page or contact our support team directly. Please include detailed information about the issue, including error messages, API endpoints involved, and steps to reproduce.',
      category: 'Bug Reports',
    },
    {
      question: 'Is there a sandbox or test environment available?',
      answer: 'Yes, we provide a staging environment for testing your applications before deploying to production. You can access it using your staging API keys which are separate from your production keys.',
      category: 'Testing',
    },
  ];

  const supportOptions = [
    {
      title: 'Documentation',
      description: 'Find answers to common questions and learn how to use our API effectively.',
      icon: '📚',
      href: '/docs',
      color: 'bg-potomac-yellow',
    },
    {
      title: 'API Reference',
      description: 'Complete reference documentation for all API endpoints and parameters.',
      icon: '🔗',
      href: '/api-reference',
      color: 'bg-potomac-turquoise',
    },
    {
      title: 'Developer Guides',
      description: 'Step-by-step guides for common use cases and integration scenarios.',
      icon: '🚀',
      href: '/guides',
      color: 'bg-potomac-pink',
    },
    {
      title: 'Community Forum',
      description: 'Connect with other developers and share knowledge.',
      icon: '💬',
      href: '/community',
      color: 'bg-potomac-gray',
    },
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help from our support team via email.',
      email: 'support@bypotomac.com',
      responseTime: 'Within 24 hours',
      icon: '📧',
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time.',
      availability: 'Mon-Fri, 9 AM - 6 PM EST',
      icon: '💬',
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our technical support team.',
      phone: '+1 (555) 123-4567',
      availability: 'Mon-Fri, 9 AM - 6 PM EST',
      icon: '📞',
    },
    {
      title: 'Emergency Support',
      description: 'For critical issues affecting your production environment.',
      availability: '24/7',
      icon: '🚨',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'partial': return 'bg-orange-500';
      case 'major': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-rajdhani font-bold text-potomac-gray">
              Support Center
            </h1>
            <p className="text-gray-600 mt-2">
              We're here to help you succeed with the ByPotomac SDK
            </p>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <section className="bg-gradient-to-r from-potomac-yellow to-potomac-turquoise text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-rajdhani font-bold">System Status</h2>
              <p className="text-white/90">Current status of our services</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${getStatusColor('operational')} animate-pulse`}></span>
                <span className="font-rajdhani font-bold">All Systems Operational</span>
              </div>
              <Link href="/status" className="bg-white text-potomac-gray px-4 py-2 rounded-lg font-rajdhani font-bold hover:bg-gray-100 transition-colors">
                View Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'faqs', name: 'FAQs' },
              { id: 'contact', name: 'Contact Us' },
              { id: 'status', name: 'System Status' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-rajdhani font-bold text-sm ${
                  activeTab === tab.id
                    ? 'border-potomac-yellow text-potomac-yellow'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportOptions.map((option) => (
                <Link
                  key={option.title}
                  href={option.href}
                  className={`group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${option.color}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{option.icon}</span>
                    <svg className="w-5 h-5 text-white group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-rajdhani font-bold text-white mb-2 group-hover:text-gray-800">
                    {option.title}
                  </h3>
                  <p className="text-white/90 group-hover:text-gray-600 text-sm">
                    {option.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* Getting Help */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-rajdhani font-bold text-potomac-gray mb-4">Getting Started</h3>
                <div className="space-y-3">
                  <Link href="/docs/getting-started" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="w-2 h-2 bg-potomac-yellow rounded-full"></span>
                    <span className="text-gray-700">Read the Getting Started Guide</span>
                  </Link>
                  <Link href="/guides" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="w-2 h-2 bg-potomac-turquoise rounded-full"></span>
                    <span className="text-gray-700">Explore Developer Guides</span>
                  </Link>
                  <Link href="/api-reference" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="w-2 h-2 bg-potomac-pink rounded-full"></span>
                    <span className="text-gray-700">Browse API Reference</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-rajdhani font-bold text-potomac-gray mb-4">Common Issues</h3>
                <div className="space-y-3">
                  <Link href="/docs/authentication" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-gray-700">Authentication Problems</span>
                  </Link>
                  <Link href="/docs/rate-limiting" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-gray-700">Rate Limiting</span>
                  </Link>
                  <Link href="/docs/error-handling" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-700">Error Handling</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-2xl font-rajdhani font-bold text-potomac-gray mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <h4 className="text-lg font-rajdhani font-bold text-potomac-gray mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-gray-600">{faq.answer}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-rajdhani">
                      {faq.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-2xl font-rajdhani font-bold text-potomac-gray mb-6">Contact Our Support Team</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {contactMethods.map((method, index) => (
                  <div key={index} className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-4">{method.icon}</div>
                    <h4 className="text-lg font-rajdhani font-bold text-potomac-gray mb-2">
                      {method.title}
                    </h4>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    {method.email && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="font-mono text-potomac-yellow">{method.email}</p>
                      </div>
                    )}
                    {method.phone && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Phone:</span>
                        <p className="font-mono text-potomac-yellow">{method.phone}</p>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Response Time: {method.responseTime || method.availability}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-2xl font-rajdhani font-bold text-potomac-gray mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-potomac-yellow focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-potomac-yellow focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-potomac-yellow focus:border-transparent"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-potomac-yellow focus:border-transparent"
                    placeholder="Please describe your issue in detail"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary focus-ring"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-2xl font-rajdhani font-bold text-potomac-gray mb-6">System Status Overview</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { service: 'API Service', status: 'operational', description: 'All systems operational' },
                  { service: 'Authentication', status: 'operational', description: 'All systems operational' },
                  { service: 'Database', status: 'operational', description: 'All systems operational' },
                  { service: 'File Storage', status: 'operational', description: 'All systems operational' },
                  { service: 'AI Services', status: 'operational', description: 'All systems operational' },
                  { service: 'Webhooks', status: 'operational', description: 'All systems operational' },
                ].map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-rajdhani font-bold text-potomac-gray">{service.service}</h4>
                      <span className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} animate-pulse`}></span>
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-rajdhani font-bold mb-4">
            Need More Help?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Our support team is here to help you every step of the way. Whether you have a technical question or need assistance with your integration, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs" className="btn-primary bg-white text-potomac-gray text-lg px-8 py-4 font-bold hover:bg-gray-100 focus-ring">
              View Documentation
            </Link>
            <Link href="/support/contact" className="btn-secondary border-2 border-white text-white text-lg px-8 py-4 font-bold hover:bg-white hover:text-potomac-gray focus-ring">
              Contact Support
            </Link>
          </div>
          <div className="mt-8 text-gray-400 text-sm">
            Built to Conquer Risk®
          </div>
        </div>
      </section>
    </div>
  );
}
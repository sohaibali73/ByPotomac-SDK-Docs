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
      href: '/docs',
      gradient: 'from-primary/20 to-primary/5',
      borderColor: 'border-primary/30',
      iconColor: 'text-primary',
    },
    {
      title: 'API Reference',
      description: 'Complete reference documentation for all API endpoints and parameters.',
      href: '/api-reference',
      gradient: 'from-accent/20 to-accent/5',
      borderColor: 'border-accent/30',
      iconColor: 'text-accent',
    },
    {
      title: 'Developer Guides',
      description: 'Step-by-step guides for common use cases and integration scenarios.',
      href: '/guides',
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Community Forum',
      description: 'Connect with other developers and share knowledge.',
      href: '/community',
      gradient: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help from our support team via email.',
      email: 'support@bypotomac.com',
      responseTime: 'Within 24 hours',
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time.',
      availability: 'Mon-Fri, 9 AM - 6 PM EST',
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our technical support team.',
      phone: '+1 (555) 123-4567',
      availability: 'Mon-Fri, 9 AM - 6 PM EST',
    },
    {
      title: 'Emergency Support',
      description: 'For critical issues affecting your production environment.',
      availability: '24/7',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500';
      case 'degraded': return 'bg-amber-500';
      case 'partial': return 'bg-orange-500';
      case 'major': return 'bg-red-500';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-primary-foreground font-bold text-xs">BP</span>
                </div>
              </Link>
              <span className="text-border">/</span>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Support Center
              </h1>
            </div>
            <p className="text-muted-foreground">
              We are here to help you succeed with the ByPotomac SDK
            </p>
          </div>
        </div>
      </header>

      {/* Status Section */}
      <section className="border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground">System Status</h2>
              <p className="text-muted-foreground text-sm">Current status of our services</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor('operational')} animate-pulse`}></span>
                <span className="font-medium text-foreground text-sm">All Systems Operational</span>
              </div>
              <Link href="/status" className="btn-secondary text-sm">
                View Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="-mb-px flex gap-1">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'faqs', name: 'FAQs' },
              { id: 'contact', name: 'Contact Us' },
              { id: 'status', name: 'System Status' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportOptions.map((option) => (
                <Link
                  key={option.title}
                  href={option.href}
                  className={`group card bg-gradient-to-br ${option.gradient} border ${option.borderColor} hover:border-muted-foreground/40 transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-background/50 ${option.iconColor}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {option.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* Getting Help */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card-hover">
                <h3 className="text-lg font-heading font-bold text-foreground mb-4">Getting Started</h3>
                <div className="space-y-1">
                  <Link href="/docs/getting-started" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-muted-foreground hover:text-foreground transition-colors">Read the Getting Started Guide</span>
                  </Link>
                  <Link href="/guides" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    <span className="text-muted-foreground hover:text-foreground transition-colors">Explore Developer Guides</span>
                  </Link>
                  <Link href="/api-reference" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <span className="text-muted-foreground hover:text-foreground transition-colors">Browse API Reference</span>
                  </Link>
                </div>
              </div>

              <div className="card-hover">
                <h3 className="text-lg font-heading font-bold text-foreground mb-4">Common Issues</h3>
                <div className="space-y-1">
                  <Link href="/docs/authentication" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span className="text-muted-foreground hover:text-foreground transition-colors">Authentication Problems</span>
                  </Link>
                  <Link href="/docs/rate-limiting" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    <span className="text-muted-foreground hover:text-foreground transition-colors">Rate Limiting</span>
                  </Link>
                  <Link href="/docs/error-handling" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span className="text-muted-foreground hover:text-foreground transition-colors">Error Handling</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-heading font-bold text-foreground mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h4 className="text-base font-heading font-bold text-foreground mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                    <span className="inline-block mt-3 badge badge-info text-xs">
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
            <div className="card">
              <h3 className="text-xl font-heading font-bold text-foreground mb-6">Contact Our Support Team</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="text-center p-6 bg-muted/30 rounded-xl border border-border hover:border-muted-foreground/30 transition-colors">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-heading font-bold text-foreground mb-2">
                      {method.title}
                    </h4>
                    <p className="text-muted-foreground text-sm mb-4">{method.description}</p>
                    {method.email && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">Email:</span>
                        <p className="font-mono text-primary text-sm">{method.email}</p>
                      </div>
                    )}
                    {method.phone && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">Phone:</span>
                        <p className="font-mono text-primary text-sm">{method.phone}</p>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Response: {method.responseTime || method.availability}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="card">
              <h3 className="text-xl font-heading font-bold text-foreground mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea
                    rows={5}
                    className="input resize-none"
                    placeholder="Please describe your issue in detail"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
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
            <div className="card">
              <h3 className="text-xl font-heading font-bold text-foreground mb-6">System Status Overview</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { service: 'API Service', status: 'operational', description: 'All systems operational' },
                  { service: 'Authentication', status: 'operational', description: 'All systems operational' },
                  { service: 'Database', status: 'operational', description: 'All systems operational' },
                  { service: 'File Storage', status: 'operational', description: 'All systems operational' },
                  { service: 'AI Services', status: 'operational', description: 'All systems operational' },
                  { service: 'Webhooks', status: 'operational', description: 'All systems operational' },
                ].map((service, index) => (
                  <div key={index} className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-heading font-semibold text-foreground">{service.service}</h4>
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(service.status)} animate-pulse`}></span>
                    </div>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-card border-t border-border py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            Need More Help?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our support team is here to help you every step of the way. Whether you have a technical question or need assistance with your integration, we have got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs" className="btn-primary text-base px-8 py-3">
              View Documentation
            </Link>
            <Link href="/support/contact" className="btn-secondary text-base px-8 py-3">
              Contact Support
            </Link>
          </div>
          <div className="mt-8 text-muted-foreground text-sm">
            Built to Conquer Risk
          </div>
        </div>
      </section>
    </div>
  );
}

// src/components/pages/WeVisaLandingPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const COUNTRIES = [
  { name: 'Canada', flag: '🇨🇦', packages: 1, price: '₹1,180', desc: 'Canada visa services - Tourist, Business, and Student visas available' },
  { name: 'United Arab Emirates', flag: '🇦🇪', packages: 2, price: '₹236', desc: 'UAE visa services - Tourist, Business, and Work visas available' },
  { name: 'United States', flag: '🇺🇸', packages: 0, price: null, desc: 'USA visa services - Tourist, Business, Student, and Work visas available' },
]

const EXPRESS_VISAS = [
  { country: 'Dubai', flag: '🇦🇪', type: 'eVisa', processing: '4 Hours', stay: '30 Days' },
  { country: 'Singapore', flag: '🇸🇬', type: 'eVisa', processing: '24 Hours', stay: '30 Days' },
  { country: 'Vietnam', flag: '🇻🇳', type: 'eVisa', processing: '2 Hours', stay: '30 Days' },
  { country: 'Bali', flag: '🇮🇩', type: 'eVisa', processing: '24 Hours', stay: '30 Days' },
  { country: 'Turkey', flag: '🇹🇷', type: 'eVisa', processing: '24 Hours', stay: '90 Days' },
]

const BUSINESS_TOOLS = [
  { icon: '📊', title: 'CRM Dashboard', desc: 'Manage your customer relationships, leads, and business operations efficiently.' },
  { icon: '🧾', title: 'Invoice Generator', desc: 'Create professional invoices for your travel and visa services.' },
  { icon: '📅', title: 'USA Early Appointment', desc: 'Book early appointment slots for USA visa applications.' },
  { icon: '🎫', title: 'Dummy Tickets', desc: 'Generate dummy flight tickets for visa applications and travel planning.' },
  { icon: '🗓️', title: 'Schengen Appointments', desc: 'Schedule appointments for Schengen visa applications across European countries.' },
  { icon: '🎨', title: 'Flyer Designer', desc: 'Design professional marketing flyers for your travel agency.' },
  { icon: '📱', title: 'International SIM Cards', desc: 'Stay connected worldwide with our international SIM card solutions.' },
]

const TESTIMONIALS = [
  { name: 'Rajiv Sharma', city: 'Mumbai', years: 3, text: 'WeVisa has transformed our business. The express visa service for Dubai is exceptional, our clients get approvals in just 4 hours!' },
  { name: 'Priya Patel', city: 'Delhi', years: 2, text: 'Since partnering with WeVisa, our Singapore tour packages have seen a 40% increase in bookings. The 24-hour visa service is a game-changer!' },
  { name: 'Anand Gupta', city: 'Bangalore', years: 1, text: 'Our luxury Maldives packages are now easier to sell with WeVisa handling all the documentation. Clients love the hassle-free experience.' },
  { name: 'Lakshmi Nair', city: 'Kochi', years: 2, text: 'As a local Kerala tour operator, WeVisa has helped us bring international tourists to our state with minimal visa hassles.' },
]

const AGENCY_TESTIMONIALS = [
  { agency: 'Travel Hub Pvt Ltd', city: 'Mumbai', text: 'Partnered with WeVisa 6 months ago. The B2B platform is excellent with competitive commission rates. Processing 50+ visas monthly now!' },
  { agency: 'Global Tours & Travels', city: 'Delhi', text: 'Best B2B visa platform in India. CRM tools and invoice system help us manage clients efficiently. Support team is always responsive.' },
  { agency: 'Skyways Travel Agency', city: 'Bangalore', text: 'Earning great commission on every visa. The agent dashboard makes it easy to track all applications and payments. Highly recommended!' },
  { agency: 'Wanderlust Tours', city: 'Hyderabad', text: 'Professional B2B partner. Fast visa processing and transparent pricing. Our business has grown 40% since joining WeVisa!' },
]

const NEWS = [
  { date: 'Apr 16, 2026', title: 'New Visa Rules for Schengen Countries in 2026', desc: 'Important changes to Schengen visa processing times and requirements that every traveler should know about.', tags: ['Schengen', 'Visa Rules', 'Europe'] },
  { date: 'Apr 15, 2026', title: 'Top 10 Documents Needed for US Tourist Visa', desc: 'A comprehensive checklist of all documents you need to prepare for your US B1/B2 visa interview.', tags: ['USA', 'Tourist Visa', 'Documents'] },
  { date: 'Apr 14, 2026', title: 'How to Track Your Visa Application Status Online', desc: 'Step-by-step guide to tracking your visa application status for different countries through our platform.', tags: ['Tracking', 'Guide', 'Tips'] },
]

export default function WeVisaLandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl text-blue-900">We<span className="text-blue-600">Visa</span></span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-700">
            <button className="hover:text-blue-600 flex items-center gap-1">Visa Services <span className="text-xs">▾</span></button>
            <button className="hover:text-blue-600 flex items-center gap-1">Business Services <span className="text-xs">▾</span></button>
            <button className="hover:text-blue-600 flex items-center gap-1">Travel Services <span className="text-xs">▾</span></button>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/wevisa/login">
              <button className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-blue-500 hover:text-blue-600 transition-all">Agent Login</button>
            </Link>
            <Link to="/wevisa/register">
              <button className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all shadow">Become a Partner</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-extrabold leading-tight max-w-2xl mb-4">
              Partner with India's Leading B2B Visa Platform
            </h1>
            <p className="text-lg text-blue-100 max-w-xl mb-8">
              Exclusively for Travel Agents & Agencies - Process visas efficiently and grow your business with competitive commissions
            </p>
            <div className="flex gap-4 mb-12">
              <Link to="/wevisa/register">
                <button className="px-6 py-3 rounded-lg bg-blue-700 border-2 border-white text-white font-bold hover:bg-blue-600 transition-all">
                  Become a Partner Agent
                </button>
              </Link>
              <Link to="/wevisa/login">
                <button className="px-6 py-3 rounded-lg bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all">
                  Agent Login
                </button>
              </Link>
            </div>
            {/* Stats */}
            <div className="bg-white text-gray-800 rounded-2xl p-6 inline-flex gap-12 shadow-xl">
              <div><div className="text-2xl font-extrabold text-blue-900">₹500+</div><div className="text-sm text-gray-500">Per Visa</div></div>
              <div className="border-l border-gray-200 pl-12"><div className="text-2xl font-extrabold text-blue-900">24/7</div><div className="text-sm text-gray-500">Support</div></div>
              <div className="border-l border-gray-200 pl-12"><div className="text-2xl font-extrabold text-blue-900">100+</div><div className="text-sm text-gray-500">Countries</div></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Countries Slider */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore all countries</h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            {COUNTRIES.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <div className="font-bold text-gray-800">{c.name}</div>
                    {c.packages > 0 && <div className="text-xs text-gray-400">{c.packages} package{c.packages > 1 ? 's' : ''}</div>}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">{c.desc}</p>
                {c.price && <div className="text-blue-600 font-semibold text-sm mb-3">From {c.price}</div>}
                <button className="w-full py-2 rounded-lg border border-blue-500 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-all">
                  View Visa Details
                </button>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <button className="text-blue-600 font-semibold text-sm hover:underline">View All 3 Countries →</button>
          </div>
        </div>
      </section>

      {/* Express Visas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500 text-xl">⚡</span>
            <h2 className="text-2xl font-bold text-gray-800">Express Visas for Your Clients</h2>
          </div>
          <p className="text-gray-500 mb-8">Process visas quickly and earn commission on every application</p>
          <div className="grid grid-cols-5 gap-4">
            {EXPRESS_VISAS.map((v, i) => (
              <motion.div key={v.country} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="text-2xl mb-2">{v.flag}</div>
                <div className="font-bold text-gray-800 mb-3">{v.country}</div>
                <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                  <div className="flex justify-between"><span>Visa Type</span><span className="font-semibold text-gray-700">{v.type}</span></div>
                  <div className="flex justify-between"><span>Processing</span><span className="font-semibold text-green-600">{v.processing}</span></div>
                  <div className="flex justify-between"><span>Stay</span><span className="font-semibold text-gray-700">{v.stay}</span></div>
                </div>
                <button className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all">Apply Now</button>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button className="text-blue-600 font-semibold text-sm hover:underline">View All Countries →</button>
          </div>
        </div>
      </section>

      {/* Business Tools */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Business Tools for Travel Agents</h2>
          <p className="text-gray-500 mb-8">Complete toolkit to manage your travel agency business efficiently - from CRM to invoicing and marketing materials.</p>
          <div className="grid grid-cols-4 gap-5">
            {BUSINESS_TOOLS.map((t, i) => (
              <motion.div key={t.title} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                <div className="text-3xl mb-3">{t.icon}</div>
                <div className="font-bold text-gray-800 mb-2">{t.title}</div>
                <p className="text-sm text-gray-500 mb-4">{t.desc}</p>
                <button className="text-blue-600 text-sm font-semibold group-hover:underline">Get Started →</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose WeVisa */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤝</span>
            <h2 className="text-2xl font-bold text-gray-800">Why Travel Agents Choose WeVisa</h2>
          </div>
          <p className="text-gray-500 mb-8">Join 1000+ travel agent partners across India who trust WeVisa for fast, reliable B2B visa services with excellent commission structure.</p>
          <div className="grid grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-800">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.city} · Partner for {t.years} year{t.years > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agency Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💬</span>
            <h2 className="text-2xl font-bold text-gray-800">What Travel Agents Say About Us</h2>
          </div>
          <div className="grid grid-cols-3 gap-5 mt-8">
            {AGENCY_TESTIMONIALS.slice(0, 3).map((t, i) => (
              <div key={t.agency} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                    {t.agency[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-800">{t.agency}</div>
                    <div className="text-xs text-gray-400">{t.city}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">New Updates</div>
              <h2 className="text-2xl font-bold text-gray-800">Latest News & Articles</h2>
              <p className="text-gray-500 text-sm mt-1">Stay informed with the latest visa news, travel tips, and important updates from our team.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {NEWS.map((n, i) => (
              <div key={n.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                <div className="text-xs text-gray-400 mb-2">{n.date}</div>
                <h3 className="font-bold text-gray-800 mb-2 leading-snug">{n.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{n.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {n.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button className="text-blue-600 font-semibold text-sm hover:underline">View All Updates →</button>
          </div>
        </div>
      </section>

      {/* Invoice CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl">🧾</span>
              <h2 className="text-2xl font-bold text-gray-800">Advanced Invoice & Purchase Management</h2>
            </div>
            <p className="text-gray-500 mb-8">Create professional invoices with our enhanced platform designed specifically for travel agents.</p>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[
                { icon: '📋', title: 'GST-Compliant Invoicing', desc: 'Create invoices with service charge and GST calculations that comply with tax regulations.' },
                { icon: '🛒', title: 'Purchase Management', desc: 'Track purchases and link them to invoices for complete financial visibility.' },
                { icon: '💰', title: 'Profit Calculation', desc: 'Automatically calculate profits by comparing sales and purchase amounts.' },
                { icon: '💳', title: 'Advanced Payment Tracking', desc: 'Track invoices with statuses: Paid, Unpaid, Partially Paid, Refunded, and Overdue.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm mb-1">{item.title}</div>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/wevisa/invoice">
              <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow">
                Open Invoice Dashboard →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="font-extrabold text-xl text-blue-900 mb-3">We<span className="text-blue-600">Visa</span></div>
              <p className="text-sm text-gray-500">Your trusted B2B partner for visa services - exclusively for travel agents and agencies</p>
            </div>
            <div>
              <div className="font-bold text-gray-800 mb-3">For Agents</div>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="hover:text-blue-600 cursor-pointer">Become a Partner</div>
                <div className="hover:text-blue-600 cursor-pointer">Agent Login</div>
                <div className="hover:text-blue-600 cursor-pointer">Countries We Serve</div>
                <div className="hover:text-blue-600 cursor-pointer">CRM Dashboard</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-800 mb-3">Support</div>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="hover:text-blue-600 cursor-pointer">Agent Help Center</div>
                <div className="hover:text-blue-600 cursor-pointer">Contact Support</div>
                <div className="hover:text-blue-600 cursor-pointer">Commission Structure</div>
                <div className="hover:text-blue-600 cursor-pointer">Track Applications</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-800 mb-3">Contact Us</div>
              <div className="space-y-2 text-sm text-gray-500">
                <div>Western Entertainers LLP</div>
                <div>Email: contact@wevisa.com</div>
                <div>Phone: +91 XXXXXXXXXX</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            © 2026 WeVisa. All rights reserved. Powered by Western Entertainers LLP
          </div>
        </div>
      </footer>
    </div>
  )
}

// src/components/pages/WeVisaUSAAppointmentPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'

const APPOINTMENT_OPTIONS = [
  {
    id: 'pan-india',
    badge: 'Basic',
    title: 'Pan India (Multi City)',
    desc: 'Available across all VFS centers in India',
    features: [
      { icon: '📍', title: 'Selected City', sub: 'Book in your chosen city only' },
      { icon: '📅', title: 'Standard Booking', sub: 'Appointments within 3-4 weeks' },
    ],
    price: '₹35,000',
    startingFrom: true,
  },
  {
    id: 'state',
    badge: 'Basic',
    title: 'State Specific',
    desc: 'Choose your preferred state location',
    features: [
      { icon: '📍', title: 'Selected City', sub: 'Book in your chosen city only' },
      { icon: '📅', title: 'Standard Booking', sub: 'Appointments within 3-4 weeks' },
    ],
    price: '₹25,000',
    startingFrom: true,
  },
  {
    id: 'city',
    badge: 'Basic',
    title: 'City Specific',
    desc: 'Book for your specific city',
    features: [
      { icon: '📍', title: 'Selected City', sub: 'Book in your chosen city only' },
      { icon: '📅', title: 'Standard Booking', sub: 'Appointments within 3-4 weeks' },
    ],
    price: '₹20,000',
    startingFrom: true,
  },
]

const IMPORTANT_INFO = [
  'Appointment booking is subject to availability at the US Embassy/Consulate',
  'Full payment is required to secure your appointment slot',
  'Your passport and required documents must be ready before booking',
  'Our team will assist with the entire application process',
  'Cancellation policy: 50% refund if cancelled 7 days prior to booking',
]

export default function WeVisaUSAAppointmentPage() {
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)

  const handleSelect = (opt) => {
    setSelectedOption(opt)
    setShowForm(true)
  }

  if (showForm && selectedOption) {
    return <WeVisaUSAApplicationForm option={selectedOption} onBack={() => setShowForm(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 px-6 h-12 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600">Visa Services <span className="text-xs">▾</span></span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600">Business Services <span className="text-xs">▾</span></span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600">Travel Services <span className="text-xs">▾</span></span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:border-blue-400">Agent Login</button>
          <button className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600">Become a Partner</button>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-blue-50/50 border-b border-blue-100 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">15% OFF</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold">Trending</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">USA Early Appointment</h1>
          <p className="text-gray-500">Priority slot booking for USA visa appointments within 2 weeks</p>
        </div>
      </div>

      {/* Appointment Options */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-8">Select Appointment Location Type</h2>
        <div className="grid grid-cols-3 gap-6 mb-10">
          {APPOINTMENT_OPTIONS.map((opt, i) => (
            <motion.div key={opt.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-blue-600 rounded-2xl p-6 text-white shadow-md">
              <div className="mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 font-semibold">{opt.badge}</span>
              </div>
              <h3 className="text-lg font-extrabold mb-1">{opt.title}</h3>
              <p className="text-blue-200 text-xs mb-4">{opt.desc}</p>
              <div className="space-y-2 mb-5">
                {opt.features.map(f => (
                  <div key={f.title} className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">{f.icon}</span>
                    <div>
                      <div className="text-xs font-semibold">{f.title}</div>
                      <div className="text-xs text-blue-200">{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-lg font-extrabold mb-3">Starting from {opt.price}</div>
              <button
                onClick={() => handleSelect(opt)}
                className="w-full py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all"
              >
                Select This Option
              </button>
            </motion.div>
          ))}
        </div>

        {/* Important Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Important Information</h3>
          <ul className="space-y-2">
            {IMPORTANT_INFO.map(info => (
              <li key={info} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-4 gap-6 text-sm">
          <div>
            <div className="font-extrabold text-blue-900">We<span className="text-blue-600">Visa</span></div>
            <p className="text-xs text-gray-400 mt-2">Your trusted B2B partner for visa services - exclusively for travel agents and agencies</p>
          </div>
          <div>
            <div className="font-bold text-gray-700 mb-2">For Agents</div>
            <div className="space-y-1 text-xs text-gray-400">
              <div>Become a Partner</div>
              <div>Agent Login</div>
            </div>
          </div>
          <div>
            <div className="font-bold text-gray-700 mb-2">Support</div>
            <div className="space-y-1 text-xs text-gray-400">
              <div>Agent Help Center</div>
              <div>Contact Support</div>
            </div>
          </div>
          <div>
            <div className="font-bold text-gray-700 mb-2">Contact Us</div>
            <div className="space-y-1 text-xs text-gray-400">
              <div>Western Entertainers LLP</div>
              <div>Email: contact@wevisa.com</div>
              <div>Phone: +91 XXXXXXXXXX</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function WeVisaUSAApplicationForm({ option, onBack }) {
  const [form, setForm] = useState({
    fullName: 'John Doe', email: '', phone: '+91 9876543210',
    username: 'das@gmail.com', password: '',
    sq1: '', sq1a: '', sq2: '', sq2a: '',
  })

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <nav className="bg-white border-b border-gray-100 px-6 h-12 flex items-center justify-between shadow-sm">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold">Agent Login</button>
          <button className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold">Become a Partner</button>
        </div>
      </nav>

      <div className="bg-blue-50/50 border-b border-blue-100 px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">15% OFF</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold">Trending</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">USA Early Appointment</h1>
          <p className="text-gray-500 text-sm">Priority slot booking for USA visa appointments within 2 weeks</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:border-gray-300 text-gray-600">← Back</button>
          <h2 className="text-xl font-bold text-gray-800">Complete Your Application</h2>
        </div>

        {/* Selected option info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm">
          <div><span className="font-semibold text-blue-800">Selected Option:</span> <span className="text-blue-600">{option.title}</span></div>
          <div><span className="font-semibold text-blue-800">Timeframe:</span> <span className="text-blue-600">Within 30 Days</span></div>
          <div><span className="font-semibold text-blue-800">Price:</span> <span className="text-blue-600">₹55,000</span></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Your Information */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Your Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
            </div>
          </div>

          {/* Upload Documents */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Upload Documents</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Passport Front Page', 'Passport Back Page'].map(doc => (
                <div key={doc}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{doc}</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-all cursor-pointer bg-gray-50">
                    <div className="text-gray-400 text-2xl mb-1">⬆️</div>
                    <div className="text-xs text-gray-400">Upload {doc.toLowerCase()}</div>
                    <button className="mt-2 px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-gray-300">Select File</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Credentials */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">🔑 Login Credentials</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="••••" />
              </div>
            </div>
          </div>

          {/* Security Questions */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">🔒 Security Questions</h3>
            {[1, 2].map(n => (
              <div key={n} className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3">
                <div className="font-semibold text-sm text-gray-700 mb-3">Security Question {n}</div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Question</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="Enter your security question" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Answer</label>
                    <input className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="Enter your answer" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md">
            Submit Application →
          </button>
        </div>
      </div>
    </div>
  )
}

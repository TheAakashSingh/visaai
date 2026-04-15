// src/components/wevisa/WeVisaUSAAppointmentPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaServicesAPI } from '@/services/wevisaApi'

const LOCATION_TYPES = [
  { id: 'pan_india', label: 'Pan India (Multi City)', desc: 'Available across all VFS centers in India', price: 35000, timeframe: 'Within 30 Days', badge: 'Most Popular', badgeColor: 'bg-blue-100 text-blue-700', features: ['All major cities covered', 'Multiple VFS centers', 'Flexible scheduling'] },
  { id: 'state_specific', label: 'State Specific', desc: 'Choose your preferred state location', price: 25000, timeframe: 'Within 3-4 Weeks', badge: 'Recommended', badgeColor: 'bg-green-100 text-green-700', features: ['State-level priority', 'Faster processing', 'Dedicated slots'] },
  { id: 'city_specific', label: 'City Specific', desc: 'Book for your specific city', price: 20000, timeframe: 'Within 3-4 Weeks', badge: 'Basic', badgeColor: 'bg-gray-100 text-gray-600', features: ['Your city only', 'Standard booking', 'Available slots'] },
]

const IMPORTANT_NOTES = [
  'Appointment booking is subject to availability at the US Embassy/Consulate',
  'Full payment is required to secure your appointment slot',
  'Your passport and required documents must be ready before booking',
  'Our team will assist with the entire application process',
  'Cancellation policy: 50% refund if cancelled 7 days prior to booking',
]

const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', booked: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-700' }

function ApplicationForm({ type, onBack }) {
  const [form, setForm] = useState({ applicantName: '', applicantEmail: '', applicantPhone: '', locationType: type.id, usVisaUsername: '', usVisaPassword: '', sq1: '', sq1a: '', sq2: '', sq2a: '', state: '', city: '' })
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => wevisaServicesAPI.createUSAAppointment({ ...form, price: type.price, timeframe: type.timeframe }),
    onSuccess: () => { qc.invalidateQueries(['wevisa-usa-appointments']); toast.success('🇺🇸 USA Appointment submitted successfully!'); onBack() },
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        ← Back to Options
      </button>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold text-blue-800">{type.label}</div>
            <div className="text-sm text-blue-600">{type.timeframe} · <span className="font-extrabold text-blue-800">₹{type.price.toLocaleString()}</span></div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${type.badgeColor}`}>{type.badge}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">👤 Your Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Full Name *</label>
              <input value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
              <input value={form.applicantEmail} onChange={e => setForm({ ...form, applicantEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="your@email.com" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone Number</label>
            <input value={form.applicantPhone} onChange={e => setForm({ ...form, applicantPhone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="+91 9876543210" />
          </div>
          {type.id === 'state_specific' && (
            <div className="mt-3">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Preferred State</label>
              <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50">
                <option value="">Select State</option>
                {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Kerala', 'Punjab'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          {type.id === 'city_specific' && (
            <div className="mt-3">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">City</label>
              <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50">
                <option value="">Select City</option>
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Chandigarh', 'Kochi'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Passport Upload */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">📄 Upload Documents</h3>
          <div className="grid grid-cols-2 gap-4">
            {['Passport Front Page', 'Passport Back Page'].map(doc => (
              <div key={doc}>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{doc}</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⬆️</div>
                  <div className="text-xs text-gray-400">Click to upload</div>
                  <div className="text-[10px] text-gray-300 mt-1">PNG, JPG up to 5MB</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* US Visa Login */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">🔑 US Visa Login Credentials</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Username</label>
              <input value={form.usVisaUsername} onChange={e => setForm({ ...form, usVisaUsername: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="Your US visa portal username" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Password</label>
              <input type="password" value={form.usVisaPassword} onChange={e => setForm({ ...form, usVisaPassword: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="••••••••" />
            </div>
          </div>
        </div>

        {/* Security Questions */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">🔒 Security Questions</h3>
          {[{ num: 1, q: 'sq1', a: 'sq1a' }, { num: 2, q: 'sq2', a: 'sq2a' }].map(sq => (
            <div key={sq.num} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-3">
              <div className="font-semibold text-sm text-gray-700 mb-3">Security Question {sq.num}</div>
              <div className="space-y-2">
                <input value={form[sq.q]} onChange={e => setForm({ ...form, [sq.q]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="Enter your security question" />
                <input value={form[sq.a]} onChange={e => setForm({ ...form, [sq.a]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" placeholder="Enter your answer" />
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => mut.mutate()} disabled={!form.applicantName || mut.isPending}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-extrabold text-base hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-xl transition-all">
          {mut.isPending ? 'Submitting...' : '🇺🇸 Submit USA Appointment — ₹' + type.price.toLocaleString()}
        </button>
      </div>
    </div>
  )
}

export default function WeVisaUSAAppointmentPage() {
  const [selectedType, setSelectedType] = useState(null)

  const { data: appts } = useQuery({
    queryKey: ['wevisa-usa-appointments'],
    queryFn: () => wevisaServicesAPI.getUSAAppointments().then(r => r.data.data || []),
  })

  if (selectedType) return <ApplicationForm type={selectedType} onBack={() => setSelectedType(null)} />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold">15% OFF</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 font-bold">🔥 Trending</span>
        </div>
        <h2 className="font-extrabold text-3xl text-gray-800 mt-2">USA Early Appointment</h2>
        <p className="text-gray-500 mt-1">Priority slot booking for USA visa appointments within 2 weeks</p>
      </div>

      {/* Options */}
      <h3 className="font-bold text-gray-700 text-center text-xl mb-6">Select Appointment Location Type</h3>
      <div className="grid grid-cols-3 gap-5 mb-10">
        {LOCATION_TYPES.map((type, i) => (
          <motion.div key={type.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer"
            onClick={() => setSelectedType(type)}>
            <div className="mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${type.badgeColor}`}>{type.badge}</span>
            </div>
            <h3 className="text-xl font-extrabold mb-1">{type.label}</h3>
            <p className="text-blue-200 text-sm mb-5">{type.desc}</p>
            <div className="space-y-2 mb-6">
              {type.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-blue-300">✓</span>
                  <span className="text-blue-100">{f}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-blue-500/50 pt-4">
              <div className="text-blue-200 text-xs mb-1">Starting from</div>
              <div className="text-2xl font-extrabold">₹{type.price.toLocaleString()}</div>
            </div>
            <button className="w-full mt-4 py-3 rounded-2xl bg-white text-blue-700 font-extrabold text-sm hover:bg-blue-50 transition-all shadow">
              Select This Option →
            </button>
          </motion.div>
        ))}
      </div>

      {/* Important info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">⚠️ Important Information</h3>
        <ul className="space-y-2">
          {IMPORTANT_NOTES.map(note => (
            <li key={note} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>{note}
            </li>
          ))}
        </ul>
      </div>

      {/* My appointments */}
      {appts && appts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">📋 My USA Appointments ({appts.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {appts.map(appt => (
              <div key={appt._id} className="flex items-center gap-4 px-6 py-4">
                <div className="text-2xl">🇺🇸</div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-800">{appt.applicantName}</div>
                  <div className="text-xs text-gray-400">{LOCATION_TYPES.find(t => t.id === appt.locationType)?.label || appt.locationType}</div>
                </div>
                <div className="font-bold text-blue-700">₹{appt.price?.toLocaleString()}</div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${STATUS_COLORS[appt.status] || 'bg-gray-100 text-gray-500'}`}>{appt.status}</span>
                {appt.trackingId && <div className="text-[10px] text-gray-400 font-mono">{appt.trackingId}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

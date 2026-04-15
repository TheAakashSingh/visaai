// src/components/wevisa/WeVisaSchengenPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaServicesAPI } from '@/services/wevisaApi'

const SCHENGEN_COUNTRIES = [
  { name: 'France', flag: '🇫🇷', embassy: 'VFS Global', price: 8500, info: 'Most popular Schengen destination. Paris, French Riviera, Alps.' },
  { name: 'Germany', flag: '🇩🇪', embassy: 'VFS Global', price: 8000, info: 'Business and tourism. Berlin, Munich, Frankfurt.' },
  { name: 'Italy', flag: '🇮🇹', embassy: 'VFS Global', price: 8500, info: 'Rome, Venice, Milan. Art and culture destination.' },
  { name: 'Spain', flag: '🇪🇸', embassy: 'BLS International', price: 8000, info: 'Barcelona, Madrid. Beach and culture tourism.' },
  { name: 'Netherlands', flag: '🇳🇱', embassy: 'VFS Global', price: 8000, info: 'Amsterdam, tulips and windmills. Business hub.' },
  { name: 'Switzerland', flag: '🇨🇭', embassy: 'VFS Global', price: 9000, info: 'Alps, luxury destinations, banking and business.' },
  { name: 'Portugal', flag: '🇵🇹', embassy: 'VFS Global', price: 7500, info: 'Lisbon, Porto. Affordable European destination.' },
  { name: 'Greece', flag: '🇬🇷', embassy: 'BLS International', price: 7500, info: 'Athens, Santorini, Mykonos. Island paradise.' },
  { name: 'Austria', flag: '🇦🇹', embassy: 'VFS Global', price: 8000, info: 'Vienna, Salzburg. Music and history.' },
  { name: 'Belgium', flag: '🇧🇪', embassy: 'VFS Global', price: 8000, info: 'Brussels, Bruges. EU headquarters, chocolate.' },
  { name: 'Czech Republic', flag: '🇨🇿', embassy: 'VFS Global', price: 7500, info: 'Prague, beautiful architecture and culture.' },
  { name: 'Poland', flag: '🇵🇱', embassy: 'VFS Global', price: 7000, info: 'Warsaw, Krakow. Emerging European destination.' },
]

const VISA_TYPES = [
  { id: 'tourist', label: 'Tourist Visa', icon: '🏖️' },
  { id: 'business', label: 'Business Visa', icon: '💼' },
  { id: 'student', label: 'Student Visa', icon: '🎓' },
  { id: 'family', label: 'Family Visa', icon: '👨‍👩‍👧' },
]

function ApplicationModal({ country, onClose }) {
  const [form, setForm] = useState({ applicantName: '', applicantEmail: '', applicantPhone: '', country: country.name, visaType: 'tourist', appointmentDate: '', appointmentCenter: '' })
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => wevisaServicesAPI.createSchengenAppointment({ ...form, price: country.price }),
    onSuccess: () => { qc.invalidateQueries(['wevisa-schengen-appointments']); toast.success(`${country.flag} ${country.name} appointment submitted!`); onClose() },
  })

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <div className="font-extrabold text-xl">{country.name}</div>
                <div className="text-blue-200 text-sm">Schengen Visa · ₹{country.price.toLocaleString()}</div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Applicant Full Name *</label>
            <input value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="As per passport" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
              <input value={form.applicantEmail} onChange={e => setForm({ ...form, applicantEmail: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone</label>
              <input value={form.applicantPhone} onChange={e => setForm({ ...form, applicantPhone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="+91 98765..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Visa Type</label>
            <div className="grid grid-cols-2 gap-2">
              {VISA_TYPES.map(vt => (
                <button key={vt.id} onClick={() => setForm({ ...form, visaType: vt.id })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.visaType === vt.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span>{vt.icon}</span> {vt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Preferred Appointment Date</label>
            <input type="date" value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">VFS Center City</label>
            <select value={form.appointmentCenter} onChange={e => setForm({ ...form, appointmentCenter: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50">
              <option value="">Select city</option>
              {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 text-xs text-indigo-700">
            ℹ️ Processing time: 15 working days after appointment. {country.embassy} handles {country.name} Schengen visas.
          </div>
          <button onClick={() => mut.mutate()} disabled={!form.applicantName || mut.isPending}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 shadow-xl">
            {mut.isPending ? 'Submitting...' : `Submit Application — ₹${country.price.toLocaleString()}`}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function WeVisaSchengenPage() {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [previewCountry, setPreviewCountry] = useState(SCHENGEN_COUNTRIES[0])

  const { data: appts } = useQuery({
    queryKey: ['wevisa-schengen-appointments'],
    queryFn: () => wevisaServicesAPI.getSchengenAppointments().then(r => r.data.data || []),
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-extrabold text-2xl text-gray-800">🗓️ Schengen Appointments</h2>
        <p className="text-sm text-gray-400">Schedule appointments for Schengen visa applications across European countries</p>
      </div>

      {/* Country grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {SCHENGEN_COUNTRIES.map((country, i) => (
          <motion.div key={country.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl border ${previewCountry.name === country.name ? 'border-indigo-400 shadow-lg' : 'border-gray-100 shadow-sm'} p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all`}
            onClick={() => setPreviewCountry(country)}>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">{country.flag}</span>
              <div className="font-bold text-gray-800 text-sm">{country.name}</div>
            </div>
            <div className="text-xs text-gray-400 mb-3 line-clamp-2">{country.info}</div>
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-indigo-700 text-sm">₹{country.price.toLocaleString()}</div>
              <button onClick={e => { e.stopPropagation(); setSelectedCountry(country) }}
                className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all">
                Apply
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Preview panel */}
      {previewCountry && (
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="font-bold text-gray-800 mb-4">🌍 Select Country</div>
            <select value={previewCountry.name} onChange={e => setPreviewCountry(SCHENGEN_COUNTRIES.find(c => c.name === e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50 mb-4">
              {SCHENGEN_COUNTRIES.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{previewCountry.flag}</span>
                <div className="font-bold text-gray-800">About {previewCountry.name}</div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{previewCountry.info}</p>
              <div className="text-xs text-gray-400">Embassy: {previewCountry.embassy}</div>
              <div className="font-extrabold text-indigo-700 text-lg mt-2">₹{previewCountry.price.toLocaleString()}</div>
            </div>
            <button onClick={() => setSelectedCountry(previewCountry)}
              className="w-full mt-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow">
              Apply for {previewCountry.name} Visa →
            </button>
          </div>
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="font-bold text-gray-800 mb-4">📸 Appointment Booking Screenshots — {previewCountry.name}</div>
            <div className="bg-gray-100 rounded-2xl h-64 flex flex-col items-center justify-center text-center">
              <span className="text-5xl mb-3">{previewCountry.flag}</span>
              <div className="text-gray-400 font-semibold">{previewCountry.name} Schengen Visa Appointment</div>
              <div className="text-sm text-gray-300 mt-1">Sample screenshots will appear here</div>
              <div className="mt-4 text-xs text-gray-400 px-6">This section shows sample screenshots of the {previewCountry.name} Schengen visa appointment booking process for reference.</div>
            </div>
          </div>
        </div>
      )}

      {/* My appointments */}
      {appts && appts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">📋 My Schengen Appointments ({appts.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {appts.map(appt => (
              <div key={appt._id} className="flex items-center gap-4 px-6 py-4">
                <span className="text-2xl">{SCHENGEN_COUNTRIES.find(c => c.name === appt.country)?.flag || '🇪🇺'}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-800">{appt.applicantName}</div>
                  <div className="text-xs text-gray-400">{appt.country} · {appt.visaType}</div>
                </div>
                <div className="font-bold text-indigo-700">₹{appt.price?.toLocaleString()}</div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize bg-blue-100 text-blue-700`}>{appt.status}</span>
                {appt.trackingId && <div className="text-[10px] text-gray-400 font-mono">{appt.trackingId}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCountry && <ApplicationModal country={selectedCountry} onClose={() => setSelectedCountry(null)} />}
    </div>
  )
}

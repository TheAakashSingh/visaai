// src/components/wevisa/WeVisaApplyPage.jsx — Apply for Visa with all countries
import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaServicesAPI } from '@/services/wevisaApi'

const DEFAULT_PACKAGES = [
  { _id: '1', country: 'United Arab Emirates', flag: '🇦🇪', visaType: 'Tourist eVisa', processingTime: '4 Hours', stayDuration: '30 Days', price: 2499, isExpress: true, category: 'evisa', description: 'Fastest Dubai tourist visa with guaranteed 4-hour processing' },
  { _id: '2', country: 'Singapore', flag: '🇸🇬', visaType: 'Tourist eVisa', processingTime: '24 Hours', stayDuration: '30 Days', price: 3999, isExpress: true, category: 'evisa', description: 'Premium Singapore eVisa with 24-hour processing guarantee' },
  { _id: '3', country: 'Vietnam', flag: '🇻🇳', visaType: 'Tourist eVisa', processingTime: '2 Hours', stayDuration: '30 Days', price: 1499, isExpress: true, category: 'evisa', description: 'Ultra-fast Vietnam eVisa - ready in just 2 hours!' },
  { _id: '4', country: 'Bali (Indonesia)', flag: '🇮🇩', visaType: 'Tourist eVisa', processingTime: '24 Hours', stayDuration: '30 Days', price: 2999, isExpress: true, category: 'evisa', description: 'Bali on-arrival visa assistance with 24-hour support' },
  { _id: '5', country: 'Turkey', flag: '🇹🇷', visaType: 'Tourist eVisa', processingTime: '24 Hours', stayDuration: '90 Days', price: 3499, isExpress: true, category: 'evisa', description: 'Turkey e-Visa with 90-day stay permission' },
  { _id: '6', country: 'Canada', flag: '🇨🇦', visaType: 'Tourist Visa', processingTime: '4-6 weeks', stayDuration: '6 months', price: 12000, isExpress: false, category: 'sticker', description: 'Canada visitor visa for tourism and family visits' },
  { _id: '7', country: 'United Kingdom', flag: '🇬🇧', visaType: 'Tourist Visa', processingTime: '3 weeks', stayDuration: '6 months', price: 15000, isExpress: false, category: 'sticker', description: 'UK Standard Visitor Visa - tourism and business' },
  { _id: '8', country: 'Germany', flag: '🇩🇪', visaType: 'Schengen Visa', processingTime: '15 days', stayDuration: '90 days', price: 8000, isExpress: false, category: 'appointment', description: 'Germany Schengen visa - access 26 European countries' },
  { _id: '9', country: 'France', flag: '🇫🇷', visaType: 'Schengen Visa', processingTime: '15 days', stayDuration: '90 days', price: 8500, isExpress: false, category: 'appointment', description: 'France Schengen visa - Paris and beyond' },
  { _id: '10', country: 'Thailand', flag: '🇹🇭', visaType: 'Tourist Visa', processingTime: '3-5 days', stayDuration: '30 Days', price: 2999, isExpress: false, category: 'evisa', description: 'Thailand tourist visa with easy online application' },
  { _id: '11', country: 'Malaysia', flag: '🇲🇾', visaType: 'eVisa', processingTime: '3-5 days', stayDuration: '30 Days', price: 1999, isExpress: false, category: 'evisa', description: 'Malaysia eNTRI or eVisa for Indian passport holders' },
  { _id: '12', country: 'Australia', flag: '🇦🇺', visaType: 'Tourist Visa', processingTime: '4-6 weeks', stayDuration: '3 months', price: 18000, isExpress: false, category: 'sticker', description: 'Australia Visitor visa (subclass 600) for tourism' },
]

function ApplicationModal({ pkg, onClose }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ applicantName: '', applicantEmail: '', applicantPhone: '', passportNumber: '', travelDate: '', notes: '' })

  const mut = useMutation({
    mutationFn: () => wevisaServicesAPI.createApplication({
      country: pkg.country,
      visaType: pkg.visaType,
      packageId: pkg._id,
      packageName: `${pkg.country} - ${pkg.visaType}`,
      processingTime: pkg.processingTime,
      stayDuration: pkg.stayDuration,
      price: pkg.price,
      ...form,
    }),
    onSuccess: () => {
      toast.success(`✅ ${pkg.country} visa application submitted!`)
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{pkg.flag}</span>
              <div>
                <div className="font-extrabold text-lg">{pkg.country}</div>
                <div className="text-blue-200 text-sm">{pkg.visaType} · ₹{pkg.price.toLocaleString()}</div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          <div className="flex gap-2 mt-4">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
          <div className="text-xs text-blue-200 mt-1">{step === 1 ? 'Step 1: Applicant Details' : 'Step 2: Travel Info'}</div>
        </div>

        <div className="p-6 space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Applicant Full Name *</label>
                <input value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="As per passport" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
                  <input value={form.applicantEmail} onChange={e => setForm({ ...form, applicantEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone</label>
                  <input value={form.applicantPhone} onChange={e => setForm({ ...form, applicantPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Passport Number</label>
                <input value={form.passportNumber} onChange={e => setForm({ ...form, passportNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="A1234567" />
              </div>
              <button onClick={() => setStep(2)} disabled={!form.applicantName}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md">
                Continue →
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Travel Date</label>
                <input type="date" value={form.travelDate} onChange={e => setForm({ ...form, travelDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Additional Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 resize-none" placeholder="Any special requirements..." />
              </div>
              {/* Summary */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Processing Time</span><span className="font-semibold text-green-600">{pkg.processingTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Stay Duration</span><span className="font-semibold">{pkg.stayDuration}</span></div>
                <div className="flex justify-between border-t border-blue-200 pt-2"><span className="font-bold text-gray-800">Total Price</span><span className="font-extrabold text-blue-700">₹{pkg.price.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-all">← Back</button>
                <button onClick={() => mut.mutate()} disabled={mut.isPending}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md">
                  {mut.isPending ? 'Submitting...' : '✅ Submit Application'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function WeVisaApplyPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedPkg, setSelectedPkg] = useState(null)

  const { data: packagesData } = useQuery({
    queryKey: ['wevisa-packages'],
    queryFn: () => wevisaServicesAPI.getPackages().then(r => r.data.data || DEFAULT_PACKAGES),
    placeholderData: DEFAULT_PACKAGES,
  })

  const packages = (packagesData || DEFAULT_PACKAGES).filter(p => {
    const matchSearch = p.country.toLowerCase().includes(search.toLowerCase()) || p.visaType.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'express' && p.isExpress) || p.category === filter
    return matchSearch && matchFilter
  })

  const { data: myApps } = useQuery({
    queryKey: ['wevisa-applications'],
    queryFn: () => wevisaServicesAPI.getApplications().then(r => r.data.data || []),
  })

  const STATUS_COLORS = { submitted: 'bg-blue-100 text-blue-700', processing: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-500' }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800">📝 Apply for Visa</h2>
          <p className="text-sm text-gray-400 mt-0.5">Browse & apply for visas across 100+ countries</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white shadow-sm"
            placeholder="Search country or visa type..." />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Visas' },
            { key: 'express', label: '⚡ Express' },
            { key: 'evisa', label: '💻 eVisa' },
            { key: 'sticker', label: '📌 Sticker' },
            { key: 'appointment', label: '📅 Appointment' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.key ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Express Visas highlight */}
      {filter === 'all' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
          <div className="font-bold text-gray-800 mb-1 flex items-center gap-2"><span>⚡</span> Express Visas — Process in Hours</div>
          <p className="text-xs text-gray-500">High-commission express visas. Earn up to ₹500+ per application.</p>
        </div>
      )}

      {/* Packages grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {packages.map((pkg, i) => (
          <motion.div key={pkg._id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all overflow-hidden group">
            <div className={`h-2 ${pkg.isExpress ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{pkg.flag}</span>
                <div className="flex flex-col items-end gap-1">
                  {pkg.isExpress && <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold">⚡ EXPRESS</span>}
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    pkg.category === 'evisa' ? 'bg-green-100 text-green-700' :
                    pkg.category === 'sticker' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>{pkg.category?.toUpperCase()}</span>
                </div>
              </div>
              <div className="font-extrabold text-gray-800 text-sm mb-0.5">{pkg.country}</div>
              <div className="text-xs text-gray-400 mb-3">{pkg.visaType}</div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">⏱ Processing</span>
                  <span className={`font-bold ${pkg.isExpress ? 'text-green-600' : 'text-gray-700'}`}>{pkg.processingTime}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">🗓 Stay</span>
                  <span className="font-semibold text-gray-700">{pkg.stayDuration}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-blue-700 text-lg">₹{pkg.price?.toLocaleString()}</div>
                <button onClick={() => setSelectedPkg(pkg)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow group-hover:shadow-md">
                  Apply →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My Applications */}
      {myApps && myApps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">📊 My Applications ({myApps.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {myApps.map(app => (
              <div key={app._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">{DEFAULT_PACKAGES.find(p => p.country === app.country)?.flag || '🌍'}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-800">{app.applicantName}</div>
                  <div className="text-xs text-gray-400">{app.country} · {app.visaType}</div>
                </div>
                <div className="text-sm font-bold text-blue-700">₹{app.price?.toLocaleString()}</div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-500'}`}>{app.status}</span>
                {app.trackingId && <div className="text-[10px] text-gray-400 font-mono">{app.trackingId}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPkg && <ApplicationModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />}
    </div>
  )
}

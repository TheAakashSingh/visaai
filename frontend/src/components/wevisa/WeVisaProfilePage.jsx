// src/components/wevisa/WeVisaProfilePage.jsx
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaAuthAPI } from '@/services/wevisaApi'
import useWeVisaStore from '@/store/wevisaStore'

const IL = { color: '#1f2937', backgroundColor: '#f9fafb' }
const INPUT = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors'
const LABEL = 'block text-xs font-bold text-gray-600 mb-1.5'

export default function WeVisaProfilePage() {
  const { agent, setAuth, accessToken, refreshToken } = useWeVisaStore()
  const [form, setForm] = useState({
    name:        agent?.name        || '',
    phone:       agent?.phone       || '',
    agencyName:  agent?.agencyName  || '',
    city:        agent?.city        || '',
    state:       agent?.state       || '',
    gstin:       agent?.gstin       || '',
    panNumber:   agent?.panNumber   || '',
    bankDetails: agent?.bankDetails || { accountNumber: '', ifscCode: '', bankName: '', accountHolder: '' },
  })

  const mut = useMutation({
    mutationFn: () => wevisaAuthAPI.updateProfile(form),
    onSuccess: (r) => {
      setAuth(r.data.data, accessToken, refreshToken)
      toast.success('Profile updated! ✅')
    },
  })

  const TIERS = { basic: { label: 'Basic', color: 'text-gray-600 bg-gray-100', icon: '🥉' }, silver: { label: 'Silver', color: 'text-gray-500 bg-gray-100', icon: '🥈' }, gold: { label: 'Gold', color: 'text-yellow-700 bg-yellow-100', icon: '🥇' }, platinum: { label: 'Platinum', color: 'text-purple-700 bg-purple-100', icon: '💎' } }
  const tier = TIERS[agent?.tier] || TIERS.basic

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-7">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
          {agent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AG'}
        </div>
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800">{agent?.name || 'Agent'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{agent?.agencyName}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${tier.color}`}>{tier.icon} {tier.label}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{agent?.email}</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Earnings', value: `₹${((agent?.totalEarnings || 0) / 1000).toFixed(1)}K`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Visas Processed', value: agent?.totalVisasProcessed || 0, icon: '✈️', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Commission Rate', value: `₹${agent?.commissionRate || 500}`, icon: '📊', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Account Status', value: agent?.status || 'Active', icon: '✅', color: 'text-green-700', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl flex-shrink-0`}>{s.icon}</div>
            <div>
              <div className={`text-lg font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">👤 Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className={LABEL}>Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={INPUT} style={IL} placeholder="Your full name" />
            </div>
            <div>
              <label className={LABEL}>Phone Number</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={INPUT} style={IL} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={LABEL}>Agency Name</label>
              <input value={form.agencyName} onChange={e => setForm({...form, agencyName: e.target.value})} className={INPUT} style={IL} placeholder="Your agency name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>City</label>
                <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={INPUT} style={IL} placeholder="Mumbai" />
              </div>
              <div>
                <label className={LABEL}>State</label>
                <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className={INPUT} style={IL} placeholder="Maharashtra" />
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Bank Info */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">🧾 Tax Information</h3>
            <div className="space-y-4">
              <div>
                <label className={LABEL}>GSTIN</label>
                <input value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})} className={INPUT} style={IL} placeholder="22AAAAA0000A1Z5" />
              </div>
              <div>
                <label className={LABEL}>PAN Number</label>
                <input value={form.panNumber} onChange={e => setForm({...form, panNumber: e.target.value})} className={INPUT} style={IL} placeholder="ABCDE1234F" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">🏦 Bank Details</h3>
            <div className="space-y-3">
              <div>
                <label className={LABEL}>Account Holder Name</label>
                <input value={form.bankDetails.accountHolder} onChange={e => setForm({...form, bankDetails: {...form.bankDetails, accountHolder: e.target.value}})} className={INPUT} style={IL} placeholder="Name as per bank" />
              </div>
              <div>
                <label className={LABEL}>Account Number</label>
                <input value={form.bankDetails.accountNumber} onChange={e => setForm({...form, bankDetails: {...form.bankDetails, accountNumber: e.target.value}})} className={INPUT} style={IL} placeholder="Account number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>IFSC Code</label>
                  <input value={form.bankDetails.ifscCode} onChange={e => setForm({...form, bankDetails: {...form.bankDetails, ifscCode: e.target.value}})} className={INPUT} style={IL} placeholder="SBIN0001234" />
                </div>
                <div>
                  <label className={LABEL}>Bank Name</label>
                  <input value={form.bankDetails.bankName} onChange={e => setForm({...form, bankDetails: {...form.bankDetails, bankName: e.target.value}})} className={INPUT} style={IL} placeholder="SBI" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => mut.mutate()} disabled={mut.isPending}
          className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all">
          {mut.isPending ? 'Saving...' : '💾 Save Profile'}
        </button>
        <button onClick={() => setForm({ name: agent?.name || '', phone: agent?.phone || '', agencyName: agent?.agencyName || '', city: agent?.city || '', state: agent?.state || '', gstin: agent?.gstin || '', panNumber: agent?.panNumber || '', bankDetails: agent?.bankDetails || {} })}
          className="px-8 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-all">
          Reset
        </button>
      </div>
    </div>
  )
}

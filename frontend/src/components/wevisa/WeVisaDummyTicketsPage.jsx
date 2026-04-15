// src/components/wevisa/WeVisaDummyTicketsPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaServicesAPI } from '@/services/wevisaApi'

const AIRLINES = ['Air India', 'IndiGo', 'SpiceJet', 'Emirates', 'Lufthansa', 'British Airways', 'Singapore Airlines', 'Qatar Airways', 'Air Arabia', 'Flydubai']
const CITIES = ['Delhi (DEL)', 'Mumbai (BOM)', 'Bangalore (BLR)', 'Chennai (MAA)', 'Kolkata (CCU)', 'Dubai (DXB)', 'Singapore (SIN)', 'London (LHR)', 'New York (JFK)', 'Toronto (YYZ)', 'Sydney (SYD)', 'Frankfurt (FRA)', 'Paris (CDG)', 'Bangkok (BKK)', 'Kuala Lumpur (KUL)']

function GenerateModal({ open, onClose }) {
  const [form, setForm] = useState({
    applicantName: '', passportNumber: '', fromCity: '', toCity: '',
    departureDate: '', returnDate: '', airline: '', class: 'economy',
  })
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => wevisaServicesAPI.generateDummyTicket(form),
    onSuccess: () => { qc.invalidateQueries(['wevisa-dummy-tickets']); toast.success('🎫 Dummy ticket generated!'); onClose() },
  })

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-600 to-pink-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div><div className="font-extrabold text-xl">🎫 Generate Dummy Ticket</div><div className="text-pink-200 text-sm mt-0.5">Valid for visa applications · ₹299</div></div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Passenger Name *</label>
              <input value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 bg-gray-50" placeholder="As per passport" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Passport Number</label>
              <input value={form.passportNumber} onChange={e => setForm({ ...form, passportNumber: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 bg-gray-50" placeholder="A1234567" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">From City *</label>
              <select value={form.fromCity} onChange={e => setForm({ ...form, fromCity: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 bg-gray-50">
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">To City *</label>
              <select value={form.toCity} onChange={e => setForm({ ...form, toCity: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 bg-gray-50">
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Departure Date *</label>
              <input type="date" value={form.departureDate} onChange={e => setForm({ ...form, departureDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Return Date</label>
              <input type="date" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 bg-gray-50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Preferred Airline</label>
              <select value={form.airline} onChange={e => setForm({ ...form, airline: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 bg-gray-50">
                <option value="">Auto-select</option>
                {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Class</label>
              <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-pink-400 bg-gray-50">
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>
          <div className="bg-pink-50 rounded-xl p-3 border border-pink-100 text-xs text-pink-700 font-medium">
            ⚠️ Dummy tickets are for visa application reference only. Not valid for actual travel.
          </div>
          <button onClick={() => mut.mutate()} disabled={!form.applicantName || !form.fromCity || !form.toCity || !form.departureDate || mut.isPending}
            className="w-full py-3 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 disabled:opacity-50 shadow-md">
            {mut.isPending ? 'Generating...' : '🎫 Generate Ticket — ₹299'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function TicketCard({ ticket }) {
  const dep = new Date(ticket.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const isExpired = ticket.status === 'expired' || (ticket.validUntil && new Date(ticket.validUntil) < new Date())

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border ${isExpired ? 'border-gray-200 opacity-60' : 'border-gray-100 hover:border-pink-200 hover:shadow-md'} shadow-sm overflow-hidden transition-all`}>
      {/* Ticket top stripe */}
      <div className={`h-2 ${isExpired ? 'bg-gray-300' : 'bg-gradient-to-r from-pink-500 to-pink-600'}`} />
      <div className="p-5">
        {/* Route */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <div className="font-extrabold text-lg text-gray-800">{ticket.fromCity?.split(' ')[1]?.replace('(', '').replace(')', '') || ticket.fromCity?.slice(-4, -1) || 'DEL'}</div>
            <div className="text-xs text-gray-400 truncate">{ticket.fromCity}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-gray-400 text-sm">✈️</div>
            <div className="h-px w-16 bg-gray-200" />
            <div className="text-[9px] text-gray-400">{ticket.airline}</div>
          </div>
          <div className="flex-1 text-right">
            <div className="font-extrabold text-lg text-gray-800">{ticket.toCity?.split(' ')[1]?.replace('(', '').replace(')', '') || ticket.toCity?.slice(-4, -1) || 'DXB'}</div>
            <div className="text-xs text-gray-400 truncate">{ticket.toCity}</div>
          </div>
        </div>
        {/* Details */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
          <div><div className="text-[9px] text-gray-400 uppercase font-bold">Passenger</div><div className="text-xs font-bold text-gray-800 truncate">{ticket.applicantName}</div></div>
          <div><div className="text-[9px] text-gray-400 uppercase font-bold">Date</div><div className="text-xs font-bold text-gray-800">{dep}</div></div>
          <div><div className="text-[9px] text-gray-400 uppercase font-bold">PNR</div><div className="text-xs font-bold text-pink-600 font-mono">{ticket.pnrNumber}</div></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isExpired ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'}`}>
              {isExpired ? 'Expired' : '✓ Valid'}
            </span>
            <span className="text-xs text-gray-400 font-mono">{ticket.flightNumber}</span>
          </div>
          {!isExpired && (
            <button onClick={() => { toast.success('Ticket details copied!') }}
              className="text-xs px-3 py-1.5 rounded-lg bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-100 font-semibold">
              📋 Copy Details
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function WeVisaDummyTicketsPage() {
  const [showGenerate, setShowGenerate] = useState(false)

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['wevisa-dummy-tickets'],
    queryFn: () => wevisaServicesAPI.getDummyTickets().then(r => r.data.data || []),
  })
  const tickets = ticketsData || []

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800">🎫 Dummy Tickets</h2>
          <p className="text-sm text-gray-400">Generate dummy flight tickets for visa applications · ₹299 per ticket</p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg">
          + Generate Ticket
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-100 p-5 mb-6 flex items-start gap-4">
        <span className="text-3xl">🎫</span>
        <div>
          <div className="font-bold text-gray-800 mb-1">What is a Dummy Ticket?</div>
          <p className="text-sm text-gray-500">A dummy ticket (itinerary) is a temporary flight reservation used for visa applications to show proof of travel. It is NOT a real ticket and cannot be used for actual travel. Valid for 30 days from generation.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Generated', value: tickets.length, icon: '🎫', color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Active', value: tickets.filter(t => t.status !== 'expired').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Expired', value: tickets.filter(t => t.status === 'expired').length, icon: '⏰', color: 'text-gray-500', bg: 'bg-gray-50' },
          { label: 'This Month', value: tickets.filter(t => new Date(t.createdAt) > new Date(Date.now() - 30 * 86400000)).length, icon: '📅', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl flex-shrink-0`}>{s.icon}</div>
            <div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <div className="font-bold text-xl text-gray-400 mb-2">No tickets generated yet</div>
          <p className="text-sm text-gray-300 mb-6">Generate your first dummy ticket for a visa application</p>
          <button onClick={() => setShowGenerate(true)} className="px-6 py-3 rounded-2xl bg-pink-600 text-white font-bold hover:bg-pink-700 shadow-lg">
            + Generate First Ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {tickets.map(ticket => <TicketCard key={ticket._id} ticket={ticket} />)}
        </div>
      )}

      <GenerateModal open={showGenerate} onClose={() => setShowGenerate(false)} />
    </div>
  )
}

// src/components/pages/LeadsPage.jsx — Full featured with Edit, WhatsApp, Email, Phone, Invoice, Service, Destination, Travel Dates
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { leadsAPI, voiceAPI, chatbotAPI } from '@/services/api'
import { MetricCard, StatusBadge, Modal, PageHeader, EmptyState, Spinner } from '@/components/ui'

const VISA_TYPES  = ['student','work','tourist','business','pr','family','other']
const CHANNELS    = ['whatsapp','voice','direct','referral','web']
const STATUSES    = ['new','contacted','processing','documents_submitted','approved','rejected','dormant']
const SOURCES     = ['WhatsApp','Facebook Ads','Google Ads','Referral','Walk-in','Website','Justdial','Instagram','Other']
const SERVICES    = ['Tourist Visa','Student Visa','Work Visa','Business Visa','PR / Immigration','Schengen Visa','USA Visa','Canada Visa','Australia Visa','UK Visa','Dubai eVisa','Singapore eVisa','UAE Work Visa','Dummy Ticket','USA Appointment','Schengen Appointment','Invoice Only']
const COUNTRIES   = ['UAE','Singapore','USA','Canada','UK','Australia','Germany','France','Italy','Spain','Turkey','Thailand','Malaysia','Vietnam','Bali','Saudi Arabia','Qatar','New Zealand','Netherlands','Greece','Portugal','Japan','South Korea','Other']
const PRIORITY_COLORS = { hot:'bg-red-500/20 text-red-400 border-red-500/30', high:'bg-orange-500/20 text-orange-400 border-orange-500/30', medium:'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', low:'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' }

// ── Quick Action Button ────────────────────────────────────────
function ActionBtn({ icon, label, color, onClick, disabled }) {
  return (
    <button title={label} onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${color} disabled:opacity-40`}>
      <span>{icon}</span>
      <span className="hidden xl:inline">{label}</span>
    </button>
  )
}

// ── Lead Form Modal ────────────────────────────────────────────
function LeadFormModal({ open, onClose, editLead, onSubmit, loading }) {
  const initForm = editLead ? {
    name: editLead.name || '',
    phone: editLead.phone || '',
    email: editLead.email || '',
    visaType: editLead.visaType || 'tourist',
    service: editLead.service || '',
    destination: editLead.destination || '',
    channel: editLead.channel || 'whatsapp',
    source: editLead.source || 'WhatsApp',
    status: editLead.status || 'new',
    priority: editLead.priority || 'medium',
    travelDate: editLead.travelDate ? editLead.travelDate.split('T')[0] : '',
    returnDate: editLead.returnDate ? editLead.returnDate.split('T')[0] : '',
    budget: editLead.budget || '',
    numberOfTravellers: editLead.numberOfTravellers || 1,
    notes: editLead.notes || '',
  } : {
    name: '', phone: '', email: '', visaType: 'tourist', service: '', destination: '',
    channel: 'whatsapp', source: 'WhatsApp', status: 'new', priority: 'medium',
    travelDate: '', returnDate: '', budget: '', numberOfTravellers: 1, notes: '',
  }
  const [f, setF] = useState(initForm)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-bg2 rounded-2xl shadow-2xl w-full max-w-2xl z-10 border border-[rgba(255,255,255,0.08)] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.07)] flex-shrink-0">
          <h3 className="font-syne font-bold text-white text-lg">{editLead ? '✏️ Edit Lead' : '+ New Lead'}</h3>
          <button onClick={onClose} className="text-[var(--text3)] hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Basic Info */}
          <div>
            <div className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest mb-3">👤 Contact Info</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Full Name *</label>
                <input className="input w-full" value={f.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Sharma" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Phone *</label>
                <input className="input w-full" value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Email</label>
                <input className="input w-full" type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="rahul@gmail.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Lead Source</label>
                <select className="input w-full" value={f.source} onChange={e => set('source', e.target.value)}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Service & Destination */}
          <div>
            <div className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest mb-3">✈️ Service & Travel</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Select Service *</label>
                <select className="input w-full" value={f.service} onChange={e => set('service', e.target.value)}>
                  <option value="">Select service...</option>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Destination</label>
                <select className="input w-full" value={f.destination} onChange={e => set('destination', e.target.value)}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Visa Type</label>
                <select className="input w-full" value={f.visaType} onChange={e => set('visaType', e.target.value)}>
                  {VISA_TYPES.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">No. of Travellers</label>
                <input className="input w-full" type="number" min="1" value={f.numberOfTravellers} onChange={e => set('numberOfTravellers', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">📅 Travel Date (Go)</label>
                <input className="input w-full" type="date" value={f.travelDate} onChange={e => set('travelDate', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">📅 Return Date</label>
                <input className="input w-full" type="date" value={f.returnDate} onChange={e => set('returnDate', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Budget (₹)</label>
                <input className="input w-full" type="number" value={f.budget} onChange={e => set('budget', e.target.value)} placeholder="50000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Channel</label>
                <select className="input w-full" value={f.channel} onChange={e => set('channel', e.target.value)}>
                  {CHANNELS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div>
            <div className="text-xs font-bold text-[var(--text3)] uppercase tracking-widest mb-3">📊 Status</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Status</label>
                <select className="input w-full" value={f.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Priority</label>
                <select className="input w-full" value={f.priority} onChange={e => set('priority', e.target.value)}>
                  {['low','medium','high','hot'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] mb-1.5">Notes</label>
            <textarea className="input w-full h-20 resize-none" value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional requirements, special notes..." />
          </div>
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-[rgba(255,255,255,0.07)] flex-shrink-0">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => onSubmit(f)} disabled={!f.name || !f.phone || loading} className="btn-primary">
            {loading ? <Spinner size={14} color="#fff" /> : editLead ? '💾 Save Changes' : '+ Create Lead'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Lead Detail Drawer ─────────────────────────────────────────
function LeadDrawer({ lead, onClose, onEdit }) {
  if (!lead) return null
  const waLink = `https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}`
  const mailLink = `mailto:${lead.email}`
  const telLink = `tel:${lead.phone}`

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.28 }}
        className="relative w-full max-w-md bg-bg2 border-l border-[rgba(255,255,255,0.07)] flex flex-col h-full shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[rgba(255,255,255,0.07)]">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--red)] to-orange-400 flex items-center justify-center text-white font-extrabold text-sm shadow-lg">
            {lead.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-syne font-bold text-white text-base truncate">{lead.name}</div>
            <div className="text-xs text-[var(--text3)] font-mono">{lead.phone}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(lead)} className="btn-outline text-xs py-1.5 px-3">✏️ Edit</button>
            <button onClick={onClose} className="btn-ghost text-xl leading-none">×</button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.07)]">
          <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest mb-3">Quick Actions</div>
          <div className="flex gap-2 flex-wrap">
            <a href={waLink} target="_blank" rel="noreferrer">
              <ActionBtn icon="💬" label="WhatsApp" color="border-green-500/30 text-green-400 hover:bg-green-500/10" />
            </a>
            {lead.email && (
              <a href={mailLink}>
                <ActionBtn icon="📧" label="Email" color="border-blue-500/30 text-blue-400 hover:bg-blue-500/10" />
              </a>
            )}
            <a href={telLink}>
              <ActionBtn icon="📞" label="Call" color="border-purple-500/30 text-purple-400 hover:bg-purple-500/10" />
            </a>
            <ActionBtn icon="🧾" label="Invoice" color="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => toast('Invoice generation coming soon!')} />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {[
            { label: 'Service', val: lead.service || '—', icon: '✈️' },
            { label: 'Visa Type', val: lead.visaType || '—', icon: '📋' },
            { label: 'Destination', val: lead.destination || '—', icon: '🌍' },
            { label: 'Status', val: lead.status?.replace(/_/g, ' '), icon: '📊' },
            { label: 'Priority', val: lead.priority, icon: '🔥' },
            { label: 'Travel Date', val: lead.travelDate ? new Date(lead.travelDate).toLocaleDateString('en-IN') : '—', icon: '📅' },
            { label: 'Return Date', val: lead.returnDate ? new Date(lead.returnDate).toLocaleDateString('en-IN') : '—', icon: '📅' },
            { label: 'Budget', val: lead.budget ? `₹${Number(lead.budget).toLocaleString()}` : '—', icon: '💰' },
            { label: 'Travellers', val: lead.numberOfTravellers || 1, icon: '👥' },
            { label: 'Channel', val: lead.channel, icon: '📱' },
            { label: 'Source', val: lead.source || '—', icon: '📣' },
            { label: 'Email', val: lead.email || '—', icon: '📧' },
          ].map(({ label, val, icon }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0">
              <div className="text-xs text-[var(--text3)] flex items-center gap-2"><span>{icon}</span>{label}</div>
              <div className="text-xs font-semibold text-[var(--text2)] capitalize">{val}</div>
            </div>
          ))}
          {lead.notes && (
            <div className="bg-bg3 rounded-xl p-4 border border-[rgba(255,255,255,0.05)]">
              <div className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest mb-2">Notes</div>
              <div className="text-xs text-[var(--text2)] leading-relaxed">{lead.notes}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.07)] text-[10px] text-[var(--text3)]">
          Created: {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {lead.aiScore != null && <span className="ml-3">AI Score: <span className="text-[var(--red2)] font-bold">{lead.aiScore}/100</span></span>}
        </div>
      </motion.div>
    </div>
  )
}

// ── Main LeadsPage ─────────────────────────────────────────────
export default function LeadsPage() {
  const qc = useQueryClient()
  const [search, setSearch]   = useState('')
  const [filters, setFilters] = useState({ status: '', visaType: '', channel: '', priority: '' })
  const [page, setPage]       = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editLead, setEditLead]   = useState(null)
  const [viewLead, setViewLead]   = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, search, filters],
    queryFn: () => leadsAPI.getAll({ page, limit: 15, search, ...filters }).then(r => r.data),
    keepPreviousData: true,
  })

  const { data: stats } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: () => leadsAPI.getStats().then(r => r.data.data),
    refetchInterval: 30000,
  })

  const createMut = useMutation({
    mutationFn: d => leadsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['leads']); qc.invalidateQueries(['lead-stats']); setShowModal(false); toast.success('Lead created! ✅') },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => leadsAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['leads']); setShowModal(false); setEditLead(null); toast.success('Lead updated! ✅') },
  })

  const deleteMut = useMutation({
    mutationFn: id => leadsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['leads']); toast.success('Lead deleted') },
  })

  const scoreMut = useMutation({
    mutationFn: id => leadsAPI.score(id),
    onSuccess: res => { qc.invalidateQueries(['leads']); toast.success(`AI Score: ${res.data.data.score}/100`) },
  })

  const callMut = useMutation({
    mutationFn: ({ leadId, toNumber }) => voiceAPI.makeCall({ leadId, toNumber }),
    onSuccess: () => toast.success('AI Voice Call initiated! 📞'),
  })

  const handleSubmit = f => {
    if (editLead) updateMut.mutate({ id: editLead._id, data: f })
    else createMut.mutate(f)
  }

  const openEdit = lead => { setEditLead(lead); setShowModal(true); setViewLead(null) }
  const openCreate = () => { setEditLead(null); setShowModal(true) }

  const leads = data?.data || []
  const pagination = data?.pagination || {}

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads & Pipeline"
        subtitle="Full lead management — edit, call, WhatsApp, email & invoice."
        action={<button className="btn-primary" onClick={openCreate}>+ New Lead</button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="New Today"    value={stats?.newToday ?? 0}  change="Requires follow-up" icon="🆕"  delay={0.05} />
        <MetricCard label="Hot Leads"    value={stats?.hotLeads ?? 0}  change="High priority"      icon="🔥"  accent="red"   delay={0.1}  />
        <MetricCard label="Total Leads"  value={stats?.total ?? 0}     change="All time"            icon="👥"  accent="blue"  delay={0.15} />
        <MetricCard label="Converted"    value={stats?.byStatus?.find(s => s._id === 'approved')?.count ?? 0} change="Approved" icon="✅" accent="green" delay={0.2} />
      </div>

      {/* Table */}
      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.07)] flex flex-wrap items-center gap-3">
          <input className="input flex-1 min-w-[180px]" placeholder="🔍 Name, phone, destination..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          <select className="input w-34" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="input w-34" value={filters.visaType} onChange={e => setFilters({ ...filters, visaType: e.target.value })}>
            <option value="">All Visa</option>
            {VISA_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="input w-28" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">Priority</option>
            {['low','medium','high','hot'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input w-28" value={filters.channel} onChange={e => setFilters({ ...filters, channel: e.target.value })}>
            <option value="">Channel</option>
            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {['Lead','Service / Visa','Destination','Travel Dates','Status','Priority','AI Score','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3.5"><div className="skeleton h-4 w-20 rounded" /></td>)}</tr>
                ))
              ) : leads.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon="👥" title="No leads found" description="Create your first lead or adjust filters" action={<button className="btn-primary mt-3" onClick={openCreate}>+ New Lead</button>} /></td></tr>
              ) : (
                leads.map((lead, i) => (
                  <motion.tr key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors">
                    {/* Lead */}
                    <td className="px-4 py-3.5">
                      <button onClick={() => setViewLead(lead)} className="flex items-center gap-2.5 group text-left w-full">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--red)] to-orange-400 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow">
                          {lead.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-[var(--red2)] transition-colors">{lead.name}</div>
                          <div className="text-[10px] text-[var(--text3)] font-mono">{lead.phone}</div>
                        </div>
                      </button>
                    </td>
                    {/* Service */}
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-white capitalize">{lead.service || lead.visaType || '—'}</div>
                      {lead.numberOfTravellers > 1 && <div className="text-[10px] text-[var(--text3)]">👥 {lead.numberOfTravellers} travellers</div>}
                    </td>
                    {/* Destination */}
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-[var(--text2)]">{lead.destination || '—'}</div>
                    </td>
                    {/* Travel Dates */}
                    <td className="px-4 py-3.5">
                      <div className="text-[10px] text-[var(--text2)]">
                        {lead.travelDate ? <div>Go: {new Date(lead.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div> : <span className="text-[var(--text3)]">—</span>}
                        {lead.returnDate && <div className="text-[var(--text3)]">Back: {new Date(lead.returnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5"><StatusBadge status={lead.status} /></td>
                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <span className={`status-badge border capitalize ${PRIORITY_COLORS[lead.priority || 'medium']}`}>{lead.priority || 'medium'}</span>
                    </td>
                    {/* AI Score */}
                    <td className="px-4 py-3.5">
                      {lead.aiScore != null ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1 w-10 bg-bg3 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--red)]" style={{ width: `${lead.aiScore}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-[var(--text2)]">{lead.aiScore}</span>
                        </div>
                      ) : (
                        <button onClick={() => scoreMut.mutate(lead._id)} className="text-[10px] text-[var(--text3)] hover:text-[var(--red2)] underline">Score</button>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* WhatsApp */}
                        <a href={`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                          <button className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-green-500 hover:bg-green-500/10 transition-all" title="WhatsApp">💬</button>
                        </a>
                        {/* Email */}
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`}>
                            <button className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-blue-500 hover:bg-blue-500/10 transition-all" title="Send Email">📧</button>
                          </a>
                        ) : (
                          <button className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm opacity-30 cursor-not-allowed" title="No email">📧</button>
                        )}
                        {/* Call */}
                        <button
                          onClick={() => callMut.mutate({ leadId: lead._id, toNumber: lead.phone })}
                          className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-purple-500 hover:bg-purple-500/10 transition-all"
                          title="AI Voice Call" disabled={callMut.isPending}>
                          📞
                        </button>
                        {/* Invoice */}
                        <button
                          onClick={() => toast(`Invoice for ${lead.name} coming soon!`)}
                          className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-yellow-500 hover:bg-yellow-500/10 transition-all"
                          title="Generate Invoice">
                          🧾
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEdit(lead)}
                          className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-blue-500 hover:bg-blue-500/10 transition-all" title="Edit Lead">
                          ✏️
                        </button>
                        {/* Delete */}
                        <button onClick={() => { if (window.confirm('Delete this lead?')) deleteMut.mutate(lead._id) }}
                          className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-red-500 hover:bg-red-500/10 transition-all" title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(255,255,255,0.07)]">
            <span className="text-xs text-[var(--text3)]">Showing {leads.length} of {pagination.total}</span>
            <div className="flex gap-2">
              <button className="btn-outline text-xs py-1.5 px-3" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="text-xs text-[var(--text2)] self-center">Page {page} of {pagination.pages}</span>
              <button className="btn-outline text-xs py-1.5 px-3" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Form Modal */}
      <LeadFormModal open={showModal} onClose={() => { setShowModal(false); setEditLead(null) }} editLead={editLead} onSubmit={handleSubmit} loading={createMut.isPending || updateMut.isPending} />

      {/* Lead Detail Drawer */}
      <AnimatePresence>
        {viewLead && <LeadDrawer lead={viewLead} onClose={() => setViewLead(null)} onEdit={openEdit} />}
      </AnimatePresence>
    </div>
  )
}

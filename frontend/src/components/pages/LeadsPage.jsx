// src/components/pages/LeadsPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { leadsAPI, voiceAPI } from '@/services/api'
import { MetricCard, StatusBadge, Modal, PageHeader, EmptyState, Spinner } from '@/components/ui'

const VISA_TYPES = ['student', 'work', 'tourist', 'business', 'pr', 'family', 'other']
const CHANNELS = ['whatsapp', 'voice', 'direct', 'referral', 'web']
const STATUSES = ['new', 'contacted', 'processing', 'documents_submitted', 'approved', 'rejected', 'dormant']

export default function LeadsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '', visaType: '', channel: '' })
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editLead, setEditLead] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', visaType: 'student', destination: '', channel: 'whatsapp', status: 'new', notes: '' })

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
    mutationFn: (d) => leadsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['leads']); qc.invalidateQueries(['lead-stats']); setShowModal(false); toast.success('Lead created!') },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => leadsAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['leads']); setShowModal(false); setEditLead(null); toast.success('Lead updated!') },
  })

  const deleteMut = useMutation({
    mutationFn: (id) => leadsAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['leads']); toast.success('Lead deleted') },
  })

  const scoreMut = useMutation({
    mutationFn: (id) => leadsAPI.score(id),
    onSuccess: (res) => { qc.invalidateQueries(['leads']); toast.success(`AI Score: ${res.data.data.score}/100 — ${res.data.data.priority}`) },
  })

  const callMut = useMutation({
    mutationFn: ({ leadId, toNumber }) => voiceAPI.makeCall({ leadId, toNumber }),
    onSuccess: () => toast.success('Call initiated by AI Voice Bot! 📞'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editLead) updateMut.mutate({ id: editLead._id, data: form })
    else createMut.mutate(form)
  }

  const openEdit = (lead) => {
    setEditLead(lead)
    setForm({ name: lead.name, phone: lead.phone, email: lead.email || '', visaType: lead.visaType, destination: lead.destination || '', channel: lead.channel, status: lead.status, notes: lead.notes || '' })
    setShowModal(true)
  }

  const openCreate = () => {
    setEditLead(null)
    setForm({ name: '', phone: '', email: '', visaType: 'student', destination: '', channel: 'whatsapp', status: 'new', notes: '' })
    setShowModal(true)
  }

  const leads = data?.data || []
  const pagination = data?.pagination || {}

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads & CRM"
        subtitle="AI-powered lead management with real-time sync."
        action={<button className="btn-primary" onClick={openCreate}>+ New Lead</button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="New Today" value={stats?.newToday ?? 18} change="Requires follow-up" icon="🆕" delay={0.05} />
        <MetricCard label="Hot Leads" value={stats?.hotLeads ?? 12} change="High priority" icon="🔥" accent="red" delay={0.1} />
        <MetricCard label="Total Leads" value={stats?.total ?? 247} change="All time" icon="👥" accent="blue" delay={0.15} />
        <MetricCard label="Converted" value={`${stats?.byStatus?.find(s => s._id === 'approved')?.count ?? 89}`} change="Approved" icon="✅" accent="green" delay={0.2} />
      </div>

      {/* Table Card */}
      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.07)] flex flex-wrap items-center gap-3">
          <input
            className="input flex-1 min-w-[200px]"
            placeholder="🔍 Search leads by name, phone, destination..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
          <select className="input w-36" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select className="input w-36" value={filters.visaType} onChange={(e) => setFilters({ ...filters, visaType: e.target.value })}>
            <option value="">All Visas</option>
            {VISA_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="input w-32" value={filters.channel} onChange={(e) => setFilters({ ...filters, channel: e.target.value })}>
            <option value="">All Channels</option>
            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {['Client', 'Visa Type', 'Destination', 'Status', 'Priority', 'AI Score', 'Channel', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(9).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="skeleton h-4 w-20 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr><td colSpan={9}><EmptyState icon="👥" title="No leads found" description="Try adjusting your filters or create a new lead" /></td></tr>
              ) : (
                leads.map((lead, i) => (
                  <motion.tr
                    key={lead._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--red)] to-orange-400 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                          {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{lead.name}</div>
                          <div className="text-[10px] text-[var(--text3)] font-mono">{lead.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold capitalize">{lead.visaType}</td>
                    <td className="px-4 py-3.5 text-xs text-[var(--text2)]">{lead.destination || '—'}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3.5"><StatusBadge status={lead.priority || 'medium'} /></td>
                    <td className="px-4 py-3.5">
                      {lead.aiScore != null ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1 w-12 bg-bg3 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--red)]" style={{ width: `${lead.aiScore}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-[var(--text2)]">{lead.aiScore}</span>
                        </div>
                      ) : (
                        <button onClick={() => scoreMut.mutate(lead._id)} className="text-[10px] text-[var(--red2)] hover:underline">Score →</button>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-white/5 text-[var(--text2)]">
                        {lead.channel === 'whatsapp' ? '💬' : lead.channel === 'voice' ? '📞' : '🌐'} {lead.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-[var(--text3)] font-mono">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => callMut.mutate({ leadId: lead._id, toNumber: lead.phone })}
                          className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-[var(--red)] hover:bg-[var(--red-dim)] transition-all"
                          title="AI Voice Call"
                          disabled={callMut.isPending}
                        >
                          📞
                        </button>
                        <button
                          onClick={() => openEdit(lead)}
                          className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this lead?')) deleteMut.mutate(lead._id) }}
                          className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-sm hover:border-red-500 hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
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
            <span className="text-xs text-[var(--text3)]">
              Showing {leads.length} of {pagination.total} leads
            </span>
            <div className="flex gap-2">
              <button className="btn-outline text-xs py-1.5 px-3" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="text-xs text-[var(--text2)] self-center">Page {page} of {pagination.pages}</span>
              <button className="btn-outline text-xs py-1.5 px-3" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditLead(null) }} title={editLead ? 'Edit Lead' : 'Create New Lead'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Full Name *</label>
              <input className="input w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Phone *</label>
              <input className="input w-full" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Email</label>
              <input className="input w-full" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="rahul@gmail.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Destination</label>
              <input className="input w-full" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="Canada" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Visa Type</label>
              <select className="input w-full" value={form.visaType} onChange={e => setForm({ ...form, visaType: e.target.value })}>
                {VISA_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Channel</label>
              <select className="input w-full" value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {editLead && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Status</label>
                <select className="input w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Notes</label>
            <textarea className="input w-full h-20 resize-none" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional information..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-outline" onClick={() => { setShowModal(false); setEditLead(null) }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) ? <Spinner size={14} color="#fff" /> : editLead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

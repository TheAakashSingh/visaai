// src/components/pages/DealsPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { leadsAPI } from '@/services/api'
import { MetricCard, StatusBadge, Modal, PageHeader, EmptyState, Spinner } from '@/components/ui'

const DEAL_STAGES = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
const DEAL_STAGES_CONFIG = {
  discovery: { label: '🔍 Discovery', color: '#60a5fa' },
  qualification: { label: '📋 Qualification', color: '#a78bfa' },
  proposal: { label: '📄 Proposal', color: '#f5c842' },
  negotiation: { label: '🤝 Negotiation', color: '#fb923c' },
  closed_won: { label: '✅ Closed Won', color: '#34d399' },
  closed_lost: { label: '❌ Closed Lost', color: '#ef4444' },
}

export default function DealsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editDeal, setEditDeal] = useState(null)
  const [form, setForm] = useState({ title: '', clientName: '', value: '', stage: 'discovery', probability: 50, expectedClose: '', notes: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['deals', search],
    queryFn: () => leadsAPI.getAll({ limit: 100, search }).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (d) => leadsAPI.create({ ...d, type: 'deal' }),
    onSuccess: () => { qc.invalidateQueries(['deals']); setShowModal(false); toast.success('Deal created!') },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => leadsAPI.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['deals']); setShowModal(false); setEditDeal(null); toast.success('Deal updated!') },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editDeal) updateMut.mutate({ id: editDeal._id, data: form })
    else createMut.mutate(form)
  }

  const deals = data?.data?.filter(l => l.type === 'deal') || []
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals Pipeline"
        subtitle="Track and manage your visa application deals from start to finish."
        action={<button className="btn-primary" onClick={() => { setEditDeal(null); setShowModal(true) }}>+ New Deal</button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Deals" value={deals.length} change="All stages" icon="📋" delay={0.05} />
        <MetricCard label="Total Value" value={`₹${(totalValue / 100000).toFixed(1)}L`} change="Pipeline value" icon="💰" accent="gold" delay={0.1} />
        <MetricCard label="Won Value" value={`₹${(wonValue / 100000).toFixed(1)}L`} change="Closed deals" icon="🏆" accent="green" delay={0.15} />
        <MetricCard label="Win Rate" value={`${deals.length ? Math.round((wonValue / totalValue) * 100) : 0}%`} change="Conversion" icon="📈" accent="blue" delay={0.2} />
      </div>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-6 gap-3">
        {DEAL_STAGES.map((stage) => {
          const config = DEAL_STAGES_CONFIG[stage]
          const stageDeals = deals.filter(d => d.stage === stage)
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
          return (
            <div key={stage} className="flex flex-col gap-2">
              <div className="card px-3 py-2.5">
                <div className="text-xs font-bold" style={{ color: config.color }}>{config.label}</div>
                <div className="text-xs text-[var(--text3)] mt-0.5">₹{(stageValue / 1000).toFixed(0)}K · {stageDeals.length} deals</div>
              </div>
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 480 }}>
                {stageDeals.length === 0 ? (
                  <div className="card p-3 text-center text-[10px] text-[var(--text3)]">No deals</div>
                ) : (
                  stageDeals.map((deal, i) => (
                    <motion.div
                      key={deal._id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="card p-3 cursor-pointer hover:border-[rgba(255,255,255,0.15)] transition-all"
                      onClick={() => { setEditDeal(deal); setForm({ title: deal.title, clientName: deal.clientName, value: deal.value, stage: deal.stage, probability: deal.probability, expectedClose: deal.expectedClose, notes: deal.notes }); setShowModal(true) }}
                    >
                      <div className="text-xs font-semibold">{deal.title}</div>
                      <div className="text-[10px] text-[var(--text3)]">{deal.clientName}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-mono text-green-400">₹{((deal.value || 0) / 1000).toFixed(0)}K</span>
                        <span className="text-[9px] text-[var(--text3)]">{deal.probability}%</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditDeal(null) }} title={editDeal ? 'Edit Deal' : 'Create New Deal'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Deal Title *</label>
              <input className="input w-full" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Canada Student Visa - Rahul" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Client Name *</label>
              <input className="input w-full" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} required placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Value (₹) *</label>
              <input className="input w-full" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required placeholder="50000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Stage</label>
              <select className="input w-full" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                {DEAL_STAGES.map(s => <option key={s} value={s}>{DEAL_STAGES_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Probability (%)</label>
              <input className="input w-full" type="number" value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} placeholder="50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Expected Close</label>
              <input className="input w-full" type="date" value={form.expectedClose} onChange={e => setForm({ ...form, expectedClose: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Notes</label>
            <textarea className="input w-full h-20 resize-none" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional information..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-outline" onClick={() => { setShowModal(false); setEditDeal(null) }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) ? <Spinner size={14} color="#fff" /> : editDeal ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

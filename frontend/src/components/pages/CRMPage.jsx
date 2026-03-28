// src/components/pages/CRMPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { crmAPI, leadsAPI } from '@/services/api'
import { MetricCard, PageHeader, Modal, Spinner, StatusBadge, EmptyState, ProgressBar } from '@/components/ui'

const CRM_PROVIDERS = [
  { id: 'zoho', name: 'Zoho CRM', logo: '🔷', desc: 'Indian market leader, full API support', color: '#e8372a' },
  { id: 'salesforce', name: 'Salesforce', logo: '☁️', desc: 'Enterprise CRM, custom objects support', color: '#00a1e0' },
  { id: 'hubspot', name: 'HubSpot', logo: '🟠', desc: 'Marketing + CRM, free tier available', color: '#ff7a59' },
  { id: 'custom', name: 'Custom Webhook', logo: '🔗', desc: 'Any CRM via webhook — custom payload', color: '#34d399' },
]

export default function CRMPage() {
  const qc = useQueryClient()
  const [historyModal, setHistoryModal] = useState(null)
  const [historyData, setHistoryData] = useState(null)

  const { data: crmStats } = useQuery({ queryKey: ['crm-stats'], queryFn: () => crmAPI.getStats().then(r => r.data.data), refetchInterval: 30000 })
  const { data: dormantData } = useQuery({ queryKey: ['crm-dormant'], queryFn: () => crmAPI.getDormantLeads().then(r => r.data.data) })
  const { data: leadsData } = useQuery({ queryKey: ['leads-crm'], queryFn: () => leadsAPI.getAll({ limit: 50 }).then(r => r.data) })

  const leads = leadsData?.data || []
  const dormant = dormantData?.leads || []
  const stats = crmStats || {}

  const syncAllMut = useMutation({
    mutationFn: () => crmAPI.syncAll(),
    onSuccess: (res) => { qc.invalidateQueries(['crm-stats']); qc.invalidateQueries(['leads-crm']); toast.success(`Synced ${res.data.data.synced} leads to CRM! ✅`) },
  })

  const syncOneMut = useMutation({
    mutationFn: (leadId) => crmAPI.syncLead(leadId),
    onSuccess: () => { qc.invalidateQueries(['crm-stats']); toast.success('Lead synced to CRM!') },
  })

  const testMut = useMutation({
    mutationFn: (provider) => crmAPI.testConnection(provider),
    onSuccess: (res) => { toast[res.data.data.success ? 'success' : 'error'](res.data.data.message) },
  })

  const tagMut = useMutation({
    mutationFn: (leadId) => crmAPI.applyTags(leadId),
    onSuccess: (res) => { qc.invalidateQueries(['leads-crm']); toast.success(`Tags applied: ${res.data.data.tags?.join(', ')}`) },
  })

  const loadHistory = async (leadId, leadName) => {
    try {
      const res = await crmAPI.getInteractionHistory(leadId)
      setHistoryData({ ...res.data.data, name: leadName })
      setHistoryModal(leadId)
    } catch { toast.error('Could not load history') }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Integration"
        subtitle="Zoho · Salesforce · HubSpot · Custom Webhook — full intelligent sync with tagging."
        action={
          <div className="flex gap-2">
            <button className="btn-outline text-xs py-2" onClick={() => syncAllMut.mutate()} disabled={syncAllMut.isPending}>
              {syncAllMut.isPending ? <Spinner size={12} /> : '🔄 Sync All Leads'}
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Leads" value={stats.total ?? 247} change="All time" icon="👥" delay={0.05} />
        <MetricCard label="CRM Synced" value={stats.synced ?? 189} change={`${stats.syncRate ?? 77}% sync rate`} icon="✅" accent="green" delay={0.1} />
        <MetricCard label="Pending Sync" value={stats.unsynced ?? 58} change="Need sync" icon="⏳" accent="gold" delay={0.15} />
        <MetricCard label="Dormant Leads" value={stats.dormant ?? dormant.length} change="Need re-engagement" icon="💤" accent="blue" delay={0.2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* CRM Providers */}
        <div className="card">
          <div className="card-header"><div className="card-title">🔗 CRM Providers</div><div className="card-sub">Test and manage connections</div></div>
          <div className="p-5 space-y-3">
            {CRM_PROVIDERS.map((crm) => (
              <motion.div key={crm.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-4 bg-bg3 rounded-xl border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] transition-all">
                <span className="text-2xl">{crm.logo}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{crm.name}</div>
                  <div className="text-[10px] text-[var(--text3)]">{crm.desc}</div>
                </div>
                <button
                  onClick={() => testMut.mutate(crm.id)}
                  disabled={testMut.isPending}
                  className="btn-outline text-xs py-1.5 px-3 flex-shrink-0"
                  style={{ '--hover-border': crm.color }}
                >
                  {testMut.isPending ? <Spinner size={12} /> : 'Test →'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sync Overview */}
        <div className="card">
          <div className="card-header"><div className="card-title">📊 Sync Overview</div></div>
          <div className="p-5 space-y-4">
            <ProgressBar label="Overall Sync Rate" value={stats.syncRate ?? 77} color="var(--green)" />
            <ProgressBar label="Tagged Leads" value={stats.tagged ?? 0} max={stats.total ?? 247} color="var(--gold)" />
            <ProgressBar label="Active Leads" value={(stats.total ?? 247) - (stats.dormant ?? 0)} max={stats.total ?? 247} color="var(--blue)" />
            <ProgressBar label="Converted" value={leads.filter(l => l.status === 'approved').length} max={stats.total ?? 247} color="var(--green)" />

            <div className="p-3 bg-bg3 rounded-xl border border-[rgba(255,255,255,0.07)]">
              <div className="text-xs font-semibold text-[var(--text2)] mb-3">5 CRM Features Active</div>
              {[
                ['✅ Auto Lead Creation', 'New leads instantly in CRM'],
                ['✅ Real-Time Status Sync', 'Status changes push to CRM'],
                ['✅ Intelligent Tagging', 'AI auto-categorizes leads'],
                ['✅ Interaction History', 'Full transcript in CRM'],
                ['✅ Dormant Re-engagement', 'Auto-detect & flag'],
              ].map(([feat, desc]) => (
                <div key={feat} className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-semibold text-green-400 flex-shrink-0">{feat.split(' ')[0]}</span>
                  <div>
                    <div className="text-xs font-medium">{feat.slice(3)}</div>
                    <div className="text-[10px] text-[var(--text3)]">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Sync Table */}
      <div className="card">
        <div className="card-header">
          <div><div className="card-title">👥 Lead Sync Status</div><div className="card-sub">Individual lead CRM sync, tagging & interaction history</div></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {['Lead', 'Status', 'Tags', 'CRM ID', 'Synced', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {leads.slice(0, 15).map((lead, i) => (
                <motion.tr key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--red)] to-orange-400 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                        {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{lead.name}</div>
                        <div className="text-[10px] text-[var(--text3)] font-mono">{lead.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(lead.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--text3)]">{tag}</span>
                      ))}
                      {(!lead.tags || lead.tags.length === 0) && <span className="text-[10px] text-[var(--text3)]">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[10px] font-mono text-[var(--text3)]">{lead.crmId ? lead.crmId.slice(0, 12) + '...' : '—'}</td>
                  <td className="px-4 py-3">
                    {lead.crmSynced ? (
                      <span className="text-[10px] text-green-400">✅ Synced</span>
                    ) : (
                      <span className="text-[10px] text-yellow-400">⏳ Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => syncOneMut.mutate(lead._id)} className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-xs hover:border-green-500 hover:bg-green-500/10 transition-all" title="Sync to CRM">🔄</button>
                      <button onClick={() => tagMut.mutate(lead._id)} className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-xs hover:border-yellow-500 hover:bg-yellow-500/10 transition-all" title="Apply AI Tags">🏷️</button>
                      <button onClick={() => loadHistory(lead._id, lead.name)} className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-xs hover:border-blue-500 hover:bg-blue-500/10 transition-all" title="View Interaction History">📋</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interaction History Modal */}
      <Modal open={!!historyModal} onClose={() => { setHistoryModal(null); setHistoryData(null) }} title={`📋 Interaction History — ${historyData?.name || ''}`} size="lg">
        {historyData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-bg3 rounded-xl text-center border border-[rgba(255,255,255,0.07)]">
                <div className="text-xl font-bold font-syne">{historyData.totalInteractions}</div>
                <div className="text-xs text-[var(--text3)]">Total Conversations</div>
              </div>
              <div className="p-3 bg-bg3 rounded-xl text-center border border-[rgba(255,255,255,0.07)]">
                <div className="text-xl font-bold font-syne">{historyData.history?.reduce((a, c) => a + c.messageCount, 0) || 0}</div>
                <div className="text-xs text-[var(--text3)]">Total Messages</div>
              </div>
              <div className="p-3 bg-bg3 rounded-xl text-center border border-[rgba(255,255,255,0.07)]">
                <div className="text-xl font-bold font-syne capitalize">{historyData.lead?.channel || 'N/A'}</div>
                <div className="text-xs text-[var(--text3)]">Primary Channel</div>
              </div>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {historyData.history?.length === 0 ? (
                <EmptyState icon="💬" title="No conversations yet" description="Interactions will appear here after WhatsApp/voice activity" />
              ) : (
                historyData.history?.map((conv, i) => (
                  <div key={i} className="p-4 bg-bg3 rounded-xl border border-[rgba(255,255,255,0.07)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold capitalize">{conv.channel} Conversation</span>
                      <span className="text-[10px] text-[var(--text3)] font-mono">{new Date(conv.lastActivity).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="text-xs text-[var(--text2)]">{conv.messageCount} messages</div>
                    {conv.messages?.slice(-2).map((msg, j) => (
                      <div key={j} className={`mt-2 text-[11px] p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500/10 text-blue-300' : 'bg-[rgba(232,55,42,0.08)] text-[var(--text2)]'}`}>
                        <span className="font-semibold capitalize">{msg.role}: </span>{msg.content?.substring(0, 120)}{msg.content?.length > 120 ? '...' : ''}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : <div className="flex justify-center py-8"><Spinner size={32} /></div>}
      </Modal>
    </div>
  )
}
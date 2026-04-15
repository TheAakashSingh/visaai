// src/components/pages/VoicePage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { voiceAPI, leadsAPI } from '@/services/api'
import { MetricCard, StatusBadge, PageHeader, Modal, Spinner, EmptyState } from '@/components/ui'

const SCRIPT_TYPES = [
  { value: 'general', label: '📞 General Inquiry', desc: 'Standard visa inquiry call' },
  { value: 'appointment', label: '📅 Appointment Confirm', desc: 'Confirm/reschedule appointment' },
  { value: 'status', label: '📋 Status Update', desc: 'Proactive visa status update' },
  { value: 'survey', label: '⭐ Satisfaction Survey', desc: 'Post-service feedback call' },
  { value: 'reengage', label: '🔄 Re-engage Lead', desc: 'Dormant lead re-engagement' },
]

export default function VoicePage() {
  const qc = useQueryClient()
  const [callModal, setCallModal] = useState(false)
  const [callForm, setCallForm] = useState({ leadId: '', phone: '', scriptType: 'general', appointmentDate: '', appointmentTime: '', statusMessage: '' })
  const [activeTab, setActiveTab] = useState('logs')

  const { data: stats, isLoading: statsLoading } = useQuery({ 
    queryKey: ['voice-stats'], 
    queryFn: () => voiceAPI.getStats().then(r => r.data.data), 
    refetchInterval: 15000 
  })
  const { data: logsData, isLoading } = useQuery({ 
    queryKey: ['call-logs'], 
    queryFn: () => voiceAPI.getLogs({ limit: 30 }).then(r => r.data), 
    refetchInterval: 15000 
  })
  const { data: leadsData } = useQuery({ 
    queryKey: ['leads-for-voice'], 
    queryFn: () => leadsAPI.getAll({ limit: 100 }).then(r => r.data) 
  })

  const calls = logsData?.data || []
  const leads = leadsData?.data || []
  const dormantLeads = leads.filter(l => l.tags?.includes('dormant') || (l.status === 'new' && l.priority === 'low'))

  const callMut = useMutation({
    mutationFn: async (form) => {
      if (form.scriptType === 'appointment') return voiceAPI.confirmAppointment({ leadId: form.leadId, appointmentDate: form.appointmentDate, appointmentTime: form.appointmentTime })
      if (form.scriptType === 'status') return voiceAPI.sendStatusUpdate({ leadId: form.leadId, statusMessage: form.statusMessage })
      if (form.scriptType === 'survey') return voiceAPI.conductSurvey({ leadId: form.leadId })
      if (form.scriptType === 'reengage') return voiceAPI.reengageLead({ leadId: form.leadId })
      return voiceAPI.makeCall({ leadId: form.leadId, toNumber: form.phone })
    },
    onSuccess: () => { qc.invalidateQueries(['call-logs']); qc.invalidateQueries(['voice-stats']); setCallModal(false); toast.success('AI Voice Call initiated! 📞') },
    onError: () => toast.error('Call failed. Check Twilio configuration.'),
  })

  const reengageMut = useMutation({
    mutationFn: (leadId) => voiceAPI.reengageLead({ leadId }),
    onSuccess: () => { qc.invalidateQueries(['call-logs']); toast.success('Re-engagement call started!') },
  })

  const handleLeadSelect = (leadId) => {
    const lead = leads.find(l => l._id === leadId)
    setCallForm(f => ({ ...f, leadId, phone: lead?.phone || '' }))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI Voice Bot" subtitle="Inbound & outbound AI voice calls — appointments, status updates, surveys, re-engagement." action={<button className="btn-primary" onClick={() => setCallModal(true)}>📞 Initiate Call</button>} />

      <div className="grid grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
        ) : (
          <>
            <MetricCard label="Calls Today" value={stats?.todayCalls ?? 0} change={`${stats?.inboundToday ?? 0} inbound`} icon="📞" delay={0.05} />
            <MetricCard label="Avg Duration" value={stats?.avgDuration ?? '0:00'} change="Min:Sec" icon="⏱" accent="green" delay={0.1} />
            <MetricCard label="Outbound" value={stats?.outboundToday ?? 0} change="Follow-ups sent" icon="📤" accent="gold" delay={0.15} />
            <MetricCard label="Dormant Leads" value={dormantLeads.length} change="Need re-engagement" icon="🔄" accent="blue" delay={0.2} />
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">📞 Live Monitor</div><div className="card-sub">Real-time voice activity</div></div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />{stats?.activeCalls ?? 0} Active
            </div>
          </div>
          <div className="p-5 space-y-4">
            {stats ? (
              <>
                {[['Inbound Today', stats.inboundToday ?? 0], ['Outbound Today', stats.outboundToday ?? 0], ['Transferred to Agent', stats.transferred ?? 0], ['CRM Records', stats.totalCalls ?? 0]].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <span className="text-xs text-[var(--text2)]">{k}</span>
                    <span className="text-sm font-bold font-mono">{v}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4 text-[var(--text3)]">Loading stats...</div>
            )}
          </div>
        </div>

        <div className="card col-span-2">
          <div className="flex gap-1 p-3 border-b border-[rgba(255,255,255,0.07)]">
            {[['logs', '📋 Call Logs'], ['dormant', `🔄 Dormant (${dormantLeads.length})`], ['scripts', '🎭 Scripts']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === id ? 'bg-[rgba(232,55,42,0.15)] text-[var(--red2)]' : 'text-[var(--text2)] hover:text-white'}`}>{label}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'logs' && (
              <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-[rgba(255,255,255,0.05)]" style={{ maxHeight: 380, overflowY: 'auto' }}>
                {isLoading ? Array(6).fill(0).map((_, i) => <div key={i} className="flex items-center gap-3 px-5 py-3.5"><div className="skeleton h-4 w-full rounded" /></div>)
                  : calls.length === 0 ? <EmptyState icon="📞" title="No calls yet" description="Initiate your first AI voice call" />
                  : calls.map((call, i) => (
                    <motion.div key={call._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02]">
                      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: call.status === 'in-progress' ? '#34d399' : call.type === 'inbound' ? '#60a5fa' : '#f5c842' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{call.lead?.name || call.fromNumber || call.toNumber} — <span className="capitalize">{call.type}</span></div>
                        <div className="text-[10px] text-[var(--text3)]">{call.notes || (call.duration ? `${Math.floor(call.duration / 60)}:${String(call.duration % 60).padStart(2, '0')} min` : call.status)}</div>
                      </div>
                      <StatusBadge status={call.status} className="text-[10px] py-0 flex-shrink-0" />
                    </motion.div>
                  ))}
              </motion.div>
            )}
            {activeTab === 'dormant' && (
              <motion.div key="dormant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxHeight: 380, overflowY: 'auto' }}>
                {dormantLeads.length === 0 ? <EmptyState icon="🎉" title="No dormant leads!" description="All leads are actively engaged." />
                  : dormantLeads.map((lead, i) => (
                    <motion.div key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] border-b border-[rgba(255,255,255,0.05)]">
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{lead.name}</div>
                        <div className="text-[10px] text-[var(--text3)]">{lead.visaType} • {lead.destination || 'N/A'} • {lead.phone}</div>
                      </div>
                      <button onClick={() => reengageMut.mutate(lead._id)} disabled={reengageMut.isPending} className="btn-primary text-[10px] py-1.5 px-3 flex-shrink-0">
                        {reengageMut.isPending ? <Spinner size={12} color="#fff" /> : '🔄 Re-engage'}
                      </button>
                    </motion.div>
                  ))}
              </motion.div>
            )}
            {activeTab === 'scripts' && (
              <motion.div key="scripts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-3">
                {SCRIPT_TYPES.map(s => (
                  <div key={s.value} className="flex items-center gap-3 p-3 bg-bg3 rounded-xl border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] transition-colors">
                    <div className="flex-1"><div className="text-sm font-semibold">{s.label}</div><div className="text-xs text-[var(--text3)]">{s.desc}</div></div>
                    <button onClick={() => { setCallForm(f => ({ ...f, scriptType: s.value })); setCallModal(true) }} className="btn-outline text-xs py-1.5 px-3">Use →</button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal open={callModal} onClose={() => setCallModal(false)} title="📞 Initiate AI Voice Call" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Select Lead</label>
            <select className="input w-full" value={callForm.leadId} onChange={e => handleLeadSelect(e.target.value)}>
              <option value="">-- Select a lead --</option>
              {leads.map(l => <option key={l._id} value={l._id}>{l.name} — {l.phone}</option>)}
            </select>
          </div>
          {!callForm.leadId && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Or Enter Phone</label>
              <input className="input w-full font-mono" placeholder="+91 98765 43210" value={callForm.phone} onChange={e => setCallForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Call Script</label>
            <div className="grid grid-cols-1 gap-2">
              {SCRIPT_TYPES.map(s => (
                <label key={s.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${callForm.scriptType === s.value ? 'border-[var(--red)] bg-[rgba(232,55,42,0.08)]' : 'border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)]'}`}>
                  <input type="radio" name="scriptType" value={s.value} checked={callForm.scriptType === s.value} onChange={e => setCallForm(f => ({ ...f, scriptType: e.target.value }))} className="accent-[var(--red)]" />
                  <div><div className="text-sm font-semibold">{s.label}</div><div className="text-[10px] text-[var(--text3)]">{s.desc}</div></div>
                </label>
              ))}
            </div>
          </div>
          {callForm.scriptType === 'appointment' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Date</label><input type="date" className="input w-full" value={callForm.appointmentDate} onChange={e => setCallForm(f => ({ ...f, appointmentDate: e.target.value }))} /></div>
              <div><label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Time</label><input type="time" className="input w-full" value={callForm.appointmentTime} onChange={e => setCallForm(f => ({ ...f, appointmentTime: e.target.value }))} /></div>
            </div>
          )}
          {callForm.scriptType === 'status' && (
            <div><label className="block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5">Status Message</label><textarea className="input w-full h-20 resize-none" placeholder="Your visa application has been approved!..." value={callForm.statusMessage} onChange={e => setCallForm(f => ({ ...f, statusMessage: e.target.value }))} /></div>
          )}
          <div className="flex gap-3 pt-2">
            <button className="btn-outline flex-1" onClick={() => setCallModal(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={() => callMut.mutate(callForm)} disabled={callMut.isPending || (!callForm.leadId && !callForm.phone)}>
              {callMut.isPending ? <Spinner size={14} color="#fff" /> : '📞 Initiate AI Call'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
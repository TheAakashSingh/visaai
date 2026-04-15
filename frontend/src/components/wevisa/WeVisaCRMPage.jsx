// src/components/wevisa/WeVisaCRMPage.jsx — Full CRM with all tabs
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaCRMAPI } from '@/services/wevisaApi'

// ─── helpers ─────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'
const PRIORITY_COLORS = { hot: 'bg-red-100 text-red-700 border-red-200', high: 'bg-orange-100 text-orange-700 border-orange-200', medium: 'bg-yellow-100 text-yellow-700 border-yellow-200', low: 'bg-gray-100 text-gray-500 border-gray-200' }
const STATUS_COLORS = { new: 'bg-blue-100 text-blue-700', contacted: 'bg-purple-100 text-purple-700', documents: 'bg-yellow-100 text-yellow-700', payment: 'bg-orange-100 text-orange-700', applied: 'bg-indigo-100 text-indigo-700', completed: 'bg-green-100 text-green-700' }
const PIPELINE = [
  { key: 'new', label: 'New Leads', color: '#3b82f6', dot: 'bg-blue-500' },
  { key: 'contacted', label: 'Contacted', color: '#8b5cf6', dot: 'bg-purple-500' },
  { key: 'documents', label: 'Documents', color: '#f59e0b', dot: 'bg-yellow-500' },
  { key: 'payment', label: 'Payment', color: '#f97316', dot: 'bg-orange-500' },
  { key: 'applied', label: 'Applied', color: '#6366f1', dot: 'bg-indigo-500' },
  { key: 'completed', label: 'Completed', color: '#10b981', dot: 'bg-green-500' },
]
const INTEGRATIONS = [
  { id: 'gmail', icon: '📧', iconColor: 'text-red-500', bgColor: 'bg-red-50', title: 'Gmail Integration', desc: 'Connect Gmail to send and receive emails directly from your CRM', sub: 'Manage all your email communications in one place', btn: 'Connect', btnColor: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'facebook', icon: '📘', iconColor: 'text-blue-600', bgColor: 'bg-blue-50', title: 'Facebook Lead Ads Integration', desc: 'Connect Facebook to automatically import leads', sub: 'Never synced', btn: 'Connect', btnColor: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'whatsapp', icon: '💬', iconColor: 'text-green-600', bgColor: 'bg-green-50', title: 'WhatsApp Integration', desc: 'Connect WhatsApp to send messages directly to your leads', sub: 'Configure your WhatsApp Business API to enable lead communication', btn: 'Configure', btnColor: 'bg-gray-600 hover:bg-gray-700' },
]
const APRIL_WEEKS = [[null,null,null,1,2,3,4],[5,6,7,8,9,10,11],[12,13,14,15,16,17,18],[19,20,21,22,23,24,25],[26,27,28,29,30,null,null]]
const TABS = ['Dashboard', 'Leads', 'Contacts', 'Deals', 'Calendar', 'Tasks', 'Travel agents', 'Integrations']

// ─── Add Lead Modal ───────────────────────────────────────────
function AddLeadModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', visaInterest: '', destination: '', priority: 'medium', source: 'other' })
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: wevisaCRMAPI.createLead,
    onSuccess: (r) => { qc.invalidateQueries(['wevisa-crm-leads']); qc.invalidateQueries(['wevisa-crm-stats']); toast.success('Lead added! 🎉'); onClose() },
  })
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">Add New Lead</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="priya@email.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Visa Interest</label>
              <input value={form.visaInterest} onChange={e => setForm({ ...form, visaInterest: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="Tourist, Student..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Destination</label>
              <input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="Canada, UK..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50">
                {['low', 'medium', 'high', 'hot'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Source</label>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50">
                {['website', 'referral', 'social', 'walk_in', 'other'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => mut.mutate(form)} disabled={!form.name || mut.isPending}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md">
            {mut.isPending ? 'Adding...' : '+ Add Lead'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Add Task Modal ───────────────────────────────────────────
function AddTaskModal({ open, onClose }) {
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'medium' })
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: wevisaCRMAPI.createTask,
    onSuccess: () => { qc.invalidateQueries(['wevisa-crm-tasks']); toast.success('Task created!'); onClose() },
  })
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Add Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
          <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50">
            <option value="low">Low Priority</option><option value="medium">Medium Priority</option><option value="high">High Priority</option>
          </select>
          <button onClick={() => mut.mutate(form)} disabled={!form.title || mut.isPending} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
            {mut.isPending ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── MAIN CRM PAGE ────────────────────────────────────────────
export default function WeVisaCRMPage() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [showAddLead, setShowAddLead] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [leadSearch, setLeadSearch] = useState('')
  const qc = useQueryClient()

  const { data: leadsData } = useQuery({ queryKey: ['wevisa-crm-leads'], queryFn: () => wevisaCRMAPI.getLeads().then(r => r.data.data || []), refetchInterval: 30000 })
  const { data: statsData } = useQuery({ queryKey: ['wevisa-crm-stats'], queryFn: () => wevisaCRMAPI.getStats().then(r => r.data.data || {}), refetchInterval: 30000 })
  const { data: tasksData } = useQuery({ queryKey: ['wevisa-crm-tasks'], queryFn: () => wevisaCRMAPI.getTasks().then(r => r.data.data || []) })

  const leads = leadsData || []
  const stats = statsData || {}
  const tasks = tasksData || []

  const updateLeadMut = useMutation({
    mutationFn: ({ id, data }) => wevisaCRMAPI.updateLead(id, data),
    onSuccess: () => qc.invalidateQueries(['wevisa-crm-leads']),
  })
  const deleteLeadMut = useMutation({
    mutationFn: wevisaCRMAPI.deleteLead,
    onSuccess: () => { qc.invalidateQueries(['wevisa-crm-leads']); toast.success('Lead deleted') },
  })
  const toggleTaskMut = useMutation({
    mutationFn: ({ id, status }) => wevisaCRMAPI.updateTask(id, { status }),
    onSuccess: () => qc.invalidateQueries(['wevisa-crm-tasks']),
  })

  const filteredLeads = leads.filter(l =>
    l.name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.email?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.phone?.includes(leadSearch)
  )

  const METRICS = [
    { label: 'Total Leads', value: stats.total ?? leads.length, change: '5%', icon: '👥', up: true },
    { label: 'New Leads', value: stats.newLeads ?? leads.filter(l => l.status === 'new').length, change: '12%', icon: '✨', up: true },
    { label: 'Open Deals', value: leads.filter(l => !['completed'].includes(l.status)).length, change: '3%', icon: '💼', up: true },
    { label: 'Deal Value', value: '₹' + (leads.reduce((s, l) => s + (l.budget || 0), 0) / 1000).toFixed(0) + 'K', change: '8%', icon: '💰', up: true },
    { label: 'Meetings', value: tasks.filter(t => t.title?.toLowerCase().includes('meeting')).length, change: '2%', icon: '📅', up: true },
    { label: 'Tasks Completed', value: tasks.filter(t => t.status === 'completed').length, change: '15%', icon: '✅', up: true },
  ]

  const recentActivities = [
    { icon: '💬', bg: 'bg-blue-50', text: 'Sent message to Priya Sharma', time: '2 hours ago' },
    { icon: '📄', bg: 'bg-yellow-50', text: 'Received documents from Rahul Mehra', time: 'Yesterday' },
    { icon: '📅', bg: 'bg-green-50', text: 'Meeting scheduled with Vijay Kumar', time: 'Yesterday' },
    { icon: '✅', bg: 'bg-purple-50', text: 'Visa approved for Simran Kaur', time: '2 days ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-extrabold text-xl text-gray-800">CRM Dashboard</h2>
            <p className="text-xs text-gray-400">Manage your leads, deals, and customer relationships</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-700 transition-all">
              <span>💬</span> WhatsApp Settings
            </button>
            <button onClick={() => setShowAddLead(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-md">
              + Add New Lead
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-0.5 mt-3 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              {tab === 'Dashboard' && '⊞ '}
              {tab === 'Leads' && '👥 '}
              {tab === 'Contacts' && '👤 '}
              {tab === 'Deals' && '💼 '}
              {tab === 'Calendar' && '📅 '}
              {tab === 'Tasks' && '✅ '}
              {tab === 'Travel agents' && '🏢 '}
              {tab === 'Integrations' && '🔗 '}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DASHBOARD TAB ─── */}
      {activeTab === 'Dashboard' && (
        <div className="p-6">
          {/* Integrations */}
          <div className="space-y-3 mb-6">
            {INTEGRATIONS.map(int => (
              <div key={int.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${int.bgColor} flex items-center justify-center text-xl flex-shrink-0`}>{int.icon}</div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{int.title}</div>
                    <div className="text-xs text-gray-500">{int.desc}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{int.sub}</div>
                  </div>
                </div>
                <button className={`px-5 py-2 rounded-xl text-white text-sm font-semibold ${int.btnColor} transition-all flex items-center gap-1.5 shadow`}>
                  🔗 {int.btn}
                </button>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {METRICS.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-xs font-bold text-green-500">{m.change} ↑</span>
                </div>
                <div className="text-2xl font-extrabold text-gray-800">{m.value}</div>
                <div className="text-[10px] text-gray-400 font-medium mt-1">{m.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Pipeline + Calendar/Tasks */}
          <div className="grid grid-cols-3 gap-5">
            {/* Pipeline */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔄</span> Lead Pipeline
              </div>
              <div className="grid grid-cols-6 gap-2">
                {PIPELINE.map(stage => {
                  const stageLeads = leads.filter(l => l.status === stage.key)
                  return (
                    <div key={stage.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                        <span className={`w-6 h-6 rounded-full border-2 text-xs font-bold flex items-center justify-center`} style={{ borderColor: stage.color, color: stage.color }}>{stageLeads.length}</span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-600 mb-2">{stage.label}</div>
                      {stageLeads.length === 0
                        ? <div className="text-[9px] text-gray-300 text-center py-2">No leads in this stage</div>
                        : stageLeads.slice(0, 2).map(l => (
                          <div key={l._id} className="text-[9px] bg-white rounded-lg p-1.5 border border-gray-100 mb-1 truncate font-medium text-gray-700">{l.name}</div>
                        ))
                      }
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <button className="text-gray-400 hover:text-gray-600 text-sm">◀</button>
                  <span className="text-sm font-bold text-gray-700">April 2026</span>
                  <button className="text-gray-400 hover:text-gray-600 text-sm">▶</button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-[10px] text-center text-gray-400 mb-1 font-semibold">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                </div>
                {APRIL_WEEKS.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
                    {week.map((day, di) => (
                      <div key={di} className={`h-7 w-7 flex items-center justify-center rounded-full mx-auto text-[10px] cursor-pointer transition-all ${day === 16 ? 'bg-blue-600 text-white font-bold shadow' : day ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-200'}`}>
                        {day || ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-gray-800">📋 Upcoming Tasks</span>
                  <button onClick={() => setActiveTab('Tasks')} className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="space-y-2.5">
                  {tasks.slice(0, 4).length > 0 ? tasks.slice(0, 4).map(task => (
                    <div key={task._id} className="flex items-start gap-2.5">
                      <input type="checkbox" checked={task.status === 'completed'} onChange={() => toggleTaskMut.mutate({ id: task._id, status: task.status === 'completed' ? 'pending' : 'completed' })} className="mt-0.5 accent-blue-600 cursor-pointer" />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium text-gray-700 truncate ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{task.title}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          📅 {fmtDate(task.dueDate)} ·{' '}
                          <span className={`font-semibold ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    // Demo tasks when empty
                    [
                      { text: 'Follow up with Priya about visa requirements', date: 'Apr 16', priority: 'High Priority', color: 'text-red-500' },
                      { text: 'Send insurance quote to Rahul', date: 'Apr 16', priority: 'Medium Priority', color: 'text-yellow-500' },
                      { text: "Review Aakash's application", date: 'Apr 16', priority: 'Low Priority', color: 'text-green-500' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <input type="checkbox" className="mt-0.5 accent-blue-600" />
                        <div>
                          <div className="text-xs font-medium text-gray-700">{t.text}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">📅 {t.date} · <span className={`font-semibold ${t.color}`}>{t.priority}</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button onClick={() => setShowAddTask(true)} className="w-full mt-3 py-2 rounded-xl border border-dashed border-blue-300 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-all">+ Add Task</button>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="font-bold text-sm text-gray-800 mb-3">⚡ Recent Activities</div>
                <div className="space-y-2.5">
                  {recentActivities.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center text-sm flex-shrink-0`}>{a.icon}</div>
                      <div>
                        <div className="text-xs font-medium text-gray-700">{a.text}</div>
                        <div className="text-[10px] text-gray-400">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── LEADS TAB ─── */}
      {activeTab === 'Leads' && (
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <input value={leadSearch} onChange={e => setLeadSearch(e.target.value)}
                  className="w-72 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
                  placeholder="🔍 Search by name, email, phone..." />
                <select className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50">
                  <option value="">All Status</option>
                  {PIPELINE.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
              <button onClick={() => setShowAddLead(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow">
                + Add Lead
              </button>
            </div>
            {filteredLeads.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">👥</div>
                <div className="font-semibold text-gray-500">No leads yet</div>
                <div className="text-sm text-gray-400 mt-1">Add your first lead to get started</div>
                <button onClick={() => setShowAddLead(true)} className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">+ Add Lead</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Lead', 'Contact', 'Visa Interest', 'Destination', 'Status', 'Priority', 'Added', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLeads.map((lead, i) => (
                      <motion.tr key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow">
                              {lead.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-800">{lead.name}</div>
                              <div className="text-[10px] text-gray-400">{lead.source}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs text-gray-600">{lead.phone || '—'}</div>
                          <div className="text-[10px] text-gray-400">{lead.email || '—'}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">{lead.visaInterest || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600">{lead.destination || '—'}</td>
                        <td className="px-5 py-3.5">
                          <select value={lead.status} onChange={e => updateLeadMut.mutate({ id: lead._id, data: { status: e.target.value } })}
                            className={`text-xs px-2.5 py-1.5 rounded-full font-semibold border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                            {PIPELINE.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border capitalize ${PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.medium}`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDate(lead.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => deleteLeadMut.mutate(lead._id)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] px-2.5 py-1 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all font-semibold">
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TASKS TAB ─── */}
      {activeTab === 'Tasks' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">📋 Tasks</h3>
              <p className="text-sm text-gray-400">Manage your follow-ups and to-dos</p>
            </div>
            <button onClick={() => setShowAddTask(true)} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow">+ New Task</button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Pending ({tasks.filter(t => t.status === 'pending').length})</div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === 'pending').map(task => (
                  <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                    <input type="checkbox" onChange={() => toggleTaskMut.mutate({ id: task._id, status: 'completed' })} className="accent-blue-600 cursor-pointer" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{task.title}</div>
                      <div className="text-[10px] text-gray-400">Due: {fmtDate(task.dueDate)} · <span className={`font-semibold ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}</span></div>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === 'pending').length === 0 && <div className="text-center py-8 text-gray-300 text-sm">No pending tasks 🎉</div>}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Completed ({tasks.filter(t => t.status === 'completed').length})</div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === 'completed').map(task => (
                  <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                    <input type="checkbox" defaultChecked onChange={() => toggleTaskMut.mutate({ id: task._id, status: 'pending' })} className="accent-green-600 cursor-pointer" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-500 line-through truncate">{task.title}</div>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === 'completed').length === 0 && <div className="text-center py-8 text-gray-300 text-sm">No completed tasks yet</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TRAVEL AGENTS TAB ─── */}
      {activeTab === 'Travel agents' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-extrabold text-xl text-gray-800">Travel Agents Management</h3>
              <p className="text-sm text-gray-400">Manage your travel agents and their leads</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow">+ Add Travel agent</button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <input className="w-80 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" placeholder="🔍 Search agents by name, phone or company..." />
            </div>
            <div className="text-center py-24">
              <div className="text-5xl mb-3 opacity-30">🏢</div>
              <div className="text-lg font-semibold text-gray-400">No agents found</div>
              <div className="text-sm text-gray-300 mt-1">No travel agents have been added yet.</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── INTEGRATIONS TAB ─── */}
      {activeTab === 'Integrations' && (
        <div className="p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-5">🔗 Integrations</h3>
          <div className="grid grid-cols-2 gap-4">
            {INTEGRATIONS.map(int => (
              <div key={int.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl ${int.bgColor} flex items-center justify-center text-2xl mb-4`}>{int.icon}</div>
                <h4 className="font-bold text-gray-800 mb-1">{int.title}</h4>
                <p className="text-sm text-gray-500 mb-1">{int.desc}</p>
                <p className="text-xs text-gray-400 mb-4">{int.sub}</p>
                <button className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold ${int.btnColor} transition-all shadow flex items-center gap-1.5`}>
                  🔗 {int.btn}
                </button>
              </div>
            ))}
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-blue-300 transition-all cursor-pointer">
              <div className="text-3xl mb-2 text-gray-300">+</div>
              <div className="font-semibold text-gray-400">Add Integration</div>
              <div className="text-xs text-gray-300 mt-1">Connect more tools to your CRM</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── OTHER TABS ─── */}
      {['Contacts', 'Deals', 'Calendar'].includes(activeTab) && (
        <div className="p-8 flex flex-col items-center justify-center min-h-64">
          <div className="text-6xl mb-4">🚧</div>
          <div className="text-xl font-bold text-gray-400">{activeTab} — Coming Soon</div>
          <div className="text-sm text-gray-300 mt-2">This section is being built. Stay tuned!</div>
        </div>
      )}

      {/* Modals */}
      <AddLeadModal open={showAddLead} onClose={() => setShowAddLead(false)} />
      <AddTaskModal open={showAddTask} onClose={() => setShowAddTask(false)} />
    </div>
  )
}

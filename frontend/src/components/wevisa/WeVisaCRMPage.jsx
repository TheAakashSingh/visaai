// src/components/wevisa/WeVisaCRMPage.jsx - Enhanced with edit, action icons, and additional fields
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaCRMAPI, wevisaInvoiceAPI } from '@/services/wevisaApi'
import { Link } from 'react-router-dom'

const ii = { color: '#111827', backgroundColor: '#f9fafb', caretColor: '#111827' }
const inp = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors'
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5'

const SERVICE_OPTIONS = ['Tourist Visa', 'Student Visa', 'Business Visa', 'Work Visa', 'Transit Visa', 'Medical Visa', 'Conference Visa', 'Other']
const LEAD_SOURCES = ['Website', 'Referral', 'Social Media', 'Walk-in', 'Phone Call', 'Email Campaign', 'Facebook Ads', 'Google Ads', 'JustDial', 'Other']
const DESTINATIONS = ['Dubai', 'Singapore', 'USA', 'UK', 'Canada', 'Australia', 'Thailand', 'Malaysia', 'Vietnam', 'Bali', 'Turkey', 'Schengen', 'Japan', 'New Zealand', 'Other']

const PIPELINE = [
  { key:'new',       label:'New Leads',  color:'#3b82f6' },
  { key:'contacted', label:'Contacted',  color:'#8b5cf6' },
  { key:'documents', label:'Documents',  color:'#f59e0b' },
  { key:'payment',   label:'Payment',    color:'#f97316' },
  { key:'applied',   label:'Applied',    color:'#6366f1' },
  { key:'completed', label:'Completed',  color:'#10b981' },
]
const SCLR = { new:'bg-blue-100 text-blue-700',contacted:'bg-purple-100 text-purple-700',documents:'bg-yellow-100 text-yellow-700',payment:'bg-orange-100 text-orange-700',applied:'bg-indigo-100 text-indigo-700',completed:'bg-green-100 text-green-700' }
const PCLR = { hot:'bg-red-100 text-red-700 border-red-200',high:'bg-orange-100 text-orange-700 border-orange-200',medium:'bg-yellow-100 text-yellow-700 border-yellow-200',low:'bg-gray-100 text-gray-500 border-gray-200' }
const INTS = [
  { id:'gmail',    icon:'📧', bg:'bg-red-50',   title:'Gmail Integration',            desc:'Connect Gmail to send and receive emails directly from your CRM',  sub:'Manage all your email communications in one place',                   btn:'Connect',   bc:'bg-purple-600 hover:bg-purple-700' },
  { id:'facebook', icon:'📘', bg:'bg-blue-50',  title:'Facebook Lead Ads Integration',desc:'Connect Facebook to automatically import leads',                   sub:'Never synced',                                                        btn:'Connect',   bc:'bg-purple-600 hover:bg-purple-700' },
  { id:'whatsapp', icon:'💬', bg:'bg-green-50', title:'WhatsApp Integration',         desc:'Connect WhatsApp to send messages directly to your leads',         sub:'Configure your WhatsApp Business API to enable lead communication',   btn:'Configure', bc:'bg-gray-600 hover:bg-gray-700' },
]
const APR = [[null,null,null,1,2,3,4],[5,6,7,8,9,10,11],[12,13,14,15,16,17,18],[19,20,21,22,23,24,25],[26,27,28,29,30,null,null]]
const DEMO_TASKS = [
  {t:'Follow up with Priya about visa requirements', d:'Apr 16', p:'High Priority',   c:'text-red-500'},
  {t:'Send insurance quote to Rahul',               d:'Apr 16', p:'Medium Priority', c:'text-yellow-500'},
  {t:"Review Aakash's application",                 d:'Apr 16', p:'Low Priority',    c:'text-green-500'},
]
const ACTS = [
  {icon:'💬',bg:'bg-blue-50',   t:'Sent message to Priya Sharma',       d:'2 hours ago'},
  {icon:'📄',bg:'bg-yellow-50', t:'Received documents from Rahul Mehra', d:'Yesterday'},
  {icon:'📅',bg:'bg-green-50',  t:'Meeting scheduled with Vijay Kumar',  d:'Yesterday'},
  {icon:'✅',bg:'bg-purple-50', t:'Visa approved for Simran Kaur',       d:'2 days ago'},
]
const TABS = ['Dashboard','Leads','Contacts','Deals','Calendar','Tasks','Travel agents','Integrations']
const fmt  = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—'

function LeadModal({ open, onClose, editLead = null }) {
  const isEdit = !!editLead
  const [f,setF] = useState(editLead || {name:'',email:'',phone:'',visaInterest:'',destination:'',priority:'medium',source:'other',travelDateGo:'',travelDateReturn:''})
  const qc = useQueryClient()
  const m = useMutation({
    mutationFn:()=>isEdit ? wevisaCRMAPI.updateLead(editLead._id, f) : wevisaCRMAPI.createLead(f),
    onSuccess:()=>{qc.invalidateQueries(['wv-leads']);qc.invalidateQueries(['wv-stats']);toast.success(isEdit?'Lead updated!':'Lead added!');onClose()},
  })
  if(!open) return null
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">{isEdit?'✏️ Edit Lead':'➕ Add New Lead'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Full Name *</label><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} className={inp} style={ii} placeholder="Priya Sharma"/></div>
            <div><label className={lbl}>Phone</label><input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} className={inp} style={ii} placeholder="+91 98765 43210"/></div>
          </div>
          <div><label className={lbl}>Email</label><input value={f.email} onChange={e=>setF({...f,email:e.target.value})} className={inp} style={ii} placeholder="priya@email.com"/></div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Service Type</label>
              <select value={f.visaInterest} onChange={e=>setF({...f,visaInterest:e.target.value})} className={inp} style={ii}>
                <option value="">Select service...</option>
                {SERVICE_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Destination</label>
              <select value={f.destination} onChange={e=>setF({...f,destination:e.target.value})} className={inp} style={ii}>
                <option value="">Select destination...</option>
                {DESTINATIONS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Travel Date (Go)</label>
              <input type="date" value={f.travelDateGo||''} onChange={e=>setF({...f,travelDateGo:e.target.value})} className={inp} style={ii}/>
            </div>
            <div>
              <label className={lbl}>Travel Date (Return)</label>
              <input type="date" value={f.travelDateReturn||''} onChange={e=>setF({...f,travelDateReturn:e.target.value})} className={inp} style={ii}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Priority</label>
              <select value={f.priority} onChange={e=>setF({...f,priority:e.target.value})} className={inp} style={ii}>
                {['low','medium','high','hot'].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Lead Source</label>
              <select value={f.source} onChange={e=>setF({...f,source:e.target.value})} className={inp} style={ii}>
                {LEAD_SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button onClick={()=>m.mutate()} disabled={!f.name||m.isPending} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all">
            {m.isPending?'Saving...':isEdit?'Save Changes':'+ Add Lead'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function TaskModal({ open, onClose }) {
  const [f,setF] = useState({title:'',dueDate:'',priority:'medium'})
  const qc = useQueryClient()
  const m = useMutation({
    mutationFn:()=>wevisaCRMAPI.createTask(f),
    onSuccess:()=>{qc.invalidateQueries(['wv-tasks']);toast.success('Task created!');onClose()},
  })
  if(!open) return null
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-lg">📋 New Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="space-y-3">
          <div><label className={lbl}>Title *</label><input value={f.title} onChange={e=>setF({...f,title:e.target.value})} className={inp} style={ii} placeholder="Task title..."/></div>
          <div><label className={lbl}>Due Date</label><input type="date" value={f.dueDate} onChange={e=>setF({...f,dueDate:e.target.value})} className={inp} style={ii}/></div>
          <div>
            <label className={lbl}>Priority</label>
            <select value={f.priority} onChange={e=>setF({...f,priority:e.target.value})} className={inp} style={ii}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
          <button onClick={()=>m.mutate()} disabled={!f.title||m.isPending} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 shadow-md">
            {m.isPending?'Saving...':'Save Task'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function WeVisaCRMPage() {
  const [tab,setTab]   = useState('Dashboard')
  const [mLead,setML]  = useState(false)
  const [eLead,setEL]  = useState(null)
  const [mTask,setMT]  = useState(false)
  const [srch,setSrch] = useState('')
  const qc = useQueryClient()

  const {data:leads=[]}  = useQuery({queryKey:['wv-leads'], queryFn:()=>wevisaCRMAPI.getLeads().then(r=>r.data.data||[]), refetchInterval:30000})
  const {data:stats={}}  = useQuery({queryKey:['wv-stats'], queryFn:()=>wevisaCRMAPI.getStats().then(r=>r.data.data||{}), refetchInterval:30000})
  const {data:tasks=[]}  = useQuery({queryKey:['wv-tasks'], queryFn:()=>wevisaCRMAPI.getTasks().then(r=>r.data.data||[])})

  const updL = useMutation({mutationFn:({id,d})=>wevisaCRMAPI.updateLead(id,d),onSuccess:()=>qc.invalidateQueries(['wv-leads'])})
  const delL = useMutation({mutationFn:id=>wevisaCRMAPI.deleteLead(id),onSuccess:()=>{qc.invalidateQueries(['wv-leads']);toast.success('Lead deleted')}})
  const togT = useMutation({mutationFn:({id,s})=>wevisaCRMAPI.updateTask(id,{status:s}),onSuccess:()=>qc.invalidateQueries(['wv-tasks'])})

  const filtered = leads.filter(l=>l.name?.toLowerCase().includes(srch.toLowerCase())||l.email?.toLowerCase().includes(srch.toLowerCase())||l.phone?.includes(srch))

  const METRICS = [
    {label:'Total Leads',     val:stats.total??leads.length,                                    icon:'👥', ch:'5%'},
    {label:'New Leads',       val:stats.newLeads??leads.filter(l=>l.status==='new').length,      icon:'✨', ch:'12%'},
    {label:'Open Deals',      val:leads.filter(l=>l.status!=='completed').length,                icon:'💼', ch:'3%'},
    {label:'Deal Value',      val:'₹'+(leads.reduce((s,l)=>s+(l.budget||0),0)/1000).toFixed(0)+'K', icon:'💰', ch:'8%'},
    {label:'Meetings',        val:tasks.filter(t=>t.title?.toLowerCase().includes('meeting')).length, icon:'📅', ch:'2%'},
    {label:'Tasks Completed', val:tasks.filter(t=>t.status==='completed').length,                icon:'✅', ch:'15%'},
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-extrabold text-xl text-gray-800">CRM Dashboard</h2>
            <p className="text-xs text-gray-400">Manage your leads, deals, and customer relationships</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-700 transition-all">
              💬 WhatsApp Settings
            </button>
            <button onClick={()=>setML(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md transition-all">
              + Add New Lead
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap flex-shrink-0 transition-all ${tab===t?'bg-blue-600 text-white shadow':'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
              {t==='Dashboard'&&'⊞ '}{t==='Leads'&&'👥 '}{t==='Contacts'&&'👤 '}{t==='Deals'&&'💼 '}{t==='Calendar'&&'📅 '}{t==='Tasks'&&'✅ '}{t==='Travel agents'&&'🏢 '}{t==='Integrations'&&'🔗 '}{t}
            </button>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD ── */}
      {tab==='Dashboard'&&(
        <div className="p-4 lg:p-6 space-y-5">
          {/* Integrations */}
          <div className="space-y-3">
            {INTS.map(i=>(
              <div key={i.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${i.bg} flex items-center justify-center text-xl flex-shrink-0`}>{i.icon}</div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 text-sm">{i.title}</div>
                    <div className="text-xs text-gray-500">{i.desc}</div>
                    <div className="text-xs text-gray-400">{i.sub}</div>
                  </div>
                </div>
                <button className={`flex-shrink-0 px-4 py-2 rounded-xl text-white text-sm font-semibold ${i.bc} transition-all flex items-center gap-1.5 shadow`}>
                  🔗 {i.btn}
                </button>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {METRICS.map((m,idx)=>(
              <motion.div key={m.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:idx*.05}}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-xs font-bold text-green-500">{m.ch} ↑</span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-gray-800">{m.val}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 font-medium mt-1 leading-tight">{m.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Pipeline + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="font-bold text-gray-800 mb-4">🔄 Lead Pipeline</div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PIPELINE.map(s=>{
                  const sl=leads.filter(l=>l.status===s.key)
                  return(
                    <div key={s.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor:s.color}}/>
                        <span className="w-6 h-6 rounded-full border-2 text-[10px] font-bold flex items-center justify-center" style={{borderColor:s.color,color:s.color}}>{sl.length}</span>
                      </div>
                      <div className="text-[9px] font-bold text-gray-600 mb-2 leading-tight">{s.label}</div>
                      {sl.length===0
                        ? <div className="text-[8px] text-gray-300 text-center py-1">No leads in this stage</div>
                        : sl.slice(0,2).map(l=><div key={l._id} className="text-[8px] bg-white rounded-lg p-1 border border-gray-100 mb-1 truncate font-medium text-gray-700">{l.name}</div>)
                      }
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-sm">◀</button>
                  <span className="text-sm font-bold text-gray-700">April 2026</span>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-sm">▶</button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-[10px] text-center text-gray-400 mb-1 font-semibold">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d}>{d}</div>)}
                </div>
                {APR.map((wk,wi)=>(
                  <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
                    {wk.map((day,di)=>(
                      <div key={di} className={`h-7 w-7 flex items-center justify-center rounded-full mx-auto text-[10px] cursor-pointer transition-all ${day===16?'bg-blue-600 text-white font-bold shadow':day?'text-gray-600 hover:bg-gray-100':'text-gray-200'}`}>
                        {day||''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-gray-800">📋 Upcoming Tasks</span>
                  <button onClick={()=>setTab('Tasks')} className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="space-y-2.5">
                  {tasks.length>0?tasks.slice(0,3).map(t=>(
                    <div key={t._id} className="flex items-start gap-2.5">
                      <input type="checkbox" checked={t.status==='completed'} onChange={()=>togT.mutate({id:t._id,s:t.status==='completed'?'pending':'completed'})} className="mt-0.5 accent-blue-600 cursor-pointer"/>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium text-gray-700 truncate ${t.status==='completed'?'line-through text-gray-400':''}`}>{t.title}</div>
                        <div className="text-[10px] text-gray-400">📅 {fmt(t.dueDate)} · <span className={`font-semibold ${t.priority==='high'?'text-red-500':t.priority==='medium'?'text-yellow-500':'text-green-500'}`}>{t.priority?.charAt(0).toUpperCase()+t.priority?.slice(1)} Priority</span></div>
                      </div>
                    </div>
                  )):DEMO_TASKS.map((t,i)=>(
                    <div key={i} className="flex items-start gap-2.5">
                      <input type="checkbox" className="mt-0.5 accent-blue-600"/>
                      <div>
                        <div className="text-xs font-medium text-gray-700">{t.t}</div>
                        <div className="text-[10px] text-gray-400">📅 {t.d} · <span className={`font-semibold ${t.c}`}>{t.p}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setMT(true)} className="w-full mt-3 py-2 rounded-xl border border-dashed border-blue-300 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-all">+ Add Task</button>
              </div>

              {/* Activities */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="font-bold text-sm text-gray-800 mb-3">⚡ Recent Activities</div>
                <div className="space-y-2.5">
                  {ACTS.map((a,i)=>(
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center text-sm flex-shrink-0`}>{a.icon}</div>
                      <div>
                        <div className="text-xs font-medium text-gray-700">{a.t}</div>
                        <div className="text-[10px] text-gray-400">{a.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LEADS ── */}
      {tab==='Leads'&&(
        <div className="p-4 lg:p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-gray-100 gap-3">
              <input value={srch} onChange={e=>setSrch(e.target.value)} className="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" style={ii} placeholder="🔍 Search name, email, phone..."/>
              <button onClick={()=>setML(true)} className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow">+ Add Lead</button>
            </div>
            {filtered.length===0?(
              <div className="text-center py-20">
                <div className="text-5xl mb-3">👥</div>
                <div className="font-semibold text-gray-500 text-lg">No leads yet</div>
                <p className="text-sm text-gray-400 mt-1">Add your first lead to get started</p>
                <button onClick={()=>setML(true)} className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow">+ Add Lead</button>
              </div>
            ):(
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Lead','Contact','Service','Destination','Travel Dates','Source','Status','Actions'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((lead,i)=>(
                      <motion.tr key={lead._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*.03}} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow">
                              {lead.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-800">{lead.name}</div>
                              <div className="text-[10px] text-gray-400">{fmt(lead.createdAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <a href={`tel:${lead.phone}`} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all" title="Call">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            </a>
                            <a href={`https://wa.me/${lead.phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all" title="WhatsApp">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </a>
                            <a href={`mailto:${lead.email}`} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all" title="Email">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </a>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">{lead.phone||'—'}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-gray-700">{lead.visaInterest||'—'}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-600">{lead.destination||'—'}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">
                          <div>Go: {lead.travelDateGo?fmt(lead.travelDateGo):'—'}</div>
                          <div className="text-gray-400">Return: {lead.travelDateReturn?fmt(lead.travelDateReturn):'—'}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{lead.source||'—'}</td>
                        <td className="px-4 py-3.5">
                          <select value={lead.status} onChange={e=>updL.mutate({id:lead._id,d:{status:e.target.value}})}
                            className="text-xs px-2.5 py-1.5 rounded-full font-bold cursor-pointer focus:outline-none" style={{...SCLR[lead.status]?{color:'inherit',backgroundColor:'inherit'}:{},border:'none'}}>
                            {PIPELINE.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={()=>setEL(lead)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all opacity-0 group-hover:opacity-100" title="Edit Lead">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <Link to="/wevisa/invoice" className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all" title="Generate Invoice">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </Link>
                            <button onClick={()=>delL.mutate(lead._id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all" title="Delete">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
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

      {/* ── TASKS ── */}
      {tab==='Tasks'&&(
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="font-bold text-gray-800 text-lg">📋 Tasks</h3><p className="text-sm text-gray-400">Manage your follow-ups and to-dos</p></div>
            <button onClick={()=>setMT(true)} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow">+ New Task</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[{k:'pending',l:'Pending',dot:'bg-yellow-400'},{k:'completed',l:'Completed',dot:'bg-green-500'}].map(col=>(
              <div key={col.k} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot} inline-block`}/>
                  {col.l} ({tasks.filter(t=>t.status===col.k).length})
                </div>
                <div className="space-y-2">
                  {tasks.filter(t=>t.status===col.k).map(task=>(
                    <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                      <input type="checkbox" checked={col.k==='completed'} onChange={()=>togT.mutate({id:task._id,s:col.k==='completed'?'pending':'completed'})} className="accent-blue-600 cursor-pointer"/>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold text-gray-800 truncate ${col.k==='completed'?'line-through text-gray-400':''}`}>{task.title}</div>
                        <div className="text-[10px] text-gray-400">Due: {fmt(task.dueDate)} · <span className={`font-semibold ${task.priority==='high'?'text-red-500':task.priority==='medium'?'text-yellow-500':'text-green-500'}`}>{task.priority}</span></div>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t=>t.status===col.k).length===0&&<div className="text-center py-8 text-gray-300 text-sm">{col.k==='pending'?'No pending tasks 🎉':'No completed tasks'}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRAVEL AGENTS ── */}
      {tab==='Travel agents'&&(
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="font-extrabold text-xl text-gray-800">Travel Agents Management</h3><p className="text-sm text-gray-400">Manage your travel agents and their leads</p></div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow">+ Add Travel agent</button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <input className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" style={ii} placeholder="🔍 Search agents by name, phone or company..."/>
            </div>
            <div className="text-center py-24">
              <div className="text-5xl mb-3 opacity-30">🏢</div>
              <div className="text-lg font-semibold text-gray-400">No agents found</div>
              <div className="text-sm text-gray-300 mt-1">No travel agents have been added yet.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── INTEGRATIONS ── */}
      {tab==='Integrations'&&(
        <div className="p-4 lg:p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-5">🔗 Integrations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INTS.map(i=>(
              <div key={i.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl ${i.bg} flex items-center justify-center text-2xl mb-4`}>{i.icon}</div>
                <h4 className="font-bold text-gray-800 mb-1">{i.title}</h4>
                <p className="text-sm text-gray-500 mb-1">{i.desc}</p>
                <p className="text-xs text-gray-400 mb-4">{i.sub}</p>
                <button className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold ${i.bc} transition-all shadow flex items-center gap-1.5`}>🔗 {i.btn}</button>
              </div>
            ))}
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:border-blue-300 transition-all cursor-pointer">
              <div className="text-4xl mb-2 text-gray-300">+</div>
              <div className="font-semibold text-gray-400">Add Integration</div>
              <div className="text-xs text-gray-300 mt-1">Connect more tools</div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTACTS / DEALS / CALENDAR ── */}
      {['Contacts','Deals','Calendar'].includes(tab)&&(
        <div className="p-8 flex flex-col items-center justify-center min-h-64">
          <div className="text-6xl mb-4">🚧</div>
          <div className="text-xl font-bold text-gray-400">{tab} — Coming Soon</div>
          <div className="text-sm text-gray-300 mt-2">This section is under development.</div>
        </div>
      )}

      <LeadModal open={mLead} onClose={()=>setML(false)}/>
      <LeadModal open={!!eLead} onClose={()=>setEL(null)} editLead={eLead}/>
      <TaskModal open={mTask} onClose={()=>setMT(false)}/>
    </div>
  )
}

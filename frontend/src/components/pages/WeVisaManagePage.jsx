// src/components/pages/WeVisaManagePage.jsx
// Admin panel: manage WeVisa platform — Countries, Packages, Agents, Applications, Pricing
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { PageHeader, MetricCard, StatusBadge, Spinner, EmptyState } from '@/components/ui'
import { wevisaAdminAPI } from '@/services/wevisaApi'

const REGIONS    = ['Asia','Europe','Americas','Africa','Oceania','Middle East']
const CATEGORIES = ['evisa','sticker','on_arrival','appointment','free']
const TABS       = ['Overview','Countries','Packages','Agents','Applications','Pricing']
const IL = 'input w-full'
const LB = 'block text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-1.5'

// ── View Documents Modal (Admin) ──────────────────────────────────
function ViewDocsModal({ application, onClose }) {
  if (!application) return null
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}}
        className="relative bg-bg2 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-2xl w-full max-w-lg z-10 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.07)]">
          <h3 className="font-syne font-bold text-white">📄 Application Documents</h3>
          <button onClick={onClose} className="text-[var(--text3)] hover:text-white text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-sm font-semibold text-white mb-1">{application.applicantName}</div>
            <div className="text-xs text-[var(--text3)]">{application.country} · {application.visaType} · ₹{application.price?.toLocaleString()}</div>
            {application.trackingId && <div className="text-xs text-yellow-400 mt-1">Tracking: {application.trackingId}</div>}
          </div>
          
          {application.documents && application.documents.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[var(--text2)] uppercase mb-2">Uploaded Documents ({application.documents.length})</div>
              {application.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between bg-bg3 rounded-lg px-4 py-3 border border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <div className="text-sm font-medium text-white">{doc.name}</div>
                      <div className="text-xs text-[var(--text3)]">{doc.type || 'Document'}</div>
                    </div>
                  </div>
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30">
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-yellow-400">Pending Upload</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-30">📄</div>
              <div className="text-sm text-[var(--text3)]">No documents uploaded yet</div>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline">Close</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Country Modal ──────────────────────────────────────────────
function CountryModal({ country, onClose }) {
  const qc = useQueryClient()
  const [f, setF] = useState({
    name: country?.name||'', code: country?.code||'', flag: country?.flag||'',
    region: country?.region||'Asia', capital: country?.capital||'',
    description: country?.description||'',
    isActive: country?.isActive??true, isFeatured: country?.isFeatured??false, isSchengen: country?.isSchengen??false,
    sortOrder: country?.sortOrder||0,
  })
  const mut = useMutation({
    mutationFn: () => country?._id ? wevisaAdminAPI.updateCountry(country._id, f) : wevisaAdminAPI.createCountry(f),
    onSuccess: () => { qc.invalidateQueries(['admin-countries']); qc.invalidateQueries(['landing-countries']); toast.success(country?._id?'Country updated!':'Country added!'); onClose() },
  })
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}}
        className="relative bg-bg2 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-2xl w-full max-w-lg z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.07)]">
          <h3 className="font-syne font-bold text-white">{country?._id?'Edit Country':'Add Country'}</h3>
          <button onClick={onClose} className="text-[var(--text3)] hover:text-white text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><label className={LB}>Name *</label><input className={IL} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="United Arab Emirates"/></div>
            <div><label className={LB}>ISO Code *</label><input className={IL} value={f.code} onChange={e=>setF({...f,code:e.target.value.toUpperCase()})} placeholder="AE" maxLength={2}/></div>
            <div><label className={LB}>Flag Emoji *</label><input className={IL} value={f.flag} onChange={e=>setF({...f,flag:e.target.value})} placeholder="🇦🇪"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LB}>Region *</label>
              <select className={IL} value={f.region} onChange={e=>setF({...f,region:e.target.value})}>
                {REGIONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div><label className={LB}>Capital</label><input className={IL} value={f.capital} onChange={e=>setF({...f,capital:e.target.value})} placeholder="Abu Dhabi"/></div>
          </div>
          <div><label className={LB}>Description</label><textarea className="input w-full h-16 resize-none" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></div>
          <div className="flex gap-4 flex-wrap">
            {[['isActive','Active on Landing Page'],['isFeatured','Featured / Highlighted'],['isSchengen','Schengen Country']].map(([k,l])=>(
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={f[k]} onChange={e=>setF({...f,[k]:e.target.checked})} className="accent-[var(--red)]"/>
                <span className="text-xs text-[var(--text2)]">{l}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="btn-outline">Cancel</button>
            <button onClick={()=>mut.mutate()} disabled={!f.name||!f.code||!f.flag||mut.isPending} className="btn-primary">
              {mut.isPending?<Spinner size={14} color="#fff"/>:country?._id?'Save Changes':'Add Country'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Package Modal ──────────────────────────────────────────────
function PackageModal({ pkg, onClose }) {
  const qc = useQueryClient()
  const [f, setF] = useState({
    countryName: pkg?.countryName||'', countryFlag: pkg?.countryFlag||'', countryCode: pkg?.countryCode||'',
    name: pkg?.name||'', visaType: pkg?.visaType||'', category: pkg?.category||'evisa',
    stayDuration: pkg?.stayDuration||'', validity: pkg?.validity||'', entries: pkg?.entries||'single',
    processingTime: pkg?.processingTime||'', price: pkg?.price||'', agentCost: pkg?.agentCost||'', commission: pkg?.commission||'',
    description: pkg?.description||'', importantNotes: (pkg?.importantNotes||[]).join('\n'),
    isExpress: pkg?.isExpress??false, isActive: pkg?.isActive??true, isFeatured: pkg?.isFeatured??false,
  })
  const {data:countries=[]} = useQuery({queryKey:['admin-countries'], queryFn:()=>wevisaAdminAPI.getCountries().then(r=>r.data.data||[])})
  const mut = useMutation({
    mutationFn: () => {
      const payload = {...f, price:Number(f.price), agentCost:Number(f.agentCost), commission:Number(f.commission),
        importantNotes: f.importantNotes.split('\n').filter(Boolean)}
      return pkg?._id ? wevisaAdminAPI.updatePackage(pkg._id,payload) : wevisaAdminAPI.createPackage(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-packages']); qc.invalidateQueries(['landing-express']); qc.invalidateQueries(['landing-all-packages'])
      qc.invalidateQueries(['wv-packages-public'])
      toast.success(pkg?._id?'Package updated!':'Package added!'); onClose()
    },
  })
  const selectCountry = name => {
    const c = countries.find(c=>c.name===name)
    if (c) setF(p=>({...p,countryName:c.name,countryFlag:c.flag,countryCode:c.code}))
  }
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}}
        className="relative bg-bg2 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-2xl w-full max-w-2xl z-10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.07)] flex-shrink-0">
          <h3 className="font-syne font-bold text-white">{pkg?._id?'Edit Package':'Add Visa Package'}</h3>
          <button onClick={onClose} className="text-[var(--text3)] hover:text-white text-xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400">
            💡 Changes here reflect immediately on the landing page, agent portal Apply page, and all pricing shown to agents.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LB}>Country *</label>
              <select className={IL} value={f.countryName} onChange={e=>selectCountry(e.target.value)}>
                <option value="">Select country...</option>
                {countries.map(c=><option key={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={LB}>Package Name *</label><input className={IL} value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="30 Days Tourist Visa"/></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LB}>Category *</label>
              <select className={IL} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c.replace('_',' ')}</option>)}
              </select>
            </div>
            <div><label className={LB}>Visa Type *</label><input className={IL} value={f.visaType} onChange={e=>setF({...f,visaType:e.target.value})} placeholder="Tourist"/></div>
            <div>
              <label className={LB}>Entries</label>
              <select className={IL} value={f.entries} onChange={e=>setF({...f,entries:e.target.value})}>
                {['single','double','multiple'].map(e=><option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={LB}>Processing Time *</label><input className={IL} value={f.processingTime} onChange={e=>setF({...f,processingTime:e.target.value})} placeholder="4 Hours"/></div>
            <div><label className={LB}>Stay Duration *</label><input className={IL} value={f.stayDuration} onChange={e=>setF({...f,stayDuration:e.target.value})} placeholder="30 Days"/></div>
            <div><label className={LB}>Validity</label><input className={IL} value={f.validity} onChange={e=>setF({...f,validity:e.target.value})} placeholder="60 Days from issue"/></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={LB}>Agent Selling Price (₹) *</label><input className={IL} type="number" value={f.price} onChange={e=>setF({...f,price:e.target.value})} placeholder="2499"/></div>
            <div><label className={LB}>Our Cost (₹)</label><input className={IL} type="number" value={f.agentCost} onChange={e=>setF({...f,agentCost:e.target.value})} placeholder="1800"/></div>
            <div><label className={LB}>Agent Commission (₹)</label><input className={IL} type="number" value={f.commission} onChange={e=>setF({...f,commission:e.target.value})} placeholder="700"/></div>
          </div>
          <div><label className={LB}>Description</label><textarea className="input w-full h-16 resize-none" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></div>
          <div><label className={LB}>Important Notes (one per line)</label><textarea className="input w-full h-20 resize-none font-mono text-xs" value={f.importantNotes} onChange={e=>setF({...f,importantNotes:e.target.value})} placeholder="Full payment required&#10;Processing starts after payment..."/></div>
          <div className="flex gap-4 flex-wrap">
            {[['isExpress','⚡ Express Visa (shows on landing page first)'],['isActive','Published / Active'],['isFeatured','Featured']].map(([k,l])=>(
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={f[k]} onChange={e=>setF({...f,[k]:e.target.checked})} className="accent-[var(--red)]"/>
                <span className="text-xs text-[var(--text2)]">{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-[rgba(255,255,255,0.07)] flex-shrink-0">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={()=>mut.mutate()} disabled={!f.countryName||!f.name||!f.price||mut.isPending} className="btn-primary">
            {mut.isPending?<Spinner size={14} color="#fff"/>:pkg?._id?'Save Package':'Add Package'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function WeVisaManagePage() {
  const [activeTab, setActiveTab]   = useState('Overview')
  const [showCountry, setShowCountry] = useState(false)
  const [editCountry, setEditCountry] = useState(null)
  const [showPackage, setShowPackage] = useState(false)
  const [editPackage, setEditPackage] = useState(null)
  const [viewDocsApp, setViewDocsApp] = useState(null)
  const [cSearch,  setCSearch]  = useState('')
  const [aSearch,  setASearch]  = useState('')
  const qc = useQueryClient()

  const {data:stats={}}         = useQuery({queryKey:['admin-wv-stats'],       queryFn:()=>wevisaAdminAPI.getStats().then(r=>r.data.data||{}),                       refetchInterval:60000})
  const {data:countries=[],isLoading:loadC} = useQuery({queryKey:['admin-countries',cSearch],  queryFn:()=>wevisaAdminAPI.getCountries({search:cSearch}).then(r=>r.data.data||[])})
  const {data:packages=[],isLoading:loadP}  = useQuery({queryKey:['admin-packages'],           queryFn:()=>wevisaAdminAPI.getPackages().then(r=>r.data.data||[])})
  const {data:agents=[],isLoading:loadA}    = useQuery({queryKey:['admin-agents',aSearch],     queryFn:()=>wevisaAdminAPI.getAgents({search:aSearch,limit:50}).then(r=>r.data.data||[])})
  const {data:applications=[]}             = useQuery({queryKey:['admin-applications'],        queryFn:()=>wevisaAdminAPI.getApplications({limit:30}).then(r=>r.data.data||[])})
  const {data:usaPricing={}}               = useQuery({queryKey:['admin-usa-pricing'],         queryFn:()=>wevisaAdminAPI.getUSAPricing().then(r=>r.data.data||{}),         staleTime:60000})
  const {data:ticketPricing={}}            = useQuery({queryKey:['admin-ticket-pricing'],      queryFn:()=>wevisaAdminAPI.getDummyPricing().then(r=>r.data.data||{}),        staleTime:60000})

  const [pricingForm, setPricingForm] = useState(null)
  React.useEffect(()=>{ if (usaPricing?.pan_india) setPricingForm(p=>p||{...usaPricing}) },[usaPricing])

  const toggleCountry = useMutation({mutationFn:({id,isActive})=>wevisaAdminAPI.updateCountry(id,{isActive}), onSuccess:()=>{qc.invalidateQueries(['admin-countries']);qc.invalidateQueries(['landing-countries'])}})
  const togglePackage = useMutation({mutationFn:({id,isActive})=>wevisaAdminAPI.updatePackage(id,{isActive}), onSuccess:()=>{qc.invalidateQueries(['admin-packages']);qc.invalidateQueries(['landing-express'])}})
  const updateAgent   = useMutation({mutationFn:({id,data})=>wevisaAdminAPI.updateAgent(id,data),             onSuccess:()=>{qc.invalidateQueries(['admin-agents']);toast.success('Agent updated!')}})
  const updateApp     = useMutation({mutationFn:({id,status})=>wevisaAdminAPI.updateApplication(id,{status}), onSuccess:()=>qc.invalidateQueries(['admin-applications'])})
  const updatePricing = useMutation({
    mutationFn: ()=>wevisaAdminAPI.updateUSAPricing(pricingForm),
    onSuccess: ()=>{ qc.invalidateQueries(['admin-usa-pricing']); qc.invalidateQueries(['landing-usa-pricing']); toast.success('USA pricing updated! Changes reflect on landing page.') },
  })

  const STAT_CARDS = [
    {label:'Total Agents',    value:stats.agents??0,          change:`${stats.activeAgents??0} active`,   icon:'👥', accent:'blue'},
    {label:'Countries',       value:stats.countries??0,        change:'On landing page',                   icon:'🌍', accent:'green'},
    {label:'Visa Packages',   value:stats.packages??0,         change:'Live pricing',                      icon:'📦', accent:'gold'},
    {label:'Applications',    value:stats.applications??0,     change:`${stats.pendingApps??0} pending`,   icon:'📋', accent:'red'},
    {label:'Dummy Tickets',   value:stats.tickets??0,          change:'Generated',                         icon:'🎫', accent:'blue'},
    {label:'Revenue (Paid)',  value:`₹${((stats.revenue||0)/1000).toFixed(1)}K`, change:'Paid invoices', icon:'💰', accent:'green'},
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="WeVisa Platform Management"
        subtitle="Everything changed here reflects live on the landing page and agent portal instantly."
        action={
          <div className="flex gap-2">
            <button onClick={()=>{setEditCountry(null);setShowCountry(true)}} className="btn-outline text-xs py-2">+ Add Country</button>
            <button onClick={()=>{setEditPackage(null);setShowPackage(true)}} className="btn-primary text-xs py-2">+ Add Package</button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((s,i)=><MetricCard key={s.label} label={s.label} value={s.value} change={s.change} icon={s.icon} accent={s.accent} delay={i*.05}/>)}
      </div>

      {/* Live link banner */}
      <div className="card p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-xl">🔗</div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">All changes reflect live on the WeVisa landing page & agent portal</div>
          <div className="text-xs text-[var(--text3)]">
            Countries → landing page country section &nbsp;|&nbsp; Packages → landing page + agent Apply page &nbsp;|&nbsp;
            Pricing → USA appointment section on landing page
          </div>
        </div>
        <a href="/wevisa" target="_blank" rel="noreferrer">
          <button className="btn-outline text-xs py-1.5 flex-shrink-0">Open Landing Page ↗</button>
        </a>
        <a href="/wevisa/dashboard" target="_blank" rel="noreferrer">
          <button className="btn-outline text-xs py-1.5 flex-shrink-0">Open Agent Portal ↗</button>
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[rgba(255,255,255,0.07)] overflow-x-auto">
        {TABS.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeTab===t?'border-[var(--red)] text-[var(--red2)] bg-[rgba(232,55,42,0.06)]':'border-transparent text-[var(--text2)] hover:text-white'}`}>
            {t==='Overview'&&'📊 '}{t==='Countries'&&'🌍 '}{t==='Packages'&&'📦 '}{t==='Agents'&&'👥 '}{t==='Applications'&&'📋 '}{t==='Pricing'&&'💲 '}{t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab==='Overview'&&(
        <div className="grid grid-cols-2 gap-5">
          <div className="card">
            <div className="card-header"><div className="card-title">📋 Recent Applications</div></div>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {applications.slice(0,8).length===0?<EmptyState icon="📋" title="No applications" description=""/>:
                applications.slice(0,8).map(app=>(
                  <div key={app._id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{app.applicantName}</div>
                      <div className="text-[10px] text-[var(--text3)]">{app.country} · {app.visaType}</div>
                    </div>
                    <select value={app.status} onChange={e=>updateApp.mutate({id:app._id,status:e.target.value})}
                      className="text-[10px] px-2 py-1 rounded-lg bg-bg3 border border-[rgba(255,255,255,0.07)] text-[var(--text2)] focus:outline-none cursor-pointer">
                      {['submitted','processing','approved','rejected','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">👥 Recent Agents</div></div>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {agents.slice(0,8).length===0?<EmptyState icon="👥" title="No agents" description=""/>:
                agents.slice(0,8).map(agent=>(
                  <div key={agent._id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {agent.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{agent.name}</div>
                      <div className="text-[10px] text-[var(--text3)] truncate">{agent.agencyName}</div>
                    </div>
                    <StatusBadge status={agent.status}/>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ── COUNTRIES ── */}
      {activeTab==='Countries'&&(
        <div>
          <div className="flex items-center gap-3 mb-4">
            <input className="input flex-1 max-w-xs" placeholder="🔍 Search countries..." value={cSearch} onChange={e=>setCSearch(e.target.value)}/>
            <button onClick={()=>{setEditCountry(null);setShowCountry(true)}} className="btn-primary text-xs py-2">+ Add Country</button>
          </div>
          <div className="card">
            <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.07)] bg-blue-500/5">
              <div className="text-xs text-blue-400">💡 Mark as "Featured" to highlight on landing page. Toggle "Active" to show/hide from landing page & agent portal.</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[rgba(255,255,255,0.07)]">
                  {['Country','Region','Code','Featured','Schengen','Status','Actions'].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {loadC?Array(5).fill(0).map((_,i)=><tr key={i}>{Array(7).fill(0).map((_,j)=><td key={j} className="px-4 py-3"><div className="skeleton h-4 w-16 rounded"/></td>)}</tr>)
                    :countries.length===0?<tr><td colSpan={7}><EmptyState icon="🌍" title="No countries" description="Add countries — they appear on the landing page"/></td></tr>
                    :countries.map(c=>(
                      <motion.tr key={c._id} initial={{opacity:0}} animate={{opacity:1}} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{c.flag}</span>
                            <div><div className="text-xs font-semibold text-white">{c.name}</div>{c.capital&&<div className="text-[10px] text-[var(--text3)]">{c.capital}</div>}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text2)]">{c.region}</td>
                        <td className="px-4 py-3 text-xs font-mono text-[var(--text3)]">{c.code}</td>
                        <td className="px-4 py-3 text-xs">{c.isFeatured?<span className="text-yellow-400">⭐ Yes</span>:'—'}</td>
                        <td className="px-4 py-3 text-xs">{c.isSchengen?<span className="text-blue-400">✓</span>:'—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={()=>toggleCountry.mutate({id:c._id,isActive:!c.isActive})}
                            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all ${c.isActive?'bg-green-500/20 text-green-400 border border-green-500/30':'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {c.isActive?'● Live':'○ Hidden'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={()=>{setEditCountry(c);setShowCountry(true)}}
                            className="text-[10px] px-2.5 py-1 rounded-lg border border-[rgba(255,255,255,0.07)] text-[var(--text2)] hover:border-blue-500 hover:text-blue-400 transition-all">✏️ Edit</button>
                        </td>
                      </motion.tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PACKAGES ── */}
      {activeTab==='Packages'&&(
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
              ✅ Package changes (price, processing time, commission) reflect immediately on landing page + agent Apply page
            </div>
            <button onClick={()=>{setEditPackage(null);setShowPackage(true)}} className="btn-primary text-xs py-2 ml-auto">+ Add Package</button>
          </div>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[rgba(255,255,255,0.07)]">
                  {['Country','Package Name','Category','Processing','Selling Price','Commission','Status','Actions'].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {loadP?Array(5).fill(0).map((_,i)=><tr key={i}>{Array(8).fill(0).map((_,j)=><td key={j} className="px-4 py-3"><div className="skeleton h-4 w-16 rounded"/></td>)}</tr>)
                    :packages.length===0?<tr><td colSpan={8}><EmptyState icon="📦" title="No packages" description="Add visa packages — they appear on landing page and agent Apply page"/></td></tr>
                    :packages.map(pkg=>(
                      <motion.tr key={pkg._id} initial={{opacity:0}} animate={{opacity:1}} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span>{pkg.countryFlag||'🌍'}</span>
                            <span className="text-xs font-semibold text-white">{pkg.countryName}</span>
                            {pkg.isExpress&&<span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-bold">⚡</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text2)]">{pkg.name}</td>
                        <td className="px-4 py-3 text-xs capitalize text-[var(--text3)]">{pkg.category}</td>
                        <td className="px-4 py-3 text-xs text-green-400 font-semibold">{pkg.processingTime}</td>
                        <td className="px-4 py-3 text-xs font-bold text-white">₹{pkg.price?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-yellow-400 font-semibold">{pkg.commission?`₹${pkg.commission?.toLocaleString()}`:'—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={()=>togglePackage.mutate({id:pkg._id,isActive:!pkg.isActive})}
                            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all ${pkg.isActive?'bg-green-500/20 text-green-400 border border-green-500/30':'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {pkg.isActive?'● Live':'○ Hidden'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={()=>{setEditPackage(pkg);setShowPackage(true)}}
                            className="text-[10px] px-2.5 py-1 rounded-lg border border-[rgba(255,255,255,0.07)] text-[var(--text2)] hover:border-blue-500 hover:text-blue-400 transition-all">✏️ Edit</button>
                        </td>
                      </motion.tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── AGENTS ── */}
      {activeTab==='Agents'&&(
        <div>
          <div className="flex items-center gap-3 mb-4">
            <input className="input flex-1 max-w-xs" placeholder="🔍 Search agents..." value={aSearch} onChange={e=>setASearch(e.target.value)}/>
          </div>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[rgba(255,255,255,0.07)]">
                  {['Agent','Agency','City','Tier','Commission','Verified','Status','Actions'].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {loadA?Array(5).fill(0).map((_,i)=><tr key={i}>{Array(8).fill(0).map((_,j)=><td key={j} className="px-4 py-3"><div className="skeleton h-4 w-16 rounded"/></td>)}</tr>)
                    :agents.length===0?<tr><td colSpan={8}><EmptyState icon="👥" title="No agents" description="Agents appear after registering on WeVisa portal"/></td></tr>
                    :agents.map(agent=>(
                      <motion.tr key={agent._id} initial={{opacity:0}} animate={{opacity:1}} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                              {agent.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white">{agent.name}</div>
                              <div className="text-[10px] text-[var(--text3)] font-mono">{agent.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--text2)]">{agent.agencyName}</td>
                        <td className="px-4 py-3 text-xs text-[var(--text3)]">{agent.city||'—'}</td>
                        <td className="px-4 py-3">
                          <select value={agent.tier} onChange={e=>updateAgent.mutate({id:agent._id,data:{tier:e.target.value}})}
                            className="text-[10px] px-2 py-1 rounded-lg bg-bg3 border border-[rgba(255,255,255,0.07)] text-[var(--text2)] focus:outline-none cursor-pointer capitalize">
                            {['basic','silver','gold','platinum'].map(t=><option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-yellow-400">₹{agent.commissionRate}</td>
                        <td className="px-4 py-3 text-xs">{agent.isVerified?<span className="text-green-400">✓ Yes</span>:<span className="text-[var(--text3)]">No</span>}</td>
                        <td className="px-4 py-3">
                          <select value={agent.status} onChange={e=>updateAgent.mutate({id:agent._id,data:{status:e.target.value}})}
                            className="text-[10px] px-2 py-1 rounded-lg bg-bg3 border border-[rgba(255,255,255,0.07)] text-[var(--text2)] focus:outline-none cursor-pointer">
                            {['pending','active','suspended'].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={()=>updateAgent.mutate({id:agent._id,data:{isVerified:!agent.isVerified}})}
                            className="text-[10px] px-2.5 py-1 rounded-lg border border-[rgba(255,255,255,0.07)] text-[var(--text2)] hover:border-green-500 hover:text-green-400 transition-all">
                            {agent.isVerified?'Unverify':'✓ Verify'}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── APPLICATIONS ── */}
      {activeTab==='Applications'&&(
        <div className="card">
          <div className="card-header"><div><div className="card-title">📋 All Visa Applications</div><div className="card-sub">Submitted by agents · status changes here notify agents</div></div></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[rgba(255,255,255,0.07)]">
                {['Applicant','Country / Visa','Agent','Price','Payment','Status','Documents','Date'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text3)]">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {applications.length===0?<tr><td colSpan={8}><EmptyState icon="📋" title="No applications" description="Visa applications by agents appear here"/></td></tr>
                  :applications.map(app=>(
                    <motion.tr key={app._id} initial={{opacity:0}} animate={{opacity:1}} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3"><div className="text-xs font-semibold text-white">{app.applicantName}</div><div className="text-[10px] text-[var(--text3)] font-mono">{app.trackingId}</div></td>
                      <td className="px-4 py-3"><div className="text-xs font-semibold text-white">{app.country}</div><div className="text-[10px] text-[var(--text3)] capitalize">{app.visaType}</div></td>
                      <td className="px-4 py-3 text-xs text-[var(--text2)]">{app.agent?.name||'—'}</td>
                      <td className="px-4 py-3 text-xs font-bold text-white">₹{app.price?.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${app.paymentStatus==='paid'?'bg-green-500/20 text-green-400':'bg-yellow-500/20 text-yellow-400'}`}>{app.paymentStatus}</span></td>
                      <td className="px-4 py-3">
                        <select value={app.status} onChange={e=>updateApp.mutate({id:app._id,status:e.target.value})}
                          className="text-[10px] px-2 py-1 rounded-lg bg-bg3 border border-[rgba(255,255,255,0.07)] text-[var(--text2)] focus:outline-none cursor-pointer">
                          {['submitted','processing','approved','rejected','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={()=>setViewDocsApp(app)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all ${app.documents?.length > 0 ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}>
                          📄 {app.documents?.length || 0} docs
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-[var(--text3)]">{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                    </motion.tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PRICING CONTROL ── */}
      {activeTab==='Pricing'&&(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* USA Appointment Pricing */}
          <div className="card p-6">
            <div className="card-header mb-4 !p-0 border-0">
              <div>
                <div className="card-title">🇺🇸 USA Early Appointment Pricing</div>
                <div className="card-sub">Changes reflect immediately on landing page USA section</div>
              </div>
            </div>
            {pricingForm && (
              <div className="space-y-4">
                {[
                  {key:'pan_india',      label:'Pan India Price (₹)',      placeholder:'35000'},
                  {key:'state_specific', label:'State Specific Price (₹)', placeholder:'25000'},
                  {key:'city_specific',  label:'City Specific Price (₹)',  placeholder:'20000'},
                ].map(field=>(
                  <div key={field.key}>
                    <label className={LB}>{field.label}</label>
                    <input className={IL} type="number" value={pricingForm[field.key]||''}
                      onChange={e=>setPricingForm(p=>({...p,[field.key]:Number(e.target.value)}))}
                      placeholder={field.placeholder}/>
                  </div>
                ))}
                <div>
                  <label className={LB}>Description</label>
                  <textarea className="input w-full h-16 resize-none" value={pricingForm.description||''}
                    onChange={e=>setPricingForm(p=>({...p,description:e.target.value}))}
                    placeholder="Priority slot booking for USA visa appointments..."/>
                </div>
                <div>
                  <label className={LB}>Discount Label (e.g. "15% OFF")</label>
                  <input className={IL} value={pricingForm.discount||''} onChange={e=>setPricingForm(p=>({...p,discount:e.target.value}))} placeholder="15% OFF"/>
                </div>
                <button onClick={()=>updatePricing.mutate()} disabled={updatePricing.isPending} className="btn-primary w-full justify-center">
                  {updatePricing.isPending?<Spinner size={14} color="#fff"/>:'💾 Save USA Pricing — Updates Landing Page'}
                </button>
              </div>
            )}
          </div>

          {/* Dummy Ticket & Other */}
          <div className="space-y-5">
            <div className="card p-6">
              <div className="card-title mb-1">🎫 Dummy Ticket Pricing</div>
              <div className="card-sub mb-4">Currently: ₹{ticketPricing?.price||299} — set via DUMMY_TICKET_PRICE env variable</div>
              <div className="p-4 bg-bg3 rounded-xl border border-[rgba(255,255,255,0.05)]">
                <div className="text-xs text-[var(--text2)] mb-2">To change dummy ticket price, update the <span className="font-mono text-yellow-400">DUMMY_TICKET_PRICE</span> environment variable in your .env file and restart the server.</div>
                <div className="text-xs text-[var(--text3)]">Current price: <span className="text-white font-mono font-bold">₹{ticketPricing?.price||299}</span></div>
              </div>
            </div>

            <div className="card p-6">
              <div className="card-title mb-1">📦 Package Quick Stats</div>
              <div className="card-sub mb-4">Live package breakdown</div>
              <div className="space-y-2">
                {[
                  {label:'eVisa Packages',      count:packages.filter(p=>p.category==='evisa').length,      icon:'💻'},
                  {label:'Sticker Visas',        count:packages.filter(p=>p.category==='sticker').length,    icon:'📌'},
                  {label:'Appointment Packages', count:packages.filter(p=>p.category==='appointment').length,icon:'📅'},
                  {label:'Express Packages',     count:packages.filter(p=>p.isExpress).length,              icon:'⚡'},
                  {label:'Active / Live',        count:packages.filter(p=>p.isActive).length,               icon:'✅'},
                ].map(s=>(
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <span className="text-xs text-[var(--text2)] flex items-center gap-2"><span>{s.icon}</span>{s.label}</span>
                    <span className="text-sm font-bold text-white">{s.count}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>{setEditPackage(null);setShowPackage(true)}} className="btn-primary w-full justify-center mt-4 text-xs">+ Add New Package</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCountry&&<CountryModal country={editCountry} onClose={()=>{setShowCountry(false);setEditCountry(null)}}/>}
        {showPackage&&<PackageModal pkg={editPackage} onClose={()=>{setShowPackage(false);setEditPackage(null)}}/>}
        {viewDocsApp&&<ViewDocsModal application={viewDocsApp} onClose={()=>setViewDocsApp(null)}/>}
      </AnimatePresence>
    </div>
  )
}

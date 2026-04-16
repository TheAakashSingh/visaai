// src/components/wevisa/WeVisaApplyPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaServicesAPI } from '@/services/wevisaApi'

const ii = { color: '#111827', backgroundColor: '#f9fafb', caretColor: '#111827' }
const inp = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors'
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5'

const PKG = [
  {_id:'1',country:'United Arab Emirates',flag:'🇦🇪',visaType:'Tourist eVisa',processingTime:'4 Hours', stayDuration:'30 Days',price:2499,isExpress:true,category:'evisa'},
  {_id:'2',country:'Singapore',           flag:'🇸🇬',visaType:'Tourist eVisa',processingTime:'24 Hours',stayDuration:'30 Days',price:3999,isExpress:true,category:'evisa'},
  {_id:'3',country:'Vietnam',             flag:'🇻🇳',visaType:'Tourist eVisa',processingTime:'2 Hours', stayDuration:'30 Days',price:1499,isExpress:true,category:'evisa'},
  {_id:'4',country:'Bali (Indonesia)',    flag:'🇮🇩',visaType:'Tourist eVisa',processingTime:'24 Hours',stayDuration:'30 Days',price:2999,isExpress:true,category:'evisa'},
  {_id:'5',country:'Turkey',             flag:'🇹🇷',visaType:'Tourist eVisa',processingTime:'24 Hours',stayDuration:'90 Days',price:3499,isExpress:true,category:'evisa'},
  {_id:'6',country:'Thailand',           flag:'🇹🇭',visaType:'Tourist eVisa',processingTime:'3-5 Days',stayDuration:'30 Days',price:2999,isExpress:false,category:'evisa'},
  {_id:'7',country:'Malaysia',           flag:'🇲🇾',visaType:'eVisa',        processingTime:'3-5 Days',stayDuration:'30 Days',price:1999,isExpress:false,category:'evisa'},
  {_id:'8',country:'Canada',             flag:'🇨🇦',visaType:'Tourist Visa', processingTime:'4-6 Weeks',stayDuration:'6 Months',price:12000,isExpress:false,category:'sticker'},
  {_id:'9',country:'United Kingdom',     flag:'🇬🇧',visaType:'Tourist Visa', processingTime:'3 Weeks', stayDuration:'6 Months',price:15000,isExpress:false,category:'sticker'},
  {_id:'10',country:'Australia',          flag:'🇦🇺',visaType:'Tourist Visa', processingTime:'4-6 Weeks',stayDuration:'3 Months',price:18000,isExpress:false,category:'sticker'},
  {_id:'11',country:'Germany',            flag:'🇩🇪',visaType:'Schengen Visa',processingTime:'15 Days', stayDuration:'90 Days',price:8000,isExpress:false,category:'appointment'},
  {_id:'12',country:'France',             flag:'🇫🇷',visaType:'Schengen Visa',processingTime:'15 Days', stayDuration:'90 Days',price:8500,isExpress:false,category:'appointment'},
]
const SCLR = {submitted:'bg-blue-100 text-blue-700',processing:'bg-yellow-100 text-yellow-700',approved:'bg-green-100 text-green-700',rejected:'bg-red-100 text-red-700',cancelled:'bg-gray-100 text-gray-500'}

function ApplyModal({pkg,onClose}) {
  const [step,setStep] = useState(1)
  const [f,setF] = useState({applicantName:'',applicantEmail:'',applicantPhone:'',passportNumber:'',travelDate:'',notes:''})
  const qc = useQueryClient()
  const m = useMutation({
    mutationFn:()=>wevisaServicesAPI.createApplication({country:pkg.country,visaType:pkg.visaType,packageId:pkg._id,price:pkg.price,processingTime:pkg.processingTime,stayDuration:pkg.stayDuration,...f}),
    onSuccess:()=>{qc.invalidateQueries(['wv-apps']);toast.success(`✅ ${pkg.country} application submitted!`);onClose()},
  })
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:.95,y:20}} animate={{opacity:1,scale:1,y:0}} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{pkg.flag}</span>
              <div><div className="font-extrabold text-lg">{pkg.country}</div><div className="text-blue-200 text-sm">{pkg.visaType} · ₹{pkg.price.toLocaleString()}</div></div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          <div className="flex gap-2 mt-4">
            <div className={`flex-1 h-1 rounded-full ${step>=1?'bg-white':'bg-white/30'}`}/>
            <div className={`flex-1 h-1 rounded-full ${step>=2?'bg-white':'bg-white/30'}`}/>
          </div>
          <div className="text-xs text-blue-200 mt-1">{step===1?'Step 1: Applicant Details':'Step 2: Confirm & Submit'}</div>
        </div>
        <div className="p-6 space-y-4">
          {step===1?(
            <>
              <div><label className={lbl}>Applicant Full Name *</label><input value={f.applicantName} onChange={e=>setF({...f,applicantName:e.target.value})} className={inp} style={ii} placeholder="As per passport"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Email</label><input value={f.applicantEmail} onChange={e=>setF({...f,applicantEmail:e.target.value})} className={inp} style={ii} placeholder="email@example.com"/></div>
                <div><label className={lbl}>Phone</label><input value={f.applicantPhone} onChange={e=>setF({...f,applicantPhone:e.target.value})} className={inp} style={ii} placeholder="+91 98765..."/></div>
              </div>
              <div><label className={lbl}>Passport Number</label><input value={f.passportNumber} onChange={e=>setF({...f,passportNumber:e.target.value})} className={inp} style={ii} placeholder="A1234567"/></div>
              <button onClick={()=>setStep(2)} disabled={!f.applicantName} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md">Continue →</button>
            </>
          ):(
            <>
              <div><label className={lbl}>Travel Date</label><input type="date" value={f.travelDate} onChange={e=>setF({...f,travelDate:e.target.value})} className={inp} style={ii}/></div>
              <div><label className={lbl}>Notes</label><textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none" style={ii} placeholder="Special requirements..."/></div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Processing</span><span className="font-bold text-green-600">{pkg.processingTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Stay</span><span className="font-semibold text-gray-700">{pkg.stayDuration}</span></div>
                <div className="flex justify-between border-t border-blue-200 pt-2"><span className="font-bold text-gray-800">Total</span><span className="font-extrabold text-blue-700">₹{pkg.price.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:border-gray-300">← Back</button>
                <button onClick={()=>m.mutate()} disabled={m.isPending} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md">
                  {m.isPending?'Submitting...':'✅ Submit'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function WeVisaApplyPage() {
  const [search,setSearch] = useState('')
  const [filter,setFilter] = useState('all')
  const [sel,setSel]       = useState(null)
  const {data:apps=[]} = useQuery({queryKey:['wv-apps'],queryFn:()=>wevisaServicesAPI.getApplications().then(r=>r.data.data||[])})

  const pkgs = PKG.filter(p=>{
    const ms = p.country.toLowerCase().includes(search.toLowerCase())||p.visaType.toLowerCase().includes(search.toLowerCase())
    const mf = filter==='all'||(filter==='express'&&p.isExpress)||p.category===filter
    return ms&&mf
  })

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-extrabold text-2xl text-gray-800">📝 Apply for Visa</h2><p className="text-sm text-gray-400 mt-0.5">Browse & apply for visas across 100+ countries</p></div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white shadow-sm" style={ii} placeholder="Search country or visa type..."/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all','All'],['express','⚡ Express'],['evisa','💻 eVisa'],['sticker','📌 Sticker'],['appointment','📅 Appointment']].map(([k,l])=>(
            <button key={k} onClick={()=>setFilter(k)} className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 ${filter===k?'bg-blue-600 text-white shadow':'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Express highlight */}
      {filter==='all'&&(
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
          <div className="font-bold text-gray-800 flex items-center gap-2"><span>⚡</span>Express Visas — Process in Hours · High Commission</div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {pkgs.map((pkg,i)=>(
          <motion.div key={pkg._id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*.04}}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all overflow-hidden group">
            <div className={`h-1.5 ${pkg.isExpress?'bg-gradient-to-r from-yellow-400 to-orange-400':'bg-gradient-to-r from-blue-500 to-blue-600'}`}/>
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl sm:text-3xl">{pkg.flag}</span>
                <div className="flex flex-col items-end gap-1">
                  {pkg.isExpress&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold">⚡ EXPRESS</span>}
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${pkg.category==='evisa'?'bg-green-100 text-green-700':pkg.category==='sticker'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>{pkg.category?.toUpperCase()}</span>
                </div>
              </div>
              <div className="font-extrabold text-gray-800 text-sm mb-0.5 truncate">{pkg.country}</div>
              <div className="text-xs text-gray-400 mb-3">{pkg.visaType}</div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">⏱ Processing</span>
                  <span className={`font-bold ${pkg.isExpress?'text-green-600':'text-gray-700'}`}>{pkg.processingTime}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">🗓 Stay</span>
                  <span className="font-semibold text-gray-700">{pkg.stayDuration}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-blue-700 text-base sm:text-lg">₹{pkg.price?.toLocaleString()}</div>
                <button onClick={()=>setSel(pkg)} className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow group-hover:shadow-md">Apply →</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My Applications */}
      {apps.length>0&&(
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">📊 My Applications ({apps.length})</h3></div>
          <div className="divide-y divide-gray-50">
            {apps.map(app=>(
              <div key={app._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-all">
                <span className="text-2xl">{PKG.find(p=>p.country===app.country)?.flag||'🌍'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-800 truncate">{app.applicantName}</div>
                  <div className="text-xs text-gray-400">{app.country} · {app.visaType}</div>
                </div>
                <div className="font-bold text-blue-700 text-sm">₹{app.price?.toLocaleString()}</div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${SCLR[app.status]||'bg-gray-100 text-gray-500'}`}>{app.status}</span>
                {app.trackingId&&<div className="text-[10px] text-gray-400 font-mono hidden sm:block">{app.trackingId}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {sel&&<ApplyModal pkg={sel} onClose={()=>setSel(null)}/>}
    </div>
  )
}

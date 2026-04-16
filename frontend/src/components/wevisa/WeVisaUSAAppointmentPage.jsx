// src/components/wevisa/WeVisaUSAAppointmentPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaServicesAPI } from '@/services/wevisaApi'

const ii  = { color:'#111827', backgroundColor:'#f9fafb', caretColor:'#111827' }
const inp = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors'
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5'

const TYPES = [
  {id:'pan_india',     label:'Pan India (Multi City)', desc:'Available across all VFS centers in India', price:35000, timeframe:'Within 30 Days',   badge:'Most Popular', bc:'bg-blue-100 text-blue-700',   features:['All major cities','Multiple VFS centers','Flexible scheduling']},
  {id:'state_specific',label:'State Specific',         desc:'Choose your preferred state location',      price:25000, timeframe:'Within 3-4 Weeks',  badge:'Recommended',  bc:'bg-green-100 text-green-700', features:['State-level priority','Faster processing','Dedicated slots']},
  {id:'city_specific', label:'City Specific',          desc:'Book for your specific city',               price:20000, timeframe:'Within 3-4 Weeks',  badge:'Basic',        bc:'bg-gray-100 text-gray-600',   features:['Your city only','Standard booking','Available slots']},
]
const NOTES=['Appointment booking subject to availability at US Embassy/Consulate','Full payment required to secure your appointment slot','Passport and required documents must be ready before booking','Our team will assist with the entire application process','Cancellation: 50% refund if cancelled 7 days prior to booking']
const SCLR={pending:'bg-yellow-100 text-yellow-700',processing:'bg-blue-100 text-blue-700',booked:'bg-green-100 text-green-700',completed:'bg-gray-100 text-gray-600',cancelled:'bg-red-100 text-red-700'}

function AppForm({type,onBack}) {
  const [f,setF] = useState({applicantName:'',applicantEmail:'',applicantPhone:'',locationType:type.id,usVisaUsername:'',usVisaPassword:'',state:'',city:'',sq1:'',sq1a:'',sq2:'',sq2a:''})
  const qc = useQueryClient()
  const m = useMutation({
    mutationFn:()=>wevisaServicesAPI.createUSAAppointment({...f,price:type.price,timeframe:type.timeframe}),
    onSuccess:()=>{qc.invalidateQueries(['wv-usa-appts']);toast.success('🇺🇸 USA Appointment submitted!');onBack()},
  })

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">← Back to Options</button>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div><div className="font-bold text-blue-800">{type.label}</div><div className="text-sm text-blue-600">{type.timeframe} · <span className="font-extrabold">₹{type.price.toLocaleString()}</span></div></div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${type.bc}`}>{type.badge}</span>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Personal */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">👤 Your Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Full Name *</label><input value={f.applicantName} onChange={e=>setF({...f,applicantName:e.target.value})} className={inp} style={ii} placeholder="John Doe"/></div>
            <div><label className={lbl}>Email</label><input value={f.applicantEmail} onChange={e=>setF({...f,applicantEmail:e.target.value})} className={inp} style={ii} placeholder="your@email.com"/></div>
          </div>
          <div className="mt-3"><label className={lbl}>Phone Number</label><input value={f.applicantPhone} onChange={e=>setF({...f,applicantPhone:e.target.value})} className={inp} style={ii} placeholder="+91 9876543210"/></div>
          {type.id==='state_specific'&&(
            <div className="mt-3"><label className={lbl}>Preferred State</label>
              <select value={f.state} onChange={e=>setF({...f,state:e.target.value})} className={inp} style={ii}>
                <option value="">Select State</option>
                {['Maharashtra','Delhi','Karnataka','Tamil Nadu','West Bengal','Telangana','Gujarat','Rajasthan','Kerala','Punjab'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          {type.id==='city_specific'&&(
            <div className="mt-3"><label className={lbl}>City</label>
              <select value={f.city} onChange={e=>setF({...f,city:e.target.value})} className={inp} style={ii}>
                <option value="">Select City</option>
                {['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad','Chandigarh','Kochi'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Documents */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">📄 Upload Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Passport Front Page','Passport Back Page'].map(doc=>(
              <div key={doc}>
                <label className={lbl}>{doc}</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⬆️</div>
                  <div className="text-xs text-gray-400">Click to upload</div>
                  <div className="text-[10px] text-gray-300 mt-1">PNG, JPG up to 5MB</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">🔑 US Visa Login Credentials</h3>
          <div className="space-y-3">
            <div><label className={lbl}>Username</label><input value={f.usVisaUsername} onChange={e=>setF({...f,usVisaUsername:e.target.value})} className={inp} style={ii} placeholder="Your US visa portal username"/></div>
            <div><label className={lbl}>Password</label><input type="password" value={f.usVisaPassword} onChange={e=>setF({...f,usVisaPassword:e.target.value})} className={inp} style={ii} placeholder="••••••••"/></div>
          </div>
        </div>

        {/* Security Questions */}
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">🔒 Security Questions</h3>
          {[{num:1,q:'sq1',a:'sq1a'},{num:2,q:'sq2',a:'sq2a'}].map(sq=>(
            <div key={sq.num} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-3">
              <div className="font-semibold text-sm text-gray-700 mb-3">Security Question {sq.num}</div>
              <div className="space-y-2">
                <input value={f[sq.q]} onChange={e=>setF({...f,[sq.q]:e.target.value})} className={inp} style={ii} placeholder="Enter your security question"/>
                <input value={f[sq.a]} onChange={e=>setF({...f,[sq.a]:e.target.value})} className={inp} style={ii} placeholder="Enter your answer"/>
              </div>
            </div>
          ))}
        </div>

        <button onClick={()=>m.mutate()} disabled={!f.applicantName||m.isPending}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-extrabold text-base hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-xl transition-all">
          {m.isPending?'Submitting...`':'🇺🇸 Submit USA Appointment — ₹'+type.price.toLocaleString()}
        </button>
      </div>
    </div>
  )
}

export default function WeVisaUSAAppointmentPage() {
  const [sel,setSel] = useState(null)
  const {data:appts=[]} = useQuery({queryKey:['wv-usa-appts'],queryFn:()=>wevisaServicesAPI.getUSAAppointments().then(r=>r.data.data||[])})

  if(sel) return <AppForm type={sel} onBack={()=>setSel(null)}/>

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold">15% OFF</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 font-bold">🔥 Trending</span>
        </div>
        <h2 className="font-extrabold text-2xl sm:text-3xl text-gray-800 mt-2">USA Early Appointment</h2>
        <p className="text-gray-500 mt-1">Priority slot booking for USA visa appointments within 2 weeks</p>
      </div>

      <h3 className="font-bold text-gray-700 text-center text-xl mb-6">Select Appointment Location Type</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {TYPES.map((t,i)=>(
          <motion.div key={t.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.1}}
            className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer"
            onClick={()=>setSel(t)}>
            <div className="mb-3"><span className={`text-xs px-2.5 py-1 rounded-full font-bold ${t.bc}`}>{t.badge}</span></div>
            <h3 className="text-xl font-extrabold mb-1">{t.label}</h3>
            <p className="text-blue-200 text-sm mb-5">{t.desc}</p>
            <div className="space-y-2 mb-6">
              {t.features.map(f=>(
                <div key={f} className="flex items-center gap-2 text-sm"><span className="text-blue-300">✓</span><span className="text-blue-100">{f}</span></div>
              ))}
            </div>
            <div className="border-t border-blue-500/50 pt-4">
              <div className="text-blue-200 text-xs mb-1">Starting from</div>
              <div className="text-2xl font-extrabold">₹{t.price.toLocaleString()}</div>
            </div>
            <button className="w-full mt-4 py-3 rounded-2xl bg-white text-blue-700 font-extrabold text-sm hover:bg-blue-50 transition-all shadow">Select This Option →</button>
          </motion.div>
        ))}
      </div>

      {/* Important info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">⚠️ Important Information</h3>
        <ul className="space-y-2">
          {NOTES.map(n=>(
            <li key={n} className="flex items-start gap-2 text-sm text-gray-600"><span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>{n}</li>
          ))}
        </ul>
      </div>

      {/* My appointments */}
      {appts.length>0&&(
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">📋 My USA Appointments ({appts.length})</h3></div>
          <div className="divide-y divide-gray-50">
            {appts.map(a=>(
              <div key={a._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <span className="text-2xl">🇺🇸</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-800 truncate">{a.applicantName}</div>
                  <div className="text-xs text-gray-400">{TYPES.find(t=>t.id===a.locationType)?.label||a.locationType}</div>
                </div>
                <div className="font-bold text-blue-700">₹{a.price?.toLocaleString()}</div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${SCLR[a.status]||'bg-gray-100 text-gray-500'}`}>{a.status}</span>
                {a.trackingId&&<div className="text-[10px] text-gray-400 font-mono hidden sm:block">{a.trackingId}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

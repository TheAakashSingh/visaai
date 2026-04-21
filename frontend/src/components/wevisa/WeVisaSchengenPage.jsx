// src/components/wevisa/WeVisaSchengenPage.jsx — Dynamic prices from admin packages
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { wevisaServicesAPI, publicAPI } from '@/services/wevisaApi'

const ii  = { color:'#111827', backgroundColor:'#f9fafb', caretColor:'#111827' }
const inp = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors'
const lbl = 'block text-xs font-bold text-gray-600 mb-1.5'

// Fallback static data (used only when admin hasn't added Schengen packages yet)
const DEFAULT_COUNTRIES = [
  {name:'France',     flag:'🇫🇷', embassy:'VFS Global',        price:8500, info:'Paris, French Riviera, Alps. Most popular Schengen destination.'},
  {name:'Germany',    flag:'🇩🇪', embassy:'VFS Global',        price:8000, info:'Berlin, Munich, Frankfurt. Business and tourism hub.'},
  {name:'Italy',      flag:'🇮🇹', embassy:'VFS Global',        price:8500, info:'Rome, Venice, Milan. Art and culture paradise.'},
  {name:'Spain',      flag:'🇪🇸', embassy:'BLS International', price:8000, info:'Barcelona, Madrid. Beach and vibrant culture.'},
  {name:'Netherlands',flag:'🇳🇱', embassy:'VFS Global',        price:8000, info:'Amsterdam, tulips and windmills. Business hub.'},
  {name:'Switzerland',flag:'🇨🇭', embassy:'VFS Global',        price:9000, info:'Alps, luxury destinations and banking.'},
  {name:'Portugal',   flag:'🇵🇹', embassy:'VFS Global',        price:7500, info:'Lisbon, Porto. Affordable European destination.'},
  {name:'Greece',     flag:'🇬🇷', embassy:'BLS International', price:7500, info:'Santorini, Mykonos, Athens. Island paradise.'},
  {name:'Austria',    flag:'🇦🇹', embassy:'VFS Global',        price:8000, info:'Vienna, Salzburg. Music and imperial history.'},
  {name:'Belgium',    flag:'🇧🇪', embassy:'VFS Global',        price:8000, info:'Brussels, Bruges. EU headquarters and chocolate.'},
  {name:'Czech Rep',  flag:'🇨🇿', embassy:'VFS Global',        price:7500, info:'Prague, beautiful architecture and culture.'},
  {name:'Poland',     flag:'🇵🇱', embassy:'VFS Global',        price:7000, info:'Warsaw, Krakow. Emerging European destination.'},
]
const VISA_TYPES = [{id:'tourist',l:'Tourist',icon:'🏖️'},{id:'business',l:'Business',icon:'💼'},{id:'student',l:'Student',icon:'🎓'},{id:'family',l:'Family',icon:'👨‍👩‍👧'}]
const SCLR = {pending:'bg-yellow-100 text-yellow-700',processing:'bg-blue-100 text-blue-700',booked:'bg-green-100 text-green-700',completed:'bg-gray-100 text-gray-600',cancelled:'bg-red-100 text-red-700'}

function AppModal({country, onClose}) {
  const [f,setF] = useState({applicantName:'',applicantEmail:'',applicantPhone:'',country:country.name,visaType:'tourist',appointmentDate:'',appointmentCenter:''})
  const qc = useQueryClient()
  const m = useMutation({
    mutationFn: () => wevisaServicesAPI.createSchengenAppointment({ ...f, price: country.price }),
    onSuccess: () => { qc.invalidateQueries(['wv-sch-appts']); toast.success(`${country.flag} ${country.name} appointment submitted!`); onClose() },
  })
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flag}</span>
              <div><div className="font-extrabold text-xl">{country.name}</div><div className="text-blue-200 text-sm">Schengen Visa · ₹{country.price?.toLocaleString()}</div></div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div><label className={lbl}>Applicant Full Name *</label><input value={f.applicantName} onChange={e=>setF({...f,applicantName:e.target.value})} className={inp} style={ii} placeholder="As per passport"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Email</label><input value={f.applicantEmail} onChange={e=>setF({...f,applicantEmail:e.target.value})} className={inp} style={ii} placeholder="email@example.com"/></div>
            <div><label className={lbl}>Phone</label><input value={f.applicantPhone} onChange={e=>setF({...f,applicantPhone:e.target.value})} className={inp} style={ii} placeholder="+91 98765..."/></div>
          </div>
          <div>
            <label className={lbl}>Visa Type</label>
            <div className="grid grid-cols-2 gap-2">
              {VISA_TYPES.map(vt=>(
                <button key={vt.id} onClick={()=>setF({...f,visaType:vt.id})}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${f.visaType===vt.id?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span>{vt.icon}</span>{vt.l}
                </button>
              ))}
            </div>
          </div>
          <div><label className={lbl}>Preferred Appointment Date</label><input type="date" value={f.appointmentDate} onChange={e=>setF({...f,appointmentDate:e.target.value})} className={inp} style={ii}/></div>
          <div>
            <label className={lbl}>VFS Center City</label>
            <select value={f.appointmentCenter} onChange={e=>setF({...f,appointmentCenter:e.target.value})} className={inp} style={ii}>
              <option value="">Select city</option>
              {['Mumbai','Delhi','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 text-xs text-indigo-700">
            ℹ️ Processing: 15 working days. Embassy: {country.embassy||'VFS Global'}. Price: ₹{country.price?.toLocaleString()}
          </div>
          <button onClick={()=>m.mutate()} disabled={!f.applicantName||m.isPending}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 shadow-xl">
            {m.isPending?'Submitting...':'Submit Application — ₹'+country.price?.toLocaleString()}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function WeVisaSchengenPage() {
  const [selCountry, setSelCountry] = useState(null)
  const [previewC,   setPreviewC]   = useState(null)
  const {data: appts=[]} = useQuery({queryKey:['wv-sch-appts'], queryFn:()=>wevisaServicesAPI.getSchengenAppointments().then(r=>r.data.data||[])})

  // ── Fetch Schengen packages from admin DB ──
  const {data: adminPackages=[]} = useQuery({
    queryKey: ['schengen-packages'],
    queryFn: () => publicAPI.getPackages({ category:'appointment' }).then(r=>r.data.data||[]).catch(()=>[]),
    staleTime: 60000,
  })

  // Map admin packages to country format; fallback to defaults
  const COUNTRIES = adminPackages.length > 0
    ? adminPackages.map(p => ({
        name:     p.countryName,
        flag:     p.countryFlag || '🇪🇺',
        embassy:  'VFS Global',
        price:    p.price,
        info:     p.description || `${p.countryName} Schengen Visa — ${p.stayDuration} stay, ${p.processingTime} processing`,
        commission: p.commission,
      }))
    : DEFAULT_COUNTRIES

  const preview = previewC || COUNTRIES[0] || DEFAULT_COUNTRIES[0]

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h2 className="font-extrabold text-2xl text-gray-800">🗓️ Schengen Appointments</h2>
        <p className="text-sm text-gray-400">
          Schedule appointments for Schengen visa applications
          {adminPackages.length>0 ? ' · Prices from admin panel' : ' · Default pricing'}
        </p>
      </div>

      {/* Country grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {COUNTRIES.map((c,i)=>(
          <motion.div key={c.name} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*.05}}
            className={`bg-white rounded-2xl border ${preview.name===c.name?'border-indigo-400 shadow-lg':'border-gray-100 shadow-sm'} p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all`}
            onClick={()=>setPreviewC(c)}>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">{c.flag}</span>
              <div className="font-bold text-gray-800 text-sm">{c.name}</div>
            </div>
            <div className="text-xs text-gray-400 mb-3 line-clamp-2">{c.info}</div>
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-indigo-700 text-sm">₹{c.price?.toLocaleString()}</div>
              {c.commission>0&&<div className="text-[10px] text-green-600 font-semibold">₹{c.commission} comm.</div>}
            </div>
            <button onClick={e=>{e.stopPropagation();setSelCountry(c)}}
              className="w-full mt-3 py-1.5 text-xs px-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all">Apply</button>
          </motion.div>
        ))}
      </div>

      {/* Preview panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="font-bold text-gray-800 mb-4">🌍 Country Details</div>
          <select value={preview.name} onChange={e=>setPreviewC(COUNTRIES.find(c=>c.name===e.target.value)||COUNTRIES[0])} className={inp} style={ii}>
            {COUNTRIES.map(c=><option key={c.name}>{c.name}</option>)}
          </select>
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{preview.flag}</span>
              <div className="font-bold text-gray-800">{preview.name}</div>
            </div>
            <p className="text-sm text-gray-500 mb-3">{preview.info}</p>
            <div className="text-xs text-gray-400">Embassy: {preview.embassy}</div>
            {preview.commission>0&&<div className="text-xs text-green-600 font-semibold mt-1">Agent Commission: ₹{preview.commission}</div>}
            <div className="font-extrabold text-indigo-700 text-lg mt-2">₹{preview.price?.toLocaleString()}</div>
          </div>
          <button onClick={()=>setSelCountry(preview)} className="w-full mt-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow">
            Apply for {preview.name} Visa →
          </button>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="font-bold text-gray-800 mb-4">📸 Appointment Process — {preview.name}</div>
          <div className="bg-gray-100 rounded-2xl h-64 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-3">{preview.flag}</span>
            <div className="text-gray-400 font-semibold">{preview.name} Schengen Appointment</div>
            <div className="text-sm text-gray-300 mt-1">Process overview will appear here</div>
            <div className="mt-3 text-xs text-gray-400 px-8">Select a date, upload documents, and submit — our team books the appointment on your behalf.</div>
          </div>
        </div>
      </div>

      {/* My appointments */}
      {appts.length>0&&(
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">📋 My Schengen Appointments ({appts.length})</h3></div>
          <div className="divide-y divide-gray-50">
            {appts.map(a=>(
              <div key={a._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <span className="text-2xl">{COUNTRIES.find(c=>c.name===a.country)?.flag||'🇪🇺'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-800 truncate">{a.applicantName}</div>
                  <div className="text-xs text-gray-400">{a.country} · {a.visaType}</div>
                </div>
                <div className="font-bold text-indigo-700">₹{a.price?.toLocaleString()}</div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${SCLR[a.status]||'bg-blue-100 text-blue-700'}`}>{a.status}</span>
                {a.trackingId&&<div className="text-[10px] text-gray-400 font-mono hidden sm:block">{a.trackingId}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {selCountry&&<AppModal country={selCountry} onClose={()=>setSelCountry(null)}/>}
    </div>
  )
}

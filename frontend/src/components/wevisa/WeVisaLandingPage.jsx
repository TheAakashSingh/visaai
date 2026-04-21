// src/components/wevisa/WeVisaLandingPage.jsx — 100% DYNAMIC from Admin Panel
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { publicAPI } from '@/services/wevisaApi'

// ── Static fallback data (only shown while loading / DB empty) ──
const FALLBACK_EXPRESS = [
  { countryFlag:'🇦🇪', countryName:'Dubai',     visaType:'Tourist', processingTime:'4 Hours',  stayDuration:'30 Days', price:2499, isExpress:true },
  { countryFlag:'🇸🇬', countryName:'Singapore', visaType:'Tourist', processingTime:'24 Hours', stayDuration:'30 Days', price:3999, isExpress:true },
  { countryFlag:'🇻🇳', countryName:'Vietnam',   visaType:'Tourist', processingTime:'2 Hours',  stayDuration:'30 Days', price:1499, isExpress:true },
  { countryFlag:'🇮🇩', countryName:'Bali',      visaType:'Tourist', processingTime:'24 Hours', stayDuration:'30 Days', price:2999, isExpress:true },
  { countryFlag:'🇹🇷', countryName:'Turkey',    visaType:'Tourist', processingTime:'24 Hours', stayDuration:'90 Days', price:3499, isExpress:true },
]
const FALLBACK_COUNTRIES = [
  { flag:'🇦🇪', name:'UAE',         region:'Middle East' },
  { flag:'🇸🇬', name:'Singapore',   region:'Asia' },
  { flag:'🇺🇸', name:'USA',         region:'Americas' },
  { flag:'🇨🇦', name:'Canada',      region:'Americas' },
  { flag:'🇬🇧', name:'UK',          region:'Europe' },
  { flag:'🇦🇺', name:'Australia',   region:'Oceania' },
  { flag:'🇩🇪', name:'Germany',     region:'Europe' },
  { flag:'🇫🇷', name:'France',      region:'Europe' },
  { flag:'🇹🇭', name:'Thailand',    region:'Asia' },
  { flag:'🇲🇾', name:'Malaysia',    region:'Asia' },
  { flag:'🇻🇳', name:'Vietnam',     region:'Asia' },
  { flag:'🇹🇷', name:'Turkey',      region:'Middle East' },
]
const TESTIMONIALS = [
  { name:'Rajiv Sharma',  city:'Mumbai',    years:3, text:'WeVisa has transformed our business. Express Dubai visa in just 4 hours — clients love it!', avatar:'RS' },
  { name:'Priya Patel',   city:'Delhi',     years:2, text:'Singapore packages up 40% since joining. The 24-hour visa is a total game-changer.',          avatar:'PP' },
  { name:'Anand Gupta',   city:'Bangalore', years:1, text:'Luxury Maldives packages are now effortless. WeVisa handles all documentation perfectly.',    avatar:'AG' },
  { name:'Farhan Khan',   city:'Hyderabad', years:4, text:'4-hour Dubai visa lets us offer same-day travel options. Absolutely revolutionary!',           avatar:'FK' },
  { name:'Meera Reddy',   city:'Chennai',   years:3, text:'Platform makes tracking applications so simple. Singapore tours are our bestsellers now.',     avatar:'MR' },
  { name:'Kavita Singh',  city:'Pune',      years:1, text:'2-hour Vietnam visa is unbelievable! Clients amazed by the speed and efficiency.',             avatar:'KS' },
]
const TOOLS = [
  { icon:'📊', title:'CRM Dashboard',         desc:'Manage leads, deals, and customer relationships.' },
  { icon:'🧾', title:'Invoice Generator',      desc:'GST-compliant professional invoices instantly.' },
  { icon:'📅', title:'USA Early Appointment',  desc:'Book early US visa appointment slots.' },
  { icon:'🎫', title:'Dummy Tickets',          desc:'Generate dummy flight tickets in seconds.' },
  { icon:'🗓️', title:'Schengen Appointments',  desc:'Schengen visa appointments across Europe.' },
  { icon:'🎨', title:'Flyer Designer',         desc:'Design professional marketing flyers.' },
  { icon:'📱', title:'International SIM Cards',desc:'Stay connected worldwide.' },
]
const STATS_HERO = [
  { value:'₹500+', label:'Per Visa Commission' },
  { value:'1000+', label:'Partner Agents' },
  { value:'100+',  label:'Countries' },
  { value:'24/7',  label:'Support' },
]

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/wevisa">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-extrabold text-sm shadow">W</div>
            <span className="font-extrabold text-xl text-blue-900">We<span className="text-orange-500">Visa</span></span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
          {['Visa Services','Business Services','Travel Services'].map(l => (
            <button key={l} className="hover:text-blue-600 transition-colors flex items-center gap-1">{l} <span className="text-[10px]">▾</span></button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/wevisa/login"><button className="px-5 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all">Agent Login</button></Link>
          <Link to="/wevisa/register"><button className="px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all shadow">Become a Partner</button></Link>
        </div>
        <button onClick={() => setOpen(v => !v)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          {['Visa Services','Business Services','Travel Services'].map(l => (
            <div key={l} className="py-2 text-sm font-medium text-gray-600 border-b border-gray-50">{l}</div>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/wevisa/login" onClick={() => setOpen(false)}><button className="w-full py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700">Agent Login</button></Link>
            <Link to="/wevisa/register" onClick={() => setOpen(false)}><button className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold">Become a Partner</button></Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ── Package Card ──────────────────────────────────────────────
function PackageCard({ pkg, idx }) {
  return (
    <motion.div key={pkg._id || idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
      className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all group">
      {pkg.isExpress && <div className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold w-fit mb-2">🔥 EXPRESS</div>}
      <div className="text-3xl mb-3">{pkg.countryFlag || pkg.flag || '🌍'}</div>
      <div className="font-extrabold text-gray-800 mb-3">{pkg.countryName || pkg.country}</div>
      <div className="space-y-1.5 text-xs text-gray-500 mb-4">
        <div className="flex justify-between"><span>Visa Type</span><span className="font-semibold text-gray-700">{pkg.visaType}</span></div>
        <div className="flex justify-between"><span>Processing</span><span className="font-bold text-green-600">{pkg.processingTime}</span></div>
        <div className="flex justify-between"><span>Stay</span><span className="font-semibold text-gray-700">{pkg.stayDuration}</span></div>
        {pkg.price && <div className="flex justify-between border-t border-gray-100 pt-1.5"><span>Starting from</span><span className="font-extrabold text-blue-700">₹{pkg.price.toLocaleString()}</span></div>}
        {pkg.commission > 0 && <div className="flex justify-between"><span>Your Commission</span><span className="font-bold text-green-600">₹{pkg.commission}</span></div>}
      </div>
      <Link to="/wevisa/login">
        <button className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all group-hover:shadow-md">Apply Now →</button>
      </Link>
    </motion.div>
  )
}

// ── Country Card ──────────────────────────────────────────────
function CountryCard({ country, idx }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
      <span className="text-2xl flex-shrink-0">{country.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-gray-800 truncate">{country.name}</div>
        <div className="text-[10px] text-gray-400">{country.region}</div>
      </div>
      {country.isFeatured && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-600 font-bold flex-shrink-0">⭐</span>}
    </motion.div>
  )
}

// ── Main Landing Page ─────────────────────────────────────────
export default function WeVisaLandingPage() {
  // ── All data fetched from admin DB dynamically ──
  const { data: expressPackages } = useQuery({
    queryKey: ['landing-express'],
    queryFn:  () => publicAPI.getPackages({ isExpress: 'true', limit: 8 }).then(r => r.data.data || []).catch(() => []),
    placeholderData: FALLBACK_EXPRESS,
    staleTime: 60000,
  })

  const { data: allPackages } = useQuery({
    queryKey: ['landing-all-packages'],
    queryFn:  () => publicAPI.getPackages({ limit: 50 }).then(r => r.data.data || []).catch(() => []),
    placeholderData: [],
    staleTime: 60000,
  })

  const { data: countries } = useQuery({
    queryKey: ['landing-countries'],
    queryFn:  () => publicAPI.getCountries({ limit: 50 }).then(r => r.data.data || []).catch(() => []),
    placeholderData: FALLBACK_COUNTRIES,
    staleTime: 60000,
  })

  const { data: usaPricing } = useQuery({
    queryKey: ['landing-usa-pricing'],
    queryFn:  () => publicAPI.getUSAPricing().then(r => r.data.data).catch(() => ({ pan_india: 35000, state_specific: 25000, city_specific: 20000, discount: '15% OFF' })),
    staleTime: 300000,
  })

  const { data: ticketPricing } = useQuery({
    queryKey: ['landing-ticket-pricing'],
    queryFn:  () => publicAPI.getDummyTicketPricing().then(r => r.data.data).catch(() => ({ price: 299 })),
    staleTime: 300000,
  })

  // Use DB data; fallback if empty
  const expressToShow   = (expressPackages?.length ? expressPackages : FALLBACK_EXPRESS).slice(0, 8)
  const countriesShow   = countries?.length ? countries : FALLBACK_COUNTRIES
  const schengenPackages= allPackages?.filter(p => p.category === 'appointment' || p.visaType?.toLowerCase().includes('schengen')) || []
  const stickerPackages = allPackages?.filter(p => p.category === 'sticker') || []

  return (
    <div className="wv-root min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-20 translate-x-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full translate-y-20 -translate-x-10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              India's #1 B2B Visa Platform for Travel Agents
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-3xl">
              Partner with India's Leading B2B Visa Platform
            </h1>
            <p className="text-blue-100 text-base sm:text-xl mb-8 max-w-2xl">
              Exclusively for Travel Agents & Agencies — Process visas efficiently and grow your business with competitive commissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/wevisa/register">
                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 text-white font-extrabold text-base hover:bg-orange-600 transition-all shadow-xl">🚀 Become a Partner Agent</button>
              </Link>
              <Link to="/wevisa/login">
                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 border border-white/30 text-white font-bold text-base hover:bg-white/20 transition-all backdrop-blur-sm">🔑 Agent Login</button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS_HERO.map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold">{s.value}</div>
                  <div className="text-blue-200 text-xs sm:text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── EXPRESS VISAS — Dynamic from Admin ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-yellow-600 font-bold text-sm mb-3"><span>⚡</span> Express Processing</div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-3">Express Visas for Your Clients</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Prices and processing times updated live from admin panel. Always accurate, always fresh.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {expressToShow.map((pkg, i) => <PackageCard key={pkg._id || i} pkg={pkg} idx={i} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/wevisa/login">
              <button className="px-6 py-3 rounded-2xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all">
                View All {countriesShow.length}+ Countries →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ALL COUNTRIES — Dynamic ── */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">🌍 Destinations</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Countries We Serve</h2>
              <p className="text-gray-500 text-sm mt-1">All countries & pricing managed by admin — always up to date.</p>
            </div>
            <div className="text-xs text-gray-400 font-mono">{countriesShow.length} countries available</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {countriesShow.map((c, i) => <CountryCard key={c._id || i} country={c} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ── STICKER VISAS — Dynamic ── */}
      {stickerPackages.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">📌 Sticker Visas</div>
              <h2 className="text-2xl font-extrabold text-gray-900">Embassy Sticker Visas</h2>
              <p className="text-gray-500 text-sm mt-1">Canada, UK, Australia and more — packages set by admin.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {stickerPackages.slice(0, 8).map((pkg, i) => <PackageCard key={pkg._id || i} pkg={pkg} idx={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── USA APPOINTMENT — Dynamic pricing from admin ── */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            {usaPricing?.discount && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-bold mb-4">
                🏷️ {usaPricing.discount}
              </div>
            )}
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">🇺🇸 USA Early Appointment</h2>
            <p className="text-blue-200 max-w-xl mx-auto">{usaPricing?.description || 'Priority slot booking for USA visa appointments'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { key:'pan_india',      label:'Pan India',      sub:'All major cities, multiple VFS centers', icon:'🏙️' },
              { key:'state_specific', label:'State Specific',  sub:'Choose your preferred state',           icon:'📍' },
              { key:'city_specific',  label:'City Specific',   sub:'Book for your exact city',              icon:'🏢' },
            ].map(opt => (
              <div key={opt.key} className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                <div className="text-3xl mb-3">{opt.icon}</div>
                <div className="font-extrabold text-xl mb-1">{opt.label}</div>
                <div className="text-blue-200 text-sm mb-4">{opt.sub}</div>
                <div className="text-3xl font-extrabold mb-4">₹{(usaPricing?.[opt.key] || 0).toLocaleString()}</div>
                <Link to="/wevisa/login">
                  <button className="w-full py-2.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-all text-sm">Book Now →</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHENGEN — Dynamic ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-3">🇪🇺 Schengen Appointments</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Book appointment slots for Schengen countries — fees & availability updated by admin.</p>
          </div>
          {schengenPackages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {schengenPackages.slice(0, 8).map((pkg, i) => <PackageCard key={pkg._id || i} pkg={pkg} idx={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {['🇫🇷 France','🇩🇪 Germany','🇮🇹 Italy','🇪🇸 Spain','🇳🇱 Netherlands','🇨🇭 Switzerland','🇵🇹 Portugal','🇬🇷 Greece','🇦🇹 Austria','🇧🇪 Belgium','🇨🇿 Czech','🇵🇱 Poland'].map((c, i) => {
                const [flag, ...nameParts] = c.split(' ')
                return (
                  <Link to="/wevisa/login" key={c}>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                      <span className="text-xl">{flag}</span>
                      <span className="text-xs font-bold text-gray-700">{nameParts.join(' ')}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/wevisa/login">
              <button className="px-6 py-3 rounded-2xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all">Book Schengen Appointment →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── DUMMY TICKET — Dynamic price ── */}
      <section className="py-12 bg-gradient-to-r from-pink-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-extrabold text-2xl sm:text-3xl mb-1">🎫 Dummy Tickets — ₹{ticketPricing?.price || 299} Only</div>
            <p className="text-pink-100">{ticketPricing?.description || 'Valid for 30 days. For visa application reference only.'}</p>
          </div>
          <Link to="/wevisa/login" className="flex-shrink-0">
            <button className="px-8 py-4 rounded-2xl bg-white text-pink-600 font-extrabold hover:bg-pink-50 transition-all shadow-xl w-full sm:w-auto">Generate Now →</button>
          </Link>
        </div>
      </section>

      {/* ── BUSINESS TOOLS ── */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-3">Business Tools for Travel Agents</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Complete toolkit — CRM, invoicing, appointments and more in one dashboard.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOOLS.map((t, i) => (
              <motion.div key={t.title} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all group">
                <div className="text-4xl mb-4">{t.icon}</div>
                <div className="font-extrabold text-gray-800 mb-2">{t.title}</div>
                <p className="text-sm text-gray-500 mb-4">{t.desc}</p>
                <Link to="/wevisa/login">
                  <button className="text-blue-600 text-sm font-bold group-hover:underline flex items-center gap-1">Get Started <span>→</span></button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WEVISA ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-3">Why Travel Agents Choose WeVisa</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Join 1000+ travel agent partners across India.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {[
              { icon:'⚡', title:'Lightning Fast Processing',  desc:'Dubai in 4 hrs, Vietnam in 2 hrs. Fastest in the industry.' },
              { icon:'💰', title:'Competitive Commissions',    desc:'Earn ₹500+ per visa. Monthly payouts, no delays.' },
              { icon:'🛡️', title:'100% Secure Platform',      desc:'Bank-grade security. All data encrypted and protected.' },
              { icon:'📞', title:'24/7 Expert Support',       desc:'Dedicated support team available around the clock.' },
              { icon:'🌍', title:'100+ Countries',             desc:'Process visas for over 100 countries worldwide.' },
              { icon:'📱', title:'Easy Dashboard',             desc:'Intuitive agent portal. Manage everything in one place.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4 p-5 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div><div className="font-bold text-gray-800 mb-1">{f.title}</div><p className="text-sm text-gray-500">{f.desc}</p></div>
              </div>
            ))}
          </div>
          <h3 className="text-xl font-extrabold text-gray-800 text-center mb-6">💬 What Our Partners Say</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{t.avatar}</div>
                  <div>
                    <div className="font-bold text-sm text-gray-800">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.city} · Partner {t.years}yr{t.years > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
                <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-1">Ready to Grow Your Agency?</h3>
            <p className="text-orange-100">Join 1000+ travel agents earning more with WeVisa today.</p>
          </div>
          <Link to="/wevisa/register">
            <button className="px-8 py-4 rounded-2xl bg-white text-orange-600 font-extrabold hover:bg-orange-50 transition-all shadow-xl w-full sm:w-auto">Get Started Free →</button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-extrabold text-sm">W</div>
                <span className="font-extrabold text-xl">We<span className="text-orange-400">Visa</span></span>
              </div>
              <p className="text-blue-300 text-sm">Your trusted B2B partner for visa services — exclusively for travel agents and agencies.</p>
            </div>
            <div>
              <div className="font-bold mb-4 text-sm uppercase tracking-widest text-blue-300">For Agents</div>
              <div className="space-y-2 text-sm text-blue-200">
                {['Become a Partner','Agent Login','Countries We Serve','CRM Dashboard'].map(l => (
                  <div key={l} className="hover:text-white cursor-pointer transition-colors">{l}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-sm uppercase tracking-widest text-blue-300">Support</div>
              <div className="space-y-2 text-sm text-blue-200">
                {['Agent Help Center','Contact Support','Commission Structure','Track Applications'].map(l => (
                  <div key={l} className="hover:text-white cursor-pointer transition-colors">{l}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-sm uppercase tracking-widest text-blue-300">Contact Us</div>
              <div className="space-y-2 text-sm text-blue-200">
                <div>Western Entertainers LLP</div>
                <div>contact@wevisa.com</div>
                <div>+91 XXXXXXXXXX</div>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-400">
            <div>© 2026 WeVisa. All rights reserved. Powered by Western Entertainers LLP</div>
            <div className="flex gap-4">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// src/components/wevisa/WeVisaLandingPage.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

/* ─── Data ─────────────────────────────────────────────────── */
const DESTINATIONS = ['Dubai', 'Singapore', 'USA', 'Thailand', 'Malaysia', 'Canada', 'UK', 'Australia', 'Vietnam', 'Bali']

const TRENDING = [
  { name: 'Dubai', flag: '🇦🇪', count: '200K+', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', price: '₹236', processing: '4 Hours' },
  { name: 'Vietnam', flag: '🇻🇳', count: '74K+', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80', price: '₹899', processing: '2 Hours' },
  { name: 'USA', flag: '🇺🇸', count: '61K+', img: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&q=80', price: 'On Request', processing: '14 Days' },
  { name: 'Singapore', flag: '🇸🇬', count: '84K+', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80', price: '₹1,450', processing: '24 Hours' },
  { name: 'Australia', flag: '🇦🇺', count: '52K+', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80', price: '₹5,200', processing: '15 Days' },
]

const EXPRESS = [
  { country: 'Dubai', flag: '🇦🇪', processing: '4 Hours', stay: '30 Days', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=75' },
  { country: 'Singapore', flag: '🇸🇬', processing: '24 Hours', stay: '30 Days', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=75' },
  { country: 'Vietnam', flag: '🇻🇳', processing: '2 Hours', stay: '30 Days', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=75' },
  { country: 'Bali', flag: '🇮🇩', processing: '24 Hours', stay: '30 Days', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=75' },
  { country: 'Turkey', flag: '🇹🇷', processing: '24 Hours', stay: '90 Days', img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&q=75' },
  { country: 'Thailand', flag: '🇹🇭', processing: '12 Hours', stay: '60 Days', img: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=400&q=75' },
]

const TOOLS = [
  { icon: '📊', title: 'CRM Dashboard', desc: 'Manage clients, leads & operations from one place', path: '/wevisa/crm' },
  { icon: '🧾', title: 'Invoice Generator', desc: 'GST-compliant invoices for visa & travel services', path: '/wevisa/invoice' },
  { icon: '📅', title: 'USA Early Appointment', desc: 'Book early slots for US visa applications', path: '/wevisa/usa-appointment' },
  { icon: '🎫', title: 'Dummy Tickets', desc: 'Instant dummy flight tickets for visa submissions', path: '/wevisa/dummy-tickets' },
  { icon: '🗓️', title: 'Schengen Appointments', desc: 'Schedule appointments across European countries', path: '/wevisa/schengen' },
  { icon: '🎨', title: 'Flyer Designer', desc: 'Create marketing flyers for your agency', path: '/wevisa/dashboard' },
  { icon: '📱', title: 'International SIM', desc: 'Global SIM cards for your traveling clients', path: '/wevisa/dashboard' },
  { icon: '📈', title: 'Analytics', desc: 'Track performance and commission earnings', path: '/wevisa/dashboard' },
]

const TESTIMONIALS = [
  { name: 'Rajiv Sharma', city: 'Mumbai', years: 3, text: 'WeVisa transformed our agency. Dubai approvals in 4 hours is truly incredible for our clients!' },
  { name: 'Priya Patel', city: 'Delhi', years: 2, text: 'Singapore bookings up 40% since we partnered. The 24-hour processing is a genuine game-changer.' },
  { name: 'Anand Gupta', city: 'Bangalore', years: 1, text: 'Luxury Maldives packages are now so much easier to sell. Clients love the hassle-free experience.' },
  { name: 'Lakshmi Nair', city: 'Kochi', years: 2, text: 'WeVisa helps bring international tourists to Kerala with truly minimal visa hassle for everyone.' },
  { name: 'Suresh Kumar', city: 'Chennai', years: 2, text: 'Best B2B platform in India. CRM tools and invoice system help us manage clients like pros.' },
  { name: 'Meera Joshi', city: 'Pune', years: 1, text: 'Earning great commission on every visa. The agent dashboard makes tracking so simple and clear.' },
]

const NEWS = [
  { date: 'Apr 16, 2026', title: 'New Visa Rules for Schengen Countries in 2026', desc: 'Important changes to processing times and requirements every agent should know.', tags: ['Schengen', 'Europe'], img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=500&q=75' },
  { date: 'Apr 15, 2026', title: 'Top 10 Documents Needed for US Tourist Visa', desc: 'A comprehensive checklist for your clients B1/B2 visa interviews.', tags: ['USA', 'Documents'], img: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=500&q=75' },
  { date: 'Apr 14, 2026', title: 'How to Track Your Visa Application Status', desc: 'Step-by-step guide using our platform to keep clients updated in real time.', tags: ['Guide', 'Tips'], img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&q=75' },
]

const NAV_TABS = [
  { icon: '🛂', label: 'Visa' },
  { icon: '🎓', label: 'Student Visa' },
  { icon: '🛡️', label: 'Travel Insurance' },
  { icon: '✈️', label: 'OTB' },
]

function Avatar({ name, size = 42 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
  const cols = ['#1C3FAA','#0D7377','#8B2FC9','#C0392B','#1E8449','#2471A3']
  const bg = cols[name.charCodeAt(0) % cols.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export default function WeVisaLandingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [searchVal, setSearchVal] = useState('')
  const [sugg, setSugg] = useState([])
  const [destIdx, setDestIdx] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setDestIdx(i => (i + 1) % DESTINATIONS.length), 2400)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const handleSearch = v => {
    setSearchVal(v)
    setSugg(v ? DESTINATIONS.filter(d => d.toLowerCase().includes(v.toLowerCase())) : [])
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --cream: #F4EFE6;
          --cream2: #EDE8DF;
          --navy: #0F0A2E;
          --navy2: #1A1445;
          --accent: #2318A8;
          --accent2: #3D30CC;
          --orange: #F07A20;
          --white: #FFFFFF;
          --t1: #0F0A2E;
          --t2: #433E6B;
          --muted: #8A86A5;
          --border: rgba(15,10,46,0.1);
          --sh-sm: 0 2px 12px rgba(15,10,46,0.06);
          --sh-md: 0 8px 36px rgba(15,10,46,0.13);
          --sh-lg: 0 20px 72px rgba(15,10,46,0.2);
          --pill: 100px;
          --f: 'Plus Jakarta Sans', sans-serif;
        }
        html { scroll-behavior: smooth; }
        body { font-family: var(--f); background: var(--cream); color: var(--t1); -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }
        button, input { font-family: var(--f); }
        a { text-decoration: none; color: inherit; }

        /* NAV */
        .nav { position: sticky; top: 0; z-index: 200; background: var(--cream); transition: box-shadow .3s; }
        .nav.up { box-shadow: 0 2px 20px rgba(15,10,46,0.08); }
        .nav-i { max-width: 1300px; margin: 0 auto; padding: 0 32px; height: 70px; display: flex; align-items: center; gap: 20px; }
        .logo { font-weight: 800; font-size: 22px; letter-spacing: -.5px; color: var(--navy); }
        .logo span { color: var(--accent); }
        .tabs { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center; }
        .tab { display: flex; align-items: center; gap: 8px; padding: 10px 22px; border-radius: var(--pill); border: 1.5px solid var(--border); background: var(--white); font-size: 14px; font-weight: 600; color: var(--t2); cursor: pointer; transition: all .2s; white-space: nowrap; }
        .tab:hover, .tab.on { border-color: var(--accent); color: var(--accent); background: rgba(35,24,168,.05); }
        .tab-ic { font-size: 17px; }
        .nr { display: flex; align-items: center; gap: 20px; white-space: nowrap; }
        .nl { font-size: 14px; font-weight: 600; color: var(--t2); background: none; border: none; cursor: pointer; transition: color .2s; }
        .nl:hover { color: var(--navy); }
        .ndiv { width: 1px; height: 20px; background: var(--border); }
        .btn-login { font-size: 14px; font-weight: 600; color: var(--t2); background: none; border: none; cursor: pointer; transition: color .2s; }
        .btn-login:hover { color: var(--navy); }
        .btn-reg { padding: 10px 22px; border-radius: var(--pill); background: var(--orange); color: #fff; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 14px rgba(240,122,32,.3); }
        .btn-reg:hover { background: #d96d18; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(240,122,32,.4); }

        /* SEARCH */
        .srch-wrap { max-width: 1300px; margin: 0 auto; padding: 28px 32px 0; position: relative; }
        .srch-bar { display: flex; align-items: center; gap: 0; background: var(--white); border-radius: var(--pill); border: 1.5px solid var(--border); box-shadow: var(--sh-sm); padding: 6px 6px 6px 26px; transition: box-shadow .2s, border-color .2s; }
        .srch-bar:focus-within { box-shadow: var(--sh-md); border-color: rgba(35,24,168,.28); }
        .srch-inp { flex: 1; border: none; outline: none; background: transparent; font-size: 15px; font-weight: 400; color: var(--t1); }
        .srch-inp::placeholder { color: var(--muted); }
        .srch-btn { width: 46px; height: 46px; border-radius: 50%; background: var(--accent); border: none; color: #fff; font-size: 17px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all .2s; }
        .srch-btn:hover { background: var(--accent2); transform: scale(1.05); }
        .exp-btn { padding: 12px 30px; border-radius: var(--pill); border: 2px solid var(--navy); background: transparent; font-size: 14px; font-weight: 700; color: var(--navy); margin-left: 12px; cursor: pointer; transition: all .2s; white-space: nowrap; flex-shrink: 0; position: relative; }
        .exp-btn::before { content: '✦'; position: absolute; top: -3px; right: -2px; font-size: 11px; color: var(--accent); }
        .exp-btn:hover { background: var(--navy); color: #fff; }
        .sugg { position: absolute; top: calc(100% + 6px); left: 32px; right: 32px; background: #fff; border-radius: 16px; box-shadow: var(--sh-md); border: 1px solid var(--border); overflow: hidden; z-index: 500; }
        .sugg-i { padding: 12px 22px; font-size: 14px; font-weight: 500; color: var(--t2); cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background .15s; }
        .sugg-i:hover { background: var(--cream); }

        /* HERO HEADLINE */
        .hero { max-width: 1300px; margin: 0 auto; padding: 44px 32px 52px; text-align: center; }
        .hero h1 { font-size: clamp(36px, 4.5vw, 58px); font-weight: 800; color: var(--navy); letter-spacing: -1.8px; line-height: 1.1; margin-bottom: 14px; }
        .hero h1 .dest { color: var(--accent); display: inline-block; }
        .hero-sub { font-size: 17px; color: var(--t2); font-weight: 400; }
        .hero-sub b { color: var(--navy); font-weight: 800; }

        /* SECTION */
        .sec { padding: 64px 32px; }
        .sec-i { max-width: 1300px; margin: 0 auto; }
        .bg2 { background: var(--cream2); }
        .sec-hd { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; }
        .sec-ttl { font-size: 26px; font-weight: 800; color: var(--navy); letter-spacing: -.5px; }
        .sec-eye { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.8px; color: var(--accent); margin-bottom: 8px; }
        .sec-lnk { font-size: 13px; font-weight: 700; color: var(--accent); background: none; border: none; cursor: pointer; transition: opacity .2s; }
        .sec-lnk:hover { opacity: .65; }

        /* TRENDING */
        .tr-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .tr-card { border-radius: 22px; overflow: hidden; aspect-ratio: 3/4; position: relative; cursor: pointer; transition: transform .3s, box-shadow .3s; }
        .tr-card:hover { transform: translateY(-7px); box-shadow: var(--sh-lg); }
        .tr-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s; }
        .tr-card:hover .tr-img { transform: scale(1.07); }
        .tr-ovl { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 38%, rgba(8,5,30,.88) 100%); }
        .tr-badge { position: absolute; top: 14px; left: 14px; background: rgba(255,255,255,.17); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.24); border-radius: var(--pill); padding: 6px 14px; font-size: 12px; font-weight: 700; color: #fff; }
        .tr-btm { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; }
        .tr-name { font-size: 21px; font-weight: 800; color: #fff; letter-spacing: -.3px; margin-bottom: 6px; }
        .tr-row { display: flex; align-items: center; justify-content: space-between; }
        .tr-price { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.9); }
        .tr-proc { font-size: 11px; font-weight: 700; color: #3DFFAA; background: rgba(0,180,90,.22); padding: 3px 10px; border-radius: var(--pill); }
        .tr-apply { width: 100%; margin-top: 10px; padding: 9px; border-radius: 9px; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.14); backdrop-filter: blur(8px); font-family: var(--f); font-size: 12px; font-weight: 700; color: #fff; cursor: pointer; transition: background .2s; }
        .tr-apply:hover { background: rgba(255,255,255,.26); }

        /* EXPRESS */
        .ex-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
        .ex-card { border-radius: 18px; overflow: hidden; aspect-ratio: 2/3; position: relative; cursor: pointer; transition: all .25s; }
        .ex-card:hover { transform: translateY(-5px); box-shadow: var(--sh-md); }
        .ex-img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; display: block; }
        .ex-card:hover .ex-img { transform: scale(1.07); }
        .ex-ovl { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 28%, rgba(8,5,30,.92) 100%); }
        .ex-con { position: absolute; bottom: 0; left: 0; right: 0; padding: 14px; }
        .ex-fl { font-size: 22px; margin-bottom: 6px; display: block; }
        .ex-nm { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 7px; }
        .ex-pr { font-size: 11px; font-weight: 700; color: #3DFFAA; margin-bottom: 3px; }
        .ex-st { font-size: 11px; color: rgba(255,255,255,.6); }

        /* WHY STATS */
        .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .why-card { background: var(--white); border-radius: 20px; padding: 30px 24px; border: 1.5px solid var(--border); text-align: center; transition: all .25s; }
        .why-card:hover { box-shadow: var(--sh-md); transform: translateY(-3px); }
        .why-ic { font-size: 34px; margin-bottom: 12px; display: block; }
        .why-val { font-size: 34px; font-weight: 800; color: var(--accent); letter-spacing: -1.2px; margin-bottom: 4px; }
        .why-lbl { font-size: 13px; font-weight: 600; color: var(--t2); }

        /* TOOLS */
        .tl-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .tl-card { background: var(--white); border-radius: 18px; padding: 24px; border: 1.5px solid var(--border); cursor: pointer; transition: all .25s; }
        .tl-card:hover { box-shadow: var(--sh-md); border-color: rgba(35,24,168,.2); transform: translateY(-2px); }
        .tl-ic { font-size: 28px; margin-bottom: 13px; display: block; }
        .tl-ttl { font-size: 15px; font-weight: 800; color: var(--navy); margin-bottom: 7px; letter-spacing: -.2px; }
        .tl-desc { font-size: 13px; color: var(--t2); line-height: 1.65; margin-bottom: 14px; }
        .tl-cta { font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: .3px; }

        /* TESTIMONIALS */
        .ts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .ts-card { background: var(--white); border-radius: 20px; padding: 26px; border: 1.5px solid var(--border); transition: all .25s; }
        .ts-card:hover { box-shadow: var(--sh-md); }
        .ts-hd { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .ts-nm { font-size: 14px; font-weight: 700; color: var(--navy); }
        .ts-mt { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .ts-stars { color: #F59E0B; font-size: 13px; letter-spacing: 1px; margin-bottom: 10px; }
        .ts-txt { font-size: 13px; color: var(--t2); line-height: 1.75; font-style: italic; }

        /* NEWS */
        .nw-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .nw-card { background: var(--white); border-radius: 20px; overflow: hidden; border: 1.5px solid var(--border); cursor: pointer; transition: all .25s; }
        .nw-card:hover { box-shadow: var(--sh-md); transform: translateY(-3px); }
        .nw-imgw { overflow: hidden; }
        .nw-img { width: 100%; height: 188px; object-fit: cover; display: block; transition: transform .4s; }
        .nw-card:hover .nw-img { transform: scale(1.04); }
        .nw-body { padding: 20px; }
        .nw-dt { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 9px; }
        .nw-ttl { font-size: 16px; font-weight: 800; color: var(--navy); line-height: 1.38; margin-bottom: 8px; letter-spacing: -.3px; }
        .nw-desc { font-size: 13px; color: var(--t2); line-height: 1.65; margin-bottom: 14px; }
        .nw-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .nw-tag { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: var(--pill); background: rgba(35,24,168,.07); color: var(--accent); }

        /* CTA BANNER */
        .cta-box { background: var(--navy); border-radius: 28px; padding: 64px 56px; display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center; position: relative; overflow: hidden; }
        .cta-box::before { content: ''; position: absolute; width: 560px; height: 560px; border-radius: 50%; background: radial-gradient(circle, rgba(43,31,168,.5) 0%, transparent 65%); top: -240px; right: -80px; pointer-events: none; }
        .cta-box::after { content: ''; position: absolute; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(240,122,32,.22) 0%, transparent 70%); bottom: -80px; left: 220px; pointer-events: none; }
        .cta-eye { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,.45); margin-bottom: 16px; }
        .cta-ttl { font-size: 40px; font-weight: 800; color: #fff; letter-spacing: -1.4px; line-height: 1.15; margin-bottom: 12px; }
        .cta-sub { font-size: 15px; color: rgba(255,255,255,.48); line-height: 1.7; }
        .cta-acts { display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; }
        .btn-cp { padding: 16px 38px; border-radius: var(--pill); border: none; background: var(--accent2); color: #fff; font-family: var(--f); font-size: 14px; font-weight: 700; white-space: nowrap; cursor: pointer; transition: all .2s; box-shadow: 0 4px 20px rgba(43,31,168,.4); }
        .btn-cp:hover { background: #5045e0; transform: translateY(-2px); }
        .btn-cg { padding: 14px 38px; border-radius: var(--pill); border: 1.5px solid rgba(255,255,255,.2); background: transparent; color: #fff; font-family: var(--f); font-size: 14px; font-weight: 600; white-space: nowrap; cursor: pointer; transition: all .2s; }
        .btn-cg:hover { border-color: rgba(255,255,255,.42); background: rgba(255,255,255,.06); }

        /* FOOTER */
        .ft { background: var(--navy2); padding: 72px 32px 32px; }
        .ft-i { max-width: 1300px; margin: 0 auto; }
        .ft-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 52px; margin-bottom: 52px; }
        .ft-logo { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -.5px; margin-bottom: 14px; }
        .ft-logo span { color: #7B8FFF; }
        .ft-about { font-size: 13px; color: rgba(255,255,255,.38); line-height: 1.85; max-width: 255px; }
        .ft-ctitle { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.45); margin-bottom: 20px; }
        .ft-link { display: block; font-size: 13px; color: rgba(255,255,255,.42); margin-bottom: 13px; cursor: pointer; transition: color .2s; }
        .ft-link:hover { color: #fff; }
        .ft-bot { border-top: 1px solid rgba(255,255,255,.07); padding-top: 24px; display: flex; align-items: center; justify-content: space-between; }
        .ft-copy { font-size: 12px; color: rgba(255,255,255,.28); }
        .ft-badges { display: flex; gap: 10px; }
        .ft-badge { font-size: 11px; font-weight: 600; padding: 5px 14px; border-radius: var(--pill); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.32); }

        /* MORE LINK */
        .more { text-align: center; margin-top: 32px; }
        .more button { background: none; border: none; font-family: var(--f); font-size: 13px; font-weight: 700; color: var(--accent); cursor: pointer; transition: opacity .2s; }
        .more button:hover { opacity: .65; }

        @media (max-width: 1080px) {
          .tr-grid { grid-template-columns: repeat(3, 1fr); }
          .ex-grid { grid-template-columns: repeat(3, 1fr); }
          .tl-grid { grid-template-columns: repeat(2, 1fr); }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
          .ts-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .tabs { display: none; }
          .tr-grid { grid-template-columns: repeat(2, 1fr); }
          .ts-grid { grid-template-columns: 1fr; }
          .nw-grid { grid-template-columns: 1fr; }
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .cta-box { grid-template-columns: 1fr; }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' up' : ''}`}>
        <div className="nav-i">
          <Link to="/wevisa"><span className="logo">We<span>Visa</span></span></Link>
          <div className="tabs">
            {NAV_TABS.map((t, i) => (
              <button key={t.label} className={`tab${activeTab === i ? ' on' : ''}`} onClick={() => setActiveTab(i)}>
                <span className="tab-ic">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <div className="nr">
            <button className="nl">For Business</button>
            <div className="ndiv" />
            <Link to="/wevisa/login"><button className="btn-login">Log In</button></Link>
            <Link to="/wevisa/register"><button className="btn-reg">Become a Partner</button></Link>
          </div>
        </div>
      </nav>

      {/* SEARCH */}
      <div style={{ background: 'var(--cream)', paddingTop: 28 }}>
        <div className="srch-wrap">
          <motion.div className="srch-bar" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <input className="srch-inp" placeholder="Search Destination" value={searchVal} onChange={e => handleSearch(e.target.value)} />
            <button className="srch-btn">🔍</button>
            <Link to="/wevisa/apply"><button className="exp-btn">Explore</button></Link>
          </motion.div>
          <AnimatePresence>
            {sugg.length > 0 && (
              <motion.div className="sugg" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {sugg.map(s => (
                  <div key={s} className="sugg-i" onClick={() => { setSearchVal(s); setSugg([]) }}>
                    <span>✈️</span>{s}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* HERO HEADLINE */}
      <div className="hero">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h1>
            Get{' '}
            <AnimatePresence mode="wait">
              <motion.span key={destIdx} className="dest"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.35 }}>
                {DESTINATIONS[destIdx]}
              </motion.span>
            </AnimatePresence>
            {' '}Visa Online
          </h1>
          <p className="hero-sub">With <b>99.3%</b> Approval Rate</p>
        </motion.div>
      </div>

      {/* TRENDING */}
      <section className="sec" style={{ paddingTop: 4 }}>
        <div className="sec-i">
          <div className="sec-hd">
            <div className="sec-ttl">Trending Countries</div>
            <button className="sec-lnk">View All Countries →</button>
          </div>
          <div className="tr-grid">
            {TRENDING.map((c, i) => (
              <motion.div key={c.name} className="tr-card"
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.09, duration: 0.5 }}>
                <img src={c.img} alt={c.name} className="tr-img" loading="lazy" />
                <div className="tr-ovl" />
                <div className="tr-badge">{c.count} Visas Processed</div>
                <div className="tr-btm">
                  <div className="tr-name">{c.flag} {c.name}</div>
                  <div className="tr-row">
                    <span className="tr-price">From {c.price}</span>
                    <span className="tr-proc">{c.processing}</span>
                  </div>
                  <button className="tr-apply">Apply Now</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPRESS */}
      <section className="sec bg2">
        <div className="sec-i">
          <div className="sec-hd">
            <div>
              <div className="sec-eye">⚡ Fast Track</div>
              <div className="sec-ttl">Express Visa Processing</div>
            </div>
            <button className="sec-lnk">View All →</button>
          </div>
          <div className="ex-grid">
            {EXPRESS.map((v, i) => (
              <motion.div key={v.country} className="ex-card"
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}>
                <img src={v.img} alt={v.country} className="ex-img" loading="lazy" />
                <div className="ex-ovl" />
                <div className="ex-con">
                  <span className="ex-fl">{v.flag}</span>
                  <div className="ex-nm">{v.country}</div>
                  <div className="ex-pr">⚡ {v.processing}</div>
                  <div className="ex-st">Stay: {v.stay}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY STATS */}
      <section className="sec">
        <div className="sec-i">
          <div className="sec-hd">
            <div>
              <div className="sec-eye">Why WeVisa</div>
              <div className="sec-ttl">Trusted by 1000+ Travel Agents</div>
            </div>
          </div>
          <div className="why-grid">
            {[
              { ic: '💰', val: '₹500+', lbl: 'Commission per visa' },
              { ic: '🌍', val: '100+', lbl: 'Countries covered' },
              { ic: '🤝', val: '1000+', lbl: 'Partner agents' },
              { ic: '✅', val: '99.3%', lbl: 'Approval rate' },
            ].map((w, i) => (
              <motion.div key={w.lbl} className="why-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.45 }}>
                <span className="why-ic">{w.ic}</span>
                <div className="why-val">{w.val}</div>
                <div className="why-lbl">{w.lbl}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="sec bg2">
        <div className="sec-i">
          <div className="sec-hd">
            <div>
              <div className="sec-eye">Agent Platform</div>
              <div className="sec-ttl">Business Tools for Travel Agents</div>
            </div>
          </div>
          <div className="tl-grid">
            {TOOLS.map((t, i) => (
              <motion.div key={t.title} className="tl-card"
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                <span className="tl-ic">{t.icon}</span>
                <div className="tl-ttl">{t.title}</div>
                <div className="tl-desc">{t.desc}</div>
                <Link to={t.path}><div className="tl-cta">Get Started →</div></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sec">
        <div className="sec-i">
          <div className="sec-hd">
            <div>
              <div className="sec-eye">Reviews</div>
              <div className="sec-ttl">What Our Partners Say</div>
            </div>
          </div>
          <div className="ts-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} className="ts-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.45 }}>
                <div className="ts-hd">
                  <Avatar name={t.name} />
                  <div>
                    <div className="ts-nm">{t.name}</div>
                    <div className="ts-mt">{t.city} · {t.years}yr partner</div>
                  </div>
                </div>
                <div className="ts-stars">★★★★★</div>
                <div className="ts-txt">"{t.text}"</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="sec bg2">
        <div className="sec-i">
          <div className="sec-hd">
            <div>
              <div className="sec-eye">Updates</div>
              <div className="sec-ttl">Latest Visa News & Articles</div>
            </div>
            <button className="sec-lnk">View All →</button>
          </div>
          <div className="nw-grid">
            {NEWS.map((n, i) => (
              <motion.div key={n.title} className="nw-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}>
                <div className="nw-imgw"><img src={n.img} alt={n.title} className="nw-img" loading="lazy" /></div>
                <div className="nw-body">
                  <div className="nw-dt">{n.date}</div>
                  <div className="nw-ttl">{n.title}</div>
                  <div className="nw-desc">{n.desc}</div>
                  <div className="nw-tags">{n.tags.map(tag => <span key={tag} className="nw-tag">{tag}</span>)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sec">
        <div className="sec-i">
          <motion.div className="cta-box"
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="cta-eye">Join WeVisa Today</div>
              <div className="cta-ttl">Ready to grow your<br />travel business?</div>
              <div className="cta-sub">Partner with India's most trusted B2B visa platform.<br />Start earning commissions from day one.</div>
            </div>
            <div className="cta-acts">
              <Link to="/wevisa/register"><button className="btn-cp">Become a Partner Agent</button></Link>
              <Link to="/wevisa/login"><button className="btn-cg">Agent Login</button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ft">
        <div className="ft-i">
          <div className="ft-grid">
            <div>
              <div className="ft-logo">We<span>Visa</span></div>
              <p className="ft-about">Your trusted B2B partner for visa services — exclusively for travel agents and agencies across India.</p>
            </div>
            <div>
              <div className="ft-ctitle">For Agents</div>
              <Link to="/wevisa/register"><span className="ft-link">Become a Partner</span></Link>
              <Link to="/wevisa/login"><span className="ft-link">Agent Login</span></Link>
              <span className="ft-link">Countries We Serve</span>
              <Link to="/wevisa/crm"><span className="ft-link">CRM Dashboard</span></Link>
              <span className="ft-link">Commission Structure</span>
            </div>
            <div>
              <div className="ft-ctitle">Support</div>
              <span className="ft-link">Agent Help Center</span>
              <span className="ft-link">Contact Support</span>
              <span className="ft-link">Track Applications</span>
              <span className="ft-link">API Documentation</span>
            </div>
            <div>
              <div className="ft-ctitle">Contact</div>
              <span className="ft-link">Western Entertainers LLP</span>
              <span className="ft-link">contact@wevisa.com</span>
              <span className="ft-link">+91 XXXXXXXXXX</span>
            </div>
          </div>
          <div className="ft-bot">
            <div className="ft-copy">© 2026 WeVisa · Powered by Western Entertainers LLP</div>
            <div className="ft-badges">
              <span className="ft-badge">ISO Certified</span>
              <span className="ft-badge">IATA Member</span>
              <span className="ft-badge">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
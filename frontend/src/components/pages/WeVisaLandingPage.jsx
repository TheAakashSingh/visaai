// src/components/wevisa/WeVisaLandingPage.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

/* ─── Data ─────────────────────────────────────────────── */
const COUNTRIES = [
  { name: 'Canada', flag: '🇨🇦', packages: 1, price: '₹1,180', tag: 'Popular', desc: 'Tourist, Business & Student visas' },
  { name: 'United Arab Emirates', flag: '🇦🇪', packages: 2, price: '₹236', tag: 'Express', desc: 'Tourist, Business & Work visas' },
  { name: 'United States', flag: '🇺🇸', packages: 0, price: null, tag: 'Featured', desc: 'Tourist, Student & Work visas' },
]

const EXPRESS_VISAS = [
  { country: 'Dubai', flag: '🇦🇪', type: 'eVisa', processing: '4 Hours', stay: '30 Days', color: '#FF6B35' },
  { country: 'Singapore', flag: '🇸🇬', type: 'eVisa', processing: '24 Hours', stay: '30 Days', color: '#E63946' },
  { country: 'Vietnam', flag: '🇻🇳', type: 'eVisa', processing: '2 Hours', stay: '30 Days', color: '#2EC4B6' },
  { country: 'Bali', flag: '🇮🇩', type: 'eVisa', processing: '24 Hours', stay: '30 Days', color: '#8338EC' },
  { country: 'Turkey', flag: '🇹🇷', type: 'eVisa', processing: '24 Hours', stay: '90 Days', color: '#06D6A0' },
]

const BUSINESS_TOOLS = [
  { icon: '📊', title: 'CRM Dashboard', desc: 'Manage leads, clients & operations from one place.' },
  { icon: '🧾', title: 'Invoice Generator', desc: 'GST-compliant invoices for visa & travel services.' },
  { icon: '📅', title: 'USA Early Appointment', desc: 'Secure early slots for US visa applications.' },
  { icon: '🎫', title: 'Dummy Tickets', desc: 'Instant dummy flight tickets for visa submissions.' },
  { icon: '🗓️', title: 'Schengen Appointments', desc: 'Book Schengen appointments across Europe.' },
  { icon: '🎨', title: 'Flyer Designer', desc: 'Create marketing flyers for your agency.' },
  { icon: '📱', title: 'International SIM', desc: 'Global SIM cards for your traveling clients.' },
]

const TESTIMONIALS = [
  { name: 'Rajiv Sharma', city: 'Mumbai', years: 3, text: 'WeVisa has transformed our business. Dubai approvals in 4 hours is incredible for our clients!' },
  { name: 'Priya Patel', city: 'Delhi', years: 2, text: 'Singapore bookings up 40% since partnering. The 24-hour processing is a genuine game-changer.' },
  { name: 'Anand Gupta', city: 'Bangalore', years: 1, text: 'Luxury Maldives packages are far easier to sell now. Clients love the hassle-free experience.' },
  { name: 'Lakshmi Nair', city: 'Kochi', years: 2, text: 'WeVisa helps us bring international tourists to Kerala with truly minimal visa friction.' },
]

const NEWS = [
  { date: 'Apr 16, 2026', title: 'New Visa Rules for Schengen Countries in 2026', desc: 'Important changes every agent should know.', tags: ['Schengen', 'Visa Rules'] },
  { date: 'Apr 15, 2026', title: 'Top 10 Documents for US Tourist Visa', desc: 'Full checklist for the B1/B2 interview.', tags: ['USA', 'Documents'] },
  { date: 'Apr 14, 2026', title: 'How to Track Application Status Online', desc: 'Step-by-step guide for your clients.', tags: ['Guide', 'Tips'] },
]

const STATS = [
  { value: '₹500+', label: 'Commission per visa' },
  { value: '100+', label: 'Countries covered' },
  { value: '1000+', label: 'Partner agents' },
  { value: '24/7', label: 'Dedicated support' },
]

/* ─── Tiny helpers ──────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

function Avatar({ name, size = 40 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
  const hue = (name.charCodeAt(0) * 37) % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue}, 60%, 90%)`,
      color: `hsl(${hue}, 60%, 30%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: size * 0.35,
      flexShrink: 0,
    }}>{initials}</div>
  )
}

/* ─── Component ─────────────────────────────────────────── */
export default function WeVisaLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0A0E1A;
          --ink2: #1C2235;
          --muted: #64748B;
          --pale: #F1F4FA;
          --white: #FFFFFF;
          --accent: #1850F0;
          --accent2: #0F3CC9;
          --gold: #F59E0B;
          --success: #10B981;
          --danger: #EF4444;
          --border: rgba(10,14,26,0.08);
          --shadow-sm: 0 1px 4px rgba(10,14,26,0.06), 0 4px 16px rgba(10,14,26,0.04);
          --shadow-md: 0 2px 8px rgba(10,14,26,0.06), 0 12px 40px rgba(10,14,26,0.1);
          --shadow-lg: 0 8px 32px rgba(10,14,26,0.12), 0 32px 80px rgba(10,14,26,0.16);
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --r-sm: 10px;
          --r-md: 16px;
          --r-lg: 24px;
          --r-xl: 32px;
        }

        html { scroll-behavior: smooth; }
        body { font-family: var(--font-body); color: var(--ink); background: var(--white); -webkit-font-smoothing: antialiased; }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }

        /* ── Navbar ── */
        .wv-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.3s ease;
          padding: 0 24px;
        }
        .wv-nav.scrolled {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .wv-nav-inner {
          max-width: 1200px; margin: 0 auto;
          height: 68px; display: flex; align-items: center; justify-content: space-between;
        }
        .wv-logo { font-family: var(--font-display); font-weight: 800; font-size: 22px; color: var(--ink); text-decoration: none; letter-spacing: -0.5px; }
        .wv-logo span { color: var(--accent); }
        .wv-nav-links { display: flex; align-items: center; gap: 32px; }
        .wv-nav-links button { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--muted); background: none; border: none; cursor: pointer; transition: color 0.2s; display: flex; align-items: center; gap: 4px; }
        .wv-nav-links button:hover { color: var(--ink); }
        .wv-nav-cta { display: flex; align-items: center; gap: 10px; }
        .btn-ghost { padding: 9px 20px; border-radius: var(--r-sm); border: 1.5px solid var(--border); background: transparent; font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--ink2); cursor: pointer; transition: all 0.2s; }
        .btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: rgba(24,80,240,0.04); }
        .btn-primary { padding: 9px 20px; border-radius: var(--r-sm); border: none; background: var(--accent); font-family: var(--font-body); font-size: 13px; font-weight: 600; color: white; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(24,80,240,0.3); }

        /* ── Hero ── */
        .wv-hero {
          min-height: 100vh;
          background: var(--ink);
          position: relative;
          overflow: hidden;
          display: flex; align-items: center;
        }
        .wv-hero-grid {
          position: absolute; inset: 0; opacity: 0.06;
          background-image:
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .wv-hero-glow {
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(24,80,240,0.35) 0%, transparent 70%);
          top: -200px; right: -100px; pointer-events: none;
        }
        .wv-hero-glow2 {
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
          bottom: 0; left: 100px; pointer-events: none;
        }
        .wv-hero-inner {
          max-width: 1200px; margin: 0 auto; padding: 120px 24px 80px;
          position: relative; z-index: 1; width: 100%;
        }
        .wv-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(24,80,240,0.15); border: 1px solid rgba(24,80,240,0.3);
          border-radius: 100px; padding: 6px 16px;
          font-size: 12px; font-weight: 600; color: #93B4FF;
          letter-spacing: 0.5px; text-transform: uppercase;
          margin-bottom: 28px;
        }
        .wv-hero-badge span { width: 6px; height: 6px; border-radius: 50%; background: #4C8DFF; display: block; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        .wv-hero h1 {
          font-family: var(--font-display); font-weight: 800; font-size: clamp(40px, 5.5vw, 72px);
          line-height: 1.05; letter-spacing: -2px; color: white;
          max-width: 780px; margin-bottom: 24px;
        }
        .wv-hero h1 em { font-style: normal; color: transparent; background: linear-gradient(135deg, #4C8DFF 0%, #93B4FF 100%); -webkit-background-clip: text; background-clip: text; }
        .wv-hero p { font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.6); max-width: 520px; line-height: 1.7; margin-bottom: 40px; }
        .wv-hero-btns { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 64px; }
        .btn-hero-primary { padding: 16px 32px; border-radius: var(--r-md); border: none; background: var(--accent); color: white; font-family: var(--font-body); font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-hero-primary:hover { background: #2860FF; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(24,80,240,0.4); }
        .btn-hero-ghost { padding: 16px 32px; border-radius: var(--r-md); border: 1.5px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: white; font-family: var(--font-body); font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(8px); }
        .btn-hero-ghost:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.1); }

        /* ── Stats bar ── */
        .wv-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--r-lg); overflow: hidden; max-width: 640px;
        }
        .wv-stat { padding: 20px 24px; border-right: 1px solid rgba(255,255,255,0.08); }
        .wv-stat:last-child { border-right: none; }
        .wv-stat-val { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: white; margin-bottom: 2px; }
        .wv-stat-label { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }

        /* ── Section chrome ── */
        .wv-section { padding: 96px 24px; }
        .wv-section-inner { max-width: 1200px; margin: 0 auto; }
        .wv-section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .wv-section-title { font-family: var(--font-display); font-size: clamp(28px, 3vw, 42px); font-weight: 800; letter-spacing: -1px; color: var(--ink); margin-bottom: 12px; line-height: 1.15; }
        .wv-section-sub { font-size: 16px; font-weight: 300; color: var(--muted); max-width: 540px; line-height: 1.7; margin-bottom: 52px; }

        /* ── Country cards ── */
        .wv-countries { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .wv-country-card {
          border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 28px;
          background: white; cursor: pointer; transition: all 0.25s;
          position: relative; overflow: hidden;
        }
        .wv-country-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(24,80,240,0.04) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.25s;
        }
        .wv-country-card:hover { border-color: rgba(24,80,240,0.25); box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .wv-country-card:hover::before { opacity: 1; }
        .wv-country-flag { font-size: 44px; margin-bottom: 16px; display: block; }
        .wv-country-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
        .wv-country-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
        .wv-country-price { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--accent); margin-bottom: 20px; }
        .wv-country-price span { font-size: 12px; font-weight: 500; color: var(--muted); }
        .wv-country-tag { position: absolute; top: 20px; right: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 100px; }
        .tag-popular { background: rgba(245,158,11,0.1); color: #D97706; }
        .tag-express { background: rgba(16,185,129,0.1); color: #059669; }
        .tag-featured { background: rgba(24,80,240,0.1); color: var(--accent); }
        .btn-card { width: 100%; padding: 11px; border-radius: var(--r-sm); border: 1.5px solid var(--border); background: transparent; font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--ink2); cursor: pointer; transition: all 0.2s; }
        .btn-card:hover { border-color: var(--accent); color: var(--accent); }

        /* ── Express visas ── */
        .wv-bg-pale { background: var(--pale); }
        .wv-express-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .wv-express-card {
          background: white; border-radius: var(--r-md); padding: 22px 18px;
          border: 1.5px solid var(--border); transition: all 0.25s; cursor: pointer;
          position: relative; overflow: hidden;
        }
        .wv-express-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: var(--card-color); border-radius: 0 0 var(--r-md) var(--r-md);
          transform: scaleX(0); transition: transform 0.25s; transform-origin: left;
        }
        .wv-express-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); border-color: transparent; }
        .wv-express-card:hover::after { transform: scaleX(1); }
        .wv-express-flag { font-size: 32px; display: block; margin-bottom: 12px; }
        .wv-express-country { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 14px; }
        .wv-express-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .wv-express-row-label { font-size: 11px; color: var(--muted); }
        .wv-express-row-val { font-size: 12px; font-weight: 600; color: var(--ink2); }
        .wv-express-row-val.fast { color: var(--success); }
        .btn-express { width: 100%; margin-top: 16px; padding: 9px; border-radius: 8px; border: none; font-family: var(--font-body); font-size: 12px; font-weight: 700; color: white; background: var(--card-color); cursor: pointer; transition: opacity 0.2s; }
        .btn-express:hover { opacity: 0.85; }

        /* ── Tools grid ── */
        .wv-tools-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .wv-tool-card {
          background: white; border: 1.5px solid var(--border); border-radius: var(--r-md);
          padding: 24px; cursor: pointer; transition: all 0.25s; group: true;
        }
        .wv-tool-card:hover { box-shadow: var(--shadow-md); border-color: rgba(24,80,240,0.2); transform: translateY(-2px); }
        .wv-tool-icon { font-size: 28px; margin-bottom: 14px; display: block; }
        .wv-tool-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
        .wv-tool-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 14px; }
        .wv-tool-link { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px; }

        /* ── Testimonials ── */
        .wv-testimonials-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .wv-testi-card {
          background: white; border: 1.5px solid var(--border); border-radius: var(--r-lg);
          padding: 28px; transition: all 0.25s;
        }
        .wv-testi-card:hover { box-shadow: var(--shadow-md); }
        .wv-testi-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .wv-testi-name { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--ink); }
        .wv-testi-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .wv-testi-text { font-size: 14px; color: #374151; line-height: 1.75; font-style: italic; }
        .wv-testi-stars { display: flex; gap: 3px; margin-top: 16px; }
        .wv-testi-star { color: var(--gold); font-size: 14px; }

        /* ── News ── */
        .wv-news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .wv-news-card {
          border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 28px;
          background: white; cursor: pointer; transition: all 0.25s;
        }
        .wv-news-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: rgba(24,80,240,0.2); }
        .wv-news-date { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 12px; }
        .wv-news-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--ink); line-height: 1.4; margin-bottom: 10px; }
        .wv-news-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 18px; }
        .wv-news-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .wv-tag { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px; background: rgba(24,80,240,0.07); color: var(--accent); }

        /* ── CTA Banner ── */
        .wv-cta-banner {
          background: var(--ink); border-radius: var(--r-xl); padding: 64px;
          display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center;
          position: relative; overflow: hidden;
        }
        .wv-cta-banner::before {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(24,80,240,0.3) 0%, transparent 70%);
          top: -200px; right: -100px; pointer-events: none;
        }
        .wv-cta-title { font-family: var(--font-display); font-size: 36px; font-weight: 800; color: white; letter-spacing: -1px; line-height: 1.2; margin-bottom: 12px; }
        .wv-cta-sub { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.6; }
        .wv-cta-actions { display: flex; flex-direction: column; gap: 10px; }

        /* ── Invoice section ── */
        .wv-invoice-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 40px; }
        .wv-invoice-feat { display: flex; flex-direction: column; gap: 8px; }
        .wv-invoice-feat-icon { font-size: 24px; }
        .wv-invoice-feat-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--ink); }
        .wv-invoice-feat-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }

        /* ── Footer ── */
        .wv-footer { background: var(--ink); padding: 72px 24px 32px; }
        .wv-footer-inner { max-width: 1200px; margin: 0 auto; }
        .wv-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 56px; }
        .wv-footer-logo { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: white; margin-bottom: 14px; }
        .wv-footer-logo span { color: #4C8DFF; }
        .wv-footer-about { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.8; max-width: 260px; }
        .wv-footer-col-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: white; margin-bottom: 18px; letter-spacing: 0.5px; }
        .wv-footer-link { display: block; font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 12px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .wv-footer-link:hover { color: white; }
        .wv-footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; display: flex; align-items: center; justify-content: space-between; }
        .wv-footer-copy { font-size: 12px; color: rgba(255,255,255,0.3); }
        .wv-footer-badges { display: flex; gap: 12px; }
        .wv-footer-badge { font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.4); }

        /* ── Divider link ── */
        .wv-more-link { text-align: center; margin-top: 32px; }
        .wv-more-link button { background: none; border: none; font-family: var(--font-body); font-size: 13px; font-weight: 700; color: var(--accent); cursor: pointer; letter-spacing: 0.3px; transition: opacity 0.2s; }
        .wv-more-link button:hover { opacity: 0.7; }

        @media (max-width: 900px) {
          .wv-countries { grid-template-columns: 1fr; }
          .wv-express-grid { grid-template-columns: repeat(2, 1fr); }
          .wv-tools-grid { grid-template-columns: repeat(2, 1fr); }
          .wv-testimonials-grid { grid-template-columns: 1fr; }
          .wv-news-grid { grid-template-columns: 1fr; }
          .wv-footer-grid { grid-template-columns: 1fr 1fr; }
          .wv-cta-banner { grid-template-columns: 1fr; }
          .wv-invoice-features { grid-template-columns: repeat(2, 1fr); }
          .wv-stats { grid-template-columns: repeat(2, 1fr); }
          .wv-nav-links { display: none; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className={`wv-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="wv-nav-inner">
          <Link to="/wevisa" className="wv-logo">We<span>Visa</span></Link>
          <div className="wv-nav-links">
            <button>Visa Services ▾</button>
            <button>Business Tools ▾</button>
            <button>Travel Services ▾</button>
            <button>Resources ▾</button>
          </div>
          <div className="wv-nav-cta">
            <Link to="/wevisa/login" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost">Agent Login</button>
            </Link>
            <Link to="/wevisa/register" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">Become a Partner</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="wv-hero">
        <div className="wv-hero-grid" />
        <div className="wv-hero-glow" />
        <div className="wv-hero-glow2" />
        <motion.div className="wv-hero-inner" style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div {...fadeUp(0.1)}>
            <div className="wv-hero-badge">
              <span />
              Exclusively for Travel Agents & Agencies
            </div>
          </motion.div>
          <motion.h1 {...fadeUp(0.2)}>
            India's Premier<br /><em>B2B Visa Platform</em><br />for Travel Agents
          </motion.h1>
          <motion.p {...fadeUp(0.3)}>
            Process visas efficiently, earn competitive commissions, and grow your travel business with a platform built around your needs.
          </motion.p>
          <motion.div className="wv-hero-btns" {...fadeUp(0.4)}>
            <Link to="/wevisa/register" style={{ textDecoration: 'none' }}>
              <button className="btn-hero-primary">Become a Partner Agent →</button>
            </Link>
            <Link to="/wevisa/login" style={{ textDecoration: 'none' }}>
              <button className="btn-hero-ghost">Agent Login</button>
            </Link>
          </motion.div>
          <motion.div className="wv-stats" {...fadeUp(0.5)}>
            {STATS.map(s => (
              <div key={s.label} className="wv-stat">
                <div className="wv-stat-val">{s.value}</div>
                <div className="wv-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Countries ── */}
      <section className="wv-section">
        <div className="wv-section-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="wv-section-eyebrow">Destinations</div>
            <h2 className="wv-section-title">Explore all countries</h2>
            <p className="wv-section-sub">Access visa services for destinations across the globe. More countries added regularly.</p>
          </motion.div>
          <div className="wv-countries">
            {COUNTRIES.map((c, i) => (
              <motion.div key={c.name} className="wv-country-card"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <span className={`wv-country-tag tag-${c.tag.toLowerCase()}`}>{c.tag}</span>
                <span className="wv-country-flag">{c.flag}</span>
                <div className="wv-country-name">{c.name}</div>
                <div className="wv-country-desc">{c.desc}</div>
                {c.price
                  ? <div className="wv-country-price">{c.price} <span>starting</span></div>
                  : <div style={{ height: 40 }} />}
                <button className="btn-card">View Visa Details</button>
              </motion.div>
            ))}
          </div>
          <div className="wv-more-link"><button>View All Countries →</button></div>
        </div>
      </section>

      {/* ── Express Visas ── */}
      <section className="wv-section wv-bg-pale">
        <div className="wv-section-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="wv-section-eyebrow">⚡ Express Processing</div>
            <h2 className="wv-section-title">Express Visas for Your Clients</h2>
            <p className="wv-section-sub">Fast-track visa processing with guaranteed turnaround. Earn commission on every application.</p>
          </motion.div>
          <div className="wv-express-grid">
            {EXPRESS_VISAS.map((v, i) => (
              <motion.div key={v.country} className="wv-express-card"
                style={{ '--card-color': v.color }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}>
                <span className="wv-express-flag">{v.flag}</span>
                <div className="wv-express-country">{v.country}</div>
                <div className="wv-express-row">
                  <span className="wv-express-row-label">Type</span>
                  <span className="wv-express-row-val">{v.type}</span>
                </div>
                <div className="wv-express-row">
                  <span className="wv-express-row-label">Processing</span>
                  <span className="wv-express-row-val fast">{v.processing}</span>
                </div>
                <div className="wv-express-row">
                  <span className="wv-express-row-label">Stay</span>
                  <span className="wv-express-row-val">{v.stay}</span>
                </div>
                <button className="btn-express">Apply Now</button>
              </motion.div>
            ))}
          </div>
          <div className="wv-more-link"><button>View All Countries →</button></div>
        </div>
      </section>

      {/* ── Business Tools ── */}
      <section className="wv-section">
        <div className="wv-section-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="wv-section-eyebrow">Platform</div>
            <h2 className="wv-section-title">Business Tools for Travel Agents</h2>
            <p className="wv-section-sub">Complete toolkit to manage your agency — from CRM to invoicing and marketing materials.</p>
          </motion.div>
          <div className="wv-tools-grid">
            {BUSINESS_TOOLS.map((t, i) => (
              <motion.div key={t.title} className="wv-tool-card"
                initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                <span className="wv-tool-icon">{t.icon}</span>
                <div className="wv-tool-title">{t.title}</div>
                <div className="wv-tool-desc">{t.desc}</div>
                <div className="wv-tool-link">Get Started →</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="wv-section wv-bg-pale">
        <div className="wv-section-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="wv-section-eyebrow">Testimonials</div>
            <h2 className="wv-section-title">Why Travel Agents Choose WeVisa</h2>
            <p className="wv-section-sub">Join 1000+ travel agent partners across India who trust WeVisa for fast, reliable B2B visa services.</p>
          </motion.div>
          <div className="wv-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} className="wv-testi-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}>
                <div className="wv-testi-header">
                  <Avatar name={t.name} />
                  <div>
                    <div className="wv-testi-name">{t.name}</div>
                    <div className="wv-testi-meta">{t.city} · Partner for {t.years} year{t.years > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <p className="wv-testi-text">"{t.text}"</p>
                <div className="wv-testi-stars">
                  {[...Array(5)].map((_, j) => <span key={j} className="wv-testi-star">★</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Invoice Section ── */}
      <section className="wv-section">
        <div className="wv-section-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div style={{ background: 'var(--pale)', borderRadius: 'var(--r-xl)', padding: '56px 56px 48px', border: '1.5px solid var(--border)' }}>
              <div className="wv-section-eyebrow">Finance</div>
              <h2 className="wv-section-title" style={{ marginBottom: 8 }}>Advanced Invoice & Purchase Management</h2>
              <p className="wv-section-sub">Professional invoicing built specifically for travel agents — GST-compliant, profit-tracking, and payment-aware.</p>
              <div className="wv-invoice-features">
                {[
                  { icon: '📋', title: 'GST-Compliant Invoicing', desc: 'Create invoices with service charge and GST calculations that comply with tax regulations.' },
                  { icon: '🛒', title: 'Purchase Management', desc: 'Track purchases and link them to invoices for complete financial visibility.' },
                  { icon: '💰', title: 'Profit Calculation', desc: 'Automatically calculate profits by comparing sales and purchase amounts.' },
                  { icon: '💳', title: 'Advanced Payment Tracking', desc: 'Track statuses: Paid, Unpaid, Partially Paid, Refunded, and Overdue.' },
                ].map(item => (
                  <div key={item.title} className="wv-invoice-feat">
                    <span className="wv-invoice-feat-icon">{item.icon}</span>
                    <div className="wv-invoice-feat-title">{item.title}</div>
                    <div className="wv-invoice-feat-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
              <Link to="/wevisa/invoice" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '14px 28px', fontSize: 14, borderRadius: 'var(--r-md)' }}>
                  Open Invoice Dashboard →
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── News ── */}
      <section className="wv-section wv-bg-pale">
        <div className="wv-section-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="wv-section-eyebrow">News & Updates</div>
            <h2 className="wv-section-title">Latest Visa News & Articles</h2>
            <p className="wv-section-sub">Stay informed with the latest visa updates, travel tips, and important changes from our team.</p>
          </motion.div>
          <div className="wv-news-grid">
            {NEWS.map((n, i) => (
              <motion.div key={n.title} className="wv-news-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}>
                <div className="wv-news-date">{n.date}</div>
                <div className="wv-news-title">{n.title}</div>
                <div className="wv-news-desc">{n.desc}</div>
                <div className="wv-news-tags">{n.tags.map(tag => <span key={tag} className="wv-tag">{tag}</span>)}</div>
              </motion.div>
            ))}
          </div>
          <div className="wv-more-link"><button>View All Updates →</button></div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="wv-section">
        <div className="wv-section-inner">
          <motion.div className="wv-cta-banner" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4C8DFF', marginBottom: 16 }}>Join WeVisa Today</div>
              <div className="wv-cta-title">Ready to grow your<br />travel business?</div>
              <div className="wv-cta-sub">Partner with India's most trusted B2B visa platform.<br />Start earning commissions from day one.</div>
            </div>
            <div className="wv-cta-actions" style={{ position: 'relative', zIndex: 1 }}>
              <Link to="/wevisa/register" style={{ textDecoration: 'none' }}>
                <button className="btn-hero-primary" style={{ whiteSpace: 'nowrap' }}>Become a Partner Agent</button>
              </Link>
              <Link to="/wevisa/login" style={{ textDecoration: 'none' }}>
                <button className="btn-hero-ghost" style={{ whiteSpace: 'nowrap' }}>Agent Login</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="wv-footer">
        <div className="wv-footer-inner">
          <div className="wv-footer-grid">
            <div>
              <div className="wv-footer-logo">We<span>Visa</span></div>
              <p className="wv-footer-about">Your trusted B2B partner for visa services — exclusively for travel agents and agencies across India.</p>
            </div>
            <div>
              <div className="wv-footer-col-title">For Agents</div>
              <a className="wv-footer-link">Become a Partner</a>
              <a className="wv-footer-link">Agent Login</a>
              <a className="wv-footer-link">Countries We Serve</a>
              <a className="wv-footer-link">CRM Dashboard</a>
              <a className="wv-footer-link">Commission Structure</a>
            </div>
            <div>
              <div className="wv-footer-col-title">Support</div>
              <a className="wv-footer-link">Agent Help Center</a>
              <a className="wv-footer-link">Contact Support</a>
              <a className="wv-footer-link">Track Applications</a>
              <a className="wv-footer-link">API Documentation</a>
            </div>
            <div>
              <div className="wv-footer-col-title">Contact</div>
              <a className="wv-footer-link">Western Entertainers LLP</a>
              <a className="wv-footer-link">contact@wevisa.com</a>
              <a className="wv-footer-link">+91 XXXXXXXXXX</a>
            </div>
          </div>
          <div className="wv-footer-bottom">
            <div className="wv-footer-copy">© 2026 WeVisa · Powered by Western Entertainers LLP</div>
            <div className="wv-footer-badges">
              <span className="wv-footer-badge">ISO Certified</span>
              <span className="wv-footer-badge">IATA Member</span>
              <span className="wv-footer-badge">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
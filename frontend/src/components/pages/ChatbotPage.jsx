// src/components/pages/ChatbotPage.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { chatbotAPI } from '@/services/api'
import { MetricCard, PageHeader } from '@/components/ui'

const QUICK_REPLIES = [
  { label: '🍁 Canada Student', text: 'I want to apply for student visa in Canada' },
  { label: '🇩🇪 Germany Work', text: 'Work permit requirements for Germany?' },
  { label: '🇪🇺 Schengen Tourist', text: 'Schengen visa documents needed' },
  { label: '📄 Document list', text: 'What documents do I need for visa?' },
  { label: '⏰ Processing time', text: 'Kitna time lagega visa milne mein?' },
  { label: '🇬🇧 UK Visa', text: 'UK student visa process and requirements' },
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! 🙏 Welcome to VisaAI Pro. I am your AI visa assistant.\n\nHow can I assist you today?\nआप किस प्रकार के वीज़ा के बारे में जानना चाहते हैं?', timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))
  const bottomRef = useRef()

  const { data: stats } = useQuery({ queryKey: ['chatbot-stats'], queryFn: () => chatbotAPI.getStats().then(r => r.data.data) })

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    setLoading(true)
    try {
      const { data } = await chatbotAPI.chat({ message: msg, sessionId, history: messages.slice(-8) })
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.message, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having a temporary issue. Please try again. 🙏', timestamp: new Date() }])
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp AI Chatbot" subtitle="Monitor, test, and manage your AI chatbot in real-time." />
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Messages Today" value={stats?.totalConversations || 1247} change="All channels" accent="green" delay={0.05} />
        <MetricCard label="Active Chats" value={stats?.activeConversations || 34} change="Right now" accent="blue" delay={0.1} />
        <MetricCard label="Resolution Rate" value="94%" change="↑ 2% this week" accent="gold" delay={0.15} />
        <MetricCard label="Avg Response" value="<2s" change="AI powered" delay={0.2} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="card col-span-2 flex flex-col" style={{ height: 520 }}>
          <div className="card-header">
            <div><div className="card-title">💬 Live Chat Simulator</div><div className="card-sub">Test your WhatsApp bot</div></div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">⚡ GPT-4 Fine-tuned</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 border ${msg.role === 'assistant' ? 'bg-[var(--red-dim)] border-[rgba(232,55,42,0.3)]' : 'bg-blue-500/15 border-blue-500/30'}`}>
                  {msg.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div>
                  <div className={`px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'assistant' ? 'bg-bg3 border border-[rgba(255,255,255,0.07)] rounded-tl-sm' : 'bg-[rgba(232,55,42,0.15)] border border-[rgba(232,55,42,0.25)] rounded-tr-sm'}`}>
                    {msg.content}
                  </div>
                  <div className={`text-[10px] text-[var(--text3)] mt-1 font-mono ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs bg-[var(--red-dim)] border border-[rgba(232,55,42,0.3)] flex-shrink-0">🤖</div>
                <div className="bg-bg3 border border-[rgba(255,255,255,0.07)] rounded-xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="p-4 border-t border-[rgba(255,255,255,0.07)] flex gap-2">
            <input className="input flex-1" placeholder="Type a message... (English or Hindi)" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary px-4">➤</button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card">
            <div className="card-header"><div className="card-title">📊 Bot Stats</div></div>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {[['Avg. Response Time','<2s'],['Resolution Rate','94%'],['Escalated to Human','6%'],['Languages','EN / HI'],['Active Sessions','34']].map(([k,v]) => (
                <div key={k} className="flex justify-between items-center px-5 py-3">
                  <span className="text-xs text-[var(--text2)]">{k}</span>
                  <span className="text-sm font-bold font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">🎯 Quick Replies</div></div>
            <div className="p-3 space-y-2">
              {QUICK_REPLIES.map(q => (
                <button key={q.text} onClick={() => sendMessage(q.text)} className="btn-outline w-full justify-start text-xs py-2">{q.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

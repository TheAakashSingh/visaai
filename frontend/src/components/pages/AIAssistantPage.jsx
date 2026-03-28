// src/components/pages/AIAssistantPage.jsx
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { chatbotAPI } from '@/services/api'
import { PageHeader } from '@/components/ui'

const QUICK_PROMPTS = [
  { label: '🍁 Canada Student Visa', text: 'Canada student visa requirements for Indian students 2024' },
  { label: '🇪🇺 Schengen Docs', text: 'Complete Schengen visa document checklist' },
  { label: '🇬🇧 UK Work Permit', text: 'UK skilled worker visa process and requirements' },
  { label: '🔥 Hot Leads', text: 'How many hot leads do I have and what should I do?' },
  { label: '📊 Conversion Rate', text: 'What is my current lead conversion rate and how to improve?' },
  { label: '🇦🇺 Australia PR', text: 'Australia skilled migration points test requirements' },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your VisaAI intelligence engine. 🤖\n\nI can help you with:\n• Visa requirements for 50+ countries\n• Document checklists tailored to your client\n• Processing timelines and current wait times\n• Lead insights from your CRM data\n• Fee structures and application guidance\n\nWhat would you like to know?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    setLoading(true)
    try {
      const { data } = await chatbotAPI.chat({
        message: msg,
        history: messages.slice(-10),
        mode: 'assistant',
      })
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.message, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an error. Please try again. 🙏', timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you? 🤖', timestamp: new Date() }])
    toast.success('Chat cleared')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask anything about visa rules, document requirements, and client management."
        action={
          <button className="btn-outline text-xs py-2" onClick={clear}>
            🗑 Clear Chat
          </button>
        }
      />

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.text}
            onClick={() => send(q.text)}
            className="text-xs px-3 py-1.5 rounded-full bg-bg3 border border-[rgba(255,255,255,0.07)] text-[var(--text2)] hover:border-[var(--red)] hover:text-[var(--red2)] transition-all duration-200"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="card flex flex-col" style={{ height: 'calc(100vh - 340px)', minHeight: 420 }}>
        <div className="card-header">
          <div>
            <div className="card-title">🤖 VisaAI Intelligence Engine</div>
            <div className="card-sub">Trained on Indian immigration policies & visa documentation</div>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
            ⚡ GPT-4 Fine-tuned
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 border ${
                  msg.role === 'assistant'
                    ? 'bg-[rgba(232,55,42,0.12)] border-[rgba(232,55,42,0.3)]'
                    : 'bg-blue-500/15 border-blue-500/30'
                }`}
              >
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div>
                <div
                  className={`px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'assistant'
                      ? 'bg-bg3 border border-[rgba(255,255,255,0.07)] rounded-tl-sm'
                      : 'bg-[rgba(232,55,42,0.12)] border border-[rgba(232,55,42,0.2)] rounded-tr-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <div className={`text-[10px] text-[var(--text3)] mt-1 font-mono ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[rgba(232,55,42,0.12)] border border-[rgba(232,55,42,0.3)] flex-shrink-0">🤖</div>
              <div className="bg-bg3 border border-[rgba(255,255,255,0.07)] rounded-xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.07)] flex gap-2.5">
          <input
            className="input flex-1"
            placeholder="Ask about visa requirements, client management, analytics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

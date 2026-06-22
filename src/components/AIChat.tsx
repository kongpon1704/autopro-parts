'use client'
import { useEffect, useRef, useState } from 'react'
import { useAIChat } from '@/hooks'
import { Button, Spinner } from '@/components/ui'

interface Props {
  mode: 'admin' | 'customer'
  initialMessage?: string
  quickPrompts?: string[]
  placeholder?: string
}

export default function AIChat({ mode, initialMessage, quickPrompts = [], placeholder }: Props) {
  const { messages, loading, send, setMessages } = useAIChat(mode)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([{ role: 'assistant', content: initialMessage }])
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    inputRef.current?.focus()
    await send(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs flex-shrink-0 mr-2 mt-0.5">AI</div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-surface border border-gray-200 text-gray-800 rounded-bl-sm'
              }`}
              dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }}
            />
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs flex-shrink-0 mr-2">AI</div>
            <div className="bg-surface border border-gray-200 rounded-xl rounded-bl-sm px-3 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {quickPrompts.length > 0 && messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => send(p)}
              disabled={loading}
              className="text-xs bg-white border border-gray-200 text-secondary rounded-full px-2.5 py-1 hover:bg-surface transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-2">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'พิมพ์ข้อความ...'}
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-secondary bg-surface"
          />
          <Button size="sm" onClick={handleSend} disabled={!input.trim() || loading}>
            {loading ? <Spinner size="sm" color="white" /> : 'ส่ง'}
          </Button>
        </div>
      </div>
    </div>
  )
}

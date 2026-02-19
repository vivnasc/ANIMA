'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { MirrorConfig } from '@/lib/ai/mirrors'
import type { Language, JourneyPhase } from '@/types/database'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ConversationSummary {
  id: string
  title: string | null
  updated_at: string
  message_count: number
}

interface ChatInterfaceProps {
  mirror: MirrorConfig
  conversations: ConversationSummary[]
  userId: string
  language: Language
  journeyPhase: JourneyPhase
}

export function ChatInterface({
  mirror,
  conversations: initialConversations,
  language,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState(initialConversations)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const loadConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setConversationId(convId)
        setShowHistory(false)
      }
    } catch (err) {
      console.error('Failed to load conversation:', err)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setConversationId(null)
    setShowHistory(false)
    inputRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          mirrorSlug: mirror.slug
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: errorData.error || 'An error occurred. Please try again.' }
              : m
          )
        )
        setIsLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n\n').filter(Boolean)

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.text) {
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantId
                        ? { ...m, content: m.content + data.text }
                        : m
                    )
                  )
                }

                if (data.conversationId && !conversationId) {
                  setConversationId(data.conversationId)
                  setConversations(prev => [{
                    id: data.conversationId,
                    title: userMessage.content.substring(0, 80),
                    updated_at: new Date().toISOString(),
                    message_count: 2
                  }, ...prev])
                }

                if (data.done) {
                  // Stream complete
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Connection error. Please try again.' }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const description = mirror.descriptions[language] || mirror.descriptions.en

  return (
    <div className="flex h-full">
      {/* Conversation History Sidebar - Mobile */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-black/40 md:hidden" onClick={() => setShowHistory(false)}>
          <div
            className="w-72 h-full p-4 overflow-y-auto"
            style={{ backgroundColor: '#f0ece6' }}
            onClick={e => e.stopPropagation()}
          >
            <ConversationList
              conversations={conversations}
              activeId={conversationId}
              onSelect={loadConversation}
              onNew={startNewConversation}
              mirrorColor={mirror.color}
            />
          </div>
        </div>
      )}

      {/* Conversation History - Desktop */}
      <div className="hidden md:block w-72 p-4 overflow-y-auto" style={{ backgroundColor: '#f0ece6', borderRight: '1px solid #ccc7bc' }}>
        <ConversationList
          conversations={conversations}
          activeId={conversationId}
          onSelect={loadConversation}
          onNew={startNewConversation}
          mirrorColor={mirror.color}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: `2px solid ${mirror.color}25`, backgroundColor: '#f0ece6' }}
        >
          <button
            className="md:hidden p-1.5 rounded-lg"
            style={{ color: '#7a746b' }}
            onClick={() => setShowHistory(!showHistory)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${mirror.color}15` }}>
            <Image src={mirror.logo} alt={mirror.name} width={28} height={28} className="rounded-full" />
          </div>
          <div>
            <h1 className="font-heading font-semibold" style={{ color: mirror.color }}>
              {mirror.name}
            </h1>
            <p className="text-xs" style={{ color: '#7a746b' }}>{description}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${mirror.color}12` }}>
                  <Image src={mirror.logo} alt={mirror.name} width={56} height={56} className="rounded-full" />
                </div>
                <h2 className="text-xl font-heading font-semibold" style={{ color: mirror.color }}>
                  {mirror.name}
                </h2>
                <p style={{ color: '#7a746b' }}>{description}</p>
                <p className="text-sm" style={{ color: '#9a7b50' }}>
                  {language === 'pt' ? 'Começa quando estiveres pronto/a...' :
                   language === 'fr' ? 'Commencez quand vous êtes prêt(e)...' :
                   language === 'es' ? 'Comienza cuando estés listo/a...' :
                   'Begin when you\'re ready...'}
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-3xl",
                message.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm overflow-hidden"
                style={
                  message.role === 'user'
                    ? { backgroundColor: '#9a7b50', color: '#fff' }
                    : { backgroundColor: `${mirror.color}15` }
                }
              >
                {message.role === 'user' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                ) : (
                  <Image src={mirror.logo} alt={mirror.name} width={20} height={20} className="rounded-full" />
                )}
              </div>
              <div
                className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%]"
                style={
                  message.role === 'user'
                    ? { backgroundColor: '#2a2520', color: '#ede9e3' }
                    : { backgroundColor: '#f0ece6', color: '#2a2520' }
                }
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none" style={{ color: '#2a2520' }}>
                    <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: `${mirror.color}15` }}
              >
                <Image src={mirror.logo} alt={mirror.name} width={20} height={20} className="rounded-full" />
              </div>
              <div className="rounded-2xl px-4 py-2.5" style={{ backgroundColor: '#f0ece6' }}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${mirror.color}60`, animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${mirror.color}60`, animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${mirror.color}60`, animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4" style={{ borderTop: '1px solid #ccc7bc' }}>
          <div className="flex gap-2 max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder={
                language === 'pt' ? 'Escreve a tua mensagem...' :
                language === 'fr' ? 'Écrivez votre message...' :
                language === 'es' ? 'Escribe tu mensaje...' :
                'Type your message...'
              }
              rows={1}
              className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 min-h-[42px] max-h-[120px]"
              style={{
                backgroundColor: '#f0ece6',
                border: '1px solid #ccc7bc',
                color: '#2a2520',
                overflow: 'auto',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{ backgroundColor: mirror.color }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  mirrorColor
}: {
  conversations: ConversationSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  mirrorColor: string
}) {
  return (
    <div className="space-y-2">
      <button
        onClick={onNew}
        className="w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        style={{ border: `1px dashed ${mirrorColor}40`, color: mirrorColor }}
      >
        + Nova conversa
      </button>

      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            "w-full text-left rounded-xl px-3 py-2.5 text-sm transition-colors",
            conv.id === activeId ? "font-medium" : ""
          )}
          style={{
            backgroundColor: conv.id === activeId ? '#e8e3da' : undefined,
            color: conv.id === activeId ? '#2a2520' : '#7a746b',
          }}
        >
          <p className="truncate">{conv.title || 'Nova conversa'}</p>
          <p className="text-xs mt-0.5" style={{ color: '#9a947b' }}>
            {conv.message_count} mensagens
          </p>
        </button>
      ))}

      {conversations.length === 0 && (
        <p className="text-xs text-center py-4" style={{ color: '#7a746b' }}>
          Ainda sem conversas
        </p>
      )}
    </div>
  )
}

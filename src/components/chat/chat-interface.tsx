'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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

    // Create assistant placeholder
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

                  // Add to conversations list
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
        <div className="absolute inset-0 z-50 bg-background/80 md:hidden" onClick={() => setShowHistory(false)}>
          <div className="w-72 h-full bg-card border-r border-border p-4" onClick={e => e.stopPropagation()}>
            <ConversationList
              conversations={conversations}
              activeId={conversationId}
              onSelect={loadConversation}
              onNew={startNewConversation}
            />
          </div>
        </div>
      )}

      {/* Conversation History - Desktop */}
      <div className="hidden md:block w-72 border-r border-border p-4 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          activeId={conversationId}
          onSelect={loadConversation}
          onNew={startNewConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-border"
          style={{ borderBottomColor: `${mirror.color}30` }}
        >
          <button
            className="md:hidden p-1 rounded hover:bg-muted"
            onClick={() => setShowHistory(!showHistory)}
          >
            ☰
          </button>
          <span className="text-2xl">{mirror.icon}</span>
          <div>
            <h1 className="font-semibold" style={{ color: mirror.color }}>
              {mirror.name}
            </h1>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4 max-w-md">
                <div className="text-6xl">{mirror.icon}</div>
                <h2 className="text-xl font-semibold" style={{ color: mirror.color }}>
                  {mirror.name}
                </h2>
                <p className="text-muted-foreground">{description}</p>
                <p className="text-sm text-muted-foreground">
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
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : ""
              )}
              style={message.role === 'assistant' ? { backgroundColor: `${mirror.color}20`, color: mirror.color } : {}}
              >
                {message.role === 'user' ? '👤' : mirror.icon}
              </div>
              <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%]",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: `${mirror.color}20`, color: mirror.color }}
              >
                {mirror.icon}
              </div>
              <div className="bg-muted rounded-2xl px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
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
              className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[42px] max-h-[120px]"
              style={{ overflow: 'auto' }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: mirror.color }}
            >
              {isLoading ? '...' : '→'}
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
  onNew
}: {
  conversations: ConversationSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}) {
  return (
    <div className="space-y-2">
      <button
        onClick={onNew}
        className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        + New conversation
      </button>

      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            "w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
            conv.id === activeId
              ? "bg-muted font-medium"
              : "hover:bg-muted/50 text-muted-foreground"
          )}
        >
          <p className="truncate">{conv.title || 'New conversation'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {conv.message_count} messages
          </p>
        </button>
      ))}

      {conversations.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No conversations yet
        </p>
      )}
    </div>
  )
}

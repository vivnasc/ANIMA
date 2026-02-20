'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SessionList } from './session-list'
import { EntryRitual } from './entry-ritual'
import { ExitRitual } from './exit-ritual'
import { MilestoneOverlay } from './milestone-overlay'
import { RITUAL_CONTENT } from '@/lib/journey/session-constants'
import type { MirrorConfig } from '@/lib/ai/mirrors'
import type { Language, JourneyPhase, MirrorSlug } from '@/types/database'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface SessionInfo {
  session_number: number
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  title: string
  subtitle: string
  estimated_minutes: number
  conversation_id: string | null
}

interface MilestoneInfo {
  id: string
  title: string
  description: string
  mirror_slug: MirrorSlug | null
}

interface ChatWithSessionsProps {
  mirror: MirrorConfig
  sessions: SessionInfo[]
  userId: string
  language: Language
  journeyPhase: JourneyPhase
  streakCount: number
  initialMilestones: MilestoneInfo[]
}

type ViewState = 'sessions' | 'entry-ritual' | 'chat' | 'exit-ritual'

export function ChatWithSessions({
  mirror,
  sessions: initialSessions,
  language,
  streakCount,
  initialMilestones,
}: ChatWithSessionsProps) {
  const [view, setView] = useState<ViewState>('sessions')
  const [sessions, setSessions] = useState(initialSessions)
  const [activeSession, setActiveSession] = useState<SessionInfo | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [milestones, setMilestones] = useState(initialMilestones)
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneInfo | null>(
    initialMilestones.length > 0 ? initialMilestones[0] : null
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle session selection from list
  const handleSelectSession = (sessionNumber: number) => {
    const session = sessions.find(s => s.session_number === sessionNumber)
    if (!session || session.status === 'locked') return

    setActiveSession(session)

    if (session.status === 'completed' && session.conversation_id) {
      // Load existing conversation for completed sessions
      loadConversation(session.conversation_id)
      setView('chat')
    } else {
      // Show entry ritual for new/in-progress sessions
      setView('entry-ritual')
    }
  }

  // Direct API call for auto-greeting (bypasses state timing issues)
  const triggerAutoGreeting = async (sessionNum: number) => {
    const greetings: Record<string, string> = {
      pt: 'Olá, estou pronta para começar esta sessão.',
      en: 'Hi, I\'m ready to start this session.',
      es: 'Hola, estoy lista para empezar esta sesión.',
      fr: 'Bonjour, je suis prête à commencer cette session.',
    }
    const greetingText = greetings[language] || greetings.pt

    const assistantId = crypto.randomUUID()
    setMessages([{ id: assistantId, role: 'assistant', content: '' }])
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: greetingText,
          conversationId: null,
          mirrorSlug: mirror.slug,
          sessionNumber: sessionNum,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) {
        let errorData: { error?: string } = {}
        try { errorData = await res.json() } catch { /* non-JSON */ }
        setMessages([{ id: assistantId, role: 'assistant', content: errorData.error || 'Erro ao iniciar sessão. Tenta enviar uma mensagem.' }])
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
                    prev.map(m => m.id === assistantId ? { ...m, content: m.content + data.text } : m)
                  )
                }
                if (data.conversationId) {
                  setConversationId(data.conversationId)
                }
              } catch { /* ignore parse errors */ }
            }
          }
        }
      }
    } catch (err) {
      console.error('Auto-greeting error:', err)
      setMessages([{
        id: assistantId,
        role: 'assistant',
        content: language === 'pt' ? 'Erro de conexão. Envia uma mensagem para começar.' : 'Connection error. Send a message to start.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Start session after ritual
  const handleEnterChat = async () => {
    if (!activeSession) return

    // Mark session as started
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        mirrorSlug: mirror.slug,
        sessionNumber: activeSession.session_number,
      }),
    })

    setMessages([])
    setConversationId(null)
    setMessageCount(0)
    setView('chat')

    // Fire auto-greeting directly (no useEffect needed)
    triggerAutoGreeting(activeSession.session_number)
  }

  // Skip ritual, go straight to chat
  const handleSkipRitual = async () => {
    if (!activeSession) return

    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        mirrorSlug: mirror.slug,
        sessionNumber: activeSession.session_number,
      }),
    })

    setMessages([])
    setConversationId(null)
    setMessageCount(0)
    setView('chat')

    // Fire auto-greeting directly
    triggerAutoGreeting(activeSession.session_number)
  }

  // End session - show exit ritual
  const handleEndSession = () => {
    setView('exit-ritual')
  }

  // Save insight and complete session
  const handleSaveInsight = async (insight: string) => {
    if (!activeSession) return
    await completeCurrentSession(insight)
  }

  // Skip exit ritual
  const handleSkipExit = async () => {
    if (!activeSession) return
    await completeCurrentSession()
  }

  // Complete session logic
  const completeCurrentSession = async (exitInsight?: string) => {
    if (!activeSession) return

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'complete',
        mirrorSlug: mirror.slug,
        sessionNumber: activeSession.session_number,
        conversationId,
        exitInsight,
        language,
      }),
    })

    const data = await res.json()

    // Update sessions list
    setSessions(prev => prev.map(s => {
      if (s.session_number === activeSession.session_number) {
        return { ...s, status: 'completed' as const, conversation_id: conversationId }
      }
      if (data.nextSession && s.session_number === data.nextSession) {
        return { ...s, status: 'available' as const }
      }
      return s
    }))

    // Show milestones if any
    if (data.milestones && data.milestones.length > 0) {
      setMilestones(data.milestones)
      setCurrentMilestone(data.milestones[0])
    }

    setView('sessions')
    setActiveSession(null)
  }

  // Dismiss milestone
  const handleDismissMilestone = async () => {
    if (!currentMilestone) return

    await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMilestoneId: currentMilestone.id }),
    })

    const remaining = milestones.filter(m => m.id !== currentMilestone.id)
    setMilestones(remaining)
    setCurrentMilestone(remaining.length > 0 ? remaining[0] : null)
  }

  // Load existing conversation
  const loadConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setConversationId(convId)
        setMessageCount(data.messages?.length || 0)
      }
    } catch (err) {
      console.error('Failed to load conversation:', err)
    }
  }

  // Core message sending logic (reusable)
  const sendMessage = useCallback(async (messageText: string, isAutoGreeting = false) => {
    if (isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText
    }

    // For auto-greetings, don't show the user message in the chat
    if (!isAutoGreeting) {
      setMessages(prev => [...prev, userMessage])
    }
    setIsLoading(true)
    setMessageCount(prev => prev + 1)

    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationId,
          mirrorSlug: mirror.slug,
          sessionNumber: activeSession?.session_number,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) {
        let errorData: { error?: string } = {}
        try { errorData = await res.json() } catch { /* non-JSON response */ }
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
      let receivedText = false

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

                if (data.error) {
                  // Handle streaming errors from the API
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantId
                        ? { ...m, content: language === 'pt' ? `Erro: ${data.error}. Tenta novamente.` : `Error: ${data.error}. Please try again.` }
                        : m
                    )
                  )
                  receivedText = true
                }

                if (data.text) {
                  receivedText = true
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
                }

                if (data.done) {
                  setMessageCount(prev => prev + 1)
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }

      // If stream ended without any text, show error
      if (!receivedText) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: language === 'pt' ? 'Sem resposta do servidor. Tenta novamente.' : 'No response from server. Please try again.' }
              : m
          )
        )
      }
    } catch (err) {
      console.error('Chat error:', err)
      const errorMsg = err instanceof DOMException && err.name === 'AbortError'
        ? (language === 'pt' ? 'A resposta demorou demasiado. Tenta novamente.' : 'Response timed out. Please try again.')
        : (language === 'pt' ? 'Erro de conexão. Tenta novamente.' : 'Connection error. Please try again.')
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: errorMsg }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, conversationId, mirror.slug, activeSession?.session_number])

  // Send message from form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  // Back to sessions from chat
  const handleBackToSessions = () => {
    if (activeSession && activeSession.status !== 'completed' && messageCount > 0) {
      // If session was in progress and has messages, show exit ritual
      setView('exit-ritual')
    } else {
      setView('sessions')
      setActiveSession(null)
    }
  }

  const description = mirror.descriptions[language] || mirror.descriptions.en

  // Milestone overlay (shows on top of everything)
  if (currentMilestone) {
    return (
      <MilestoneOverlay
        milestone={currentMilestone}
        language={language}
        onDismiss={handleDismissMilestone}
      />
    )
  }

  // Entry Ritual
  if (view === 'entry-ritual' && activeSession) {
    return (
      <EntryRitual
        mirror={mirror}
        sessionTitle={activeSession.title}
        ritualPrompt={RITUAL_CONTENT[mirror.slug][language]}
        language={language}
        onEnter={handleEnterChat}
        onSkip={handleSkipRitual}
      />
    )
  }

  // Exit Ritual
  if (view === 'exit-ritual' && activeSession) {
    return (
      <ExitRitual
        mirror={mirror}
        language={language}
        onSaveInsight={handleSaveInsight}
        onSkip={handleSkipExit}
      />
    )
  }

  // Session List
  if (view === 'sessions') {
    return (
      <div className="h-full overflow-y-auto" style={{ backgroundColor: '#ddd8cf' }}>
        {/* Streak badge */}
        {streakCount > 0 && (
          <div className="flex justify-center pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs" style={{ backgroundColor: '#f0ece6', color: '#7a746b' }}>
              <span style={{ color: '#f59e0b' }}>&#9632;</span>
              {streakCount} {language === 'pt' ? 'dias seguidos' : language === 'es' ? 'días seguidos' : language === 'fr' ? 'jours consécutifs' : 'day streak'}
            </div>
          </div>
        )}
        <SessionList
          mirror={mirror}
          sessions={sessions}
          language={language}
          onSelectSession={handleSelectSession}
        />
      </div>
    )
  }

  // Chat view
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `2px solid ${mirror.color}25`, backgroundColor: '#f0ece6' }}
      >
        <button
          onClick={handleBackToSessions}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: '#7a746b' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${mirror.color}15` }}>
          <Image src={mirror.logo} alt={mirror.name} width={28} height={28} className="rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-semibold text-sm" style={{ color: mirror.color }}>
            {activeSession?.title || mirror.name}
          </h1>
          <p className="text-xs truncate" style={{ color: '#7a746b' }}>
            {activeSession ? `${mirror.name} · ${language === 'pt' ? 'Sessão' : 'Session'} ${activeSession.session_number}` : description}
          </p>
        </div>
        {activeSession && activeSession.status !== 'completed' && messageCount >= 4 && (
          <button
            onClick={handleEndSession}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: `${mirror.color}15`, color: mirror.color }}
          >
            {language === 'pt' ? 'Terminar' : language === 'es' ? 'Terminar' : language === 'fr' ? 'Terminer' : 'End'}
          </button>
        )}
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
                {activeSession?.title || mirror.name}
              </h2>
              <p style={{ color: '#7a746b' }}>{activeSession?.subtitle || description}</p>
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
  )
}

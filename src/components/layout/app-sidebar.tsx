'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MIRROR_LIST } from '@/lib/ai/mirrors'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface AppSidebarProps {
  user: User
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Painel', href: '/dashboard', icon: 'grid' },
    { label: 'Espelhos', href: '/mirrors', icon: 'layers' },
    { label: 'Definições', href: '/settings', icon: 'settings' },
  ]

  const NavIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'grid':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        )
      case 'layers':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        )
      case 'settings':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        )
      default:
        return null
    }
  }

  const sidebarContent = (
    <>
      {/* Header — ANIMA branding */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: '#3d3530' }}>
        <Image
          src="/logos/anima-logo.png"
          alt="ANIMA"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <span className="text-lg font-heading font-semibold tracking-wide" style={{ color: '#c9a96e' }}>
          ANIMA
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "text-[#c9a96e]"
                  : "text-[#a89f94] hover:text-[#ede9e3] hover:bg-[#3d3530]"
              )}
              style={isActive ? { backgroundColor: '#3d3530' } : undefined}
            >
              <NavIcon type={item.icon} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Mirror Links */}
        <div className="pt-5 pb-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#6a6259' }}>
            Espelhos
          </p>
        </div>

        {MIRROR_LIST.map((mirror) => {
          const isActive = pathname === `/chat/${mirror.slug}`
          return (
            <Link
              key={mirror.slug}
              href={`/chat/${mirror.slug}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "text-[#ede9e3]"
                  : "text-[#a89f94] hover:text-[#ede9e3] hover:bg-[#3d3530]"
              )}
              style={isActive ? { backgroundColor: `${mirror.color}20`, borderLeft: `3px solid ${mirror.color}` } : undefined}
            >
              <Image
                src={mirror.logo}
                alt={mirror.name}
                width={28}
                height={28}
                className="rounded-md"
              />
              <span>{mirror.name}</span>
              {mirror.isPremium && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#3d3530', color: '#6a6259' }}>
                  PRO
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t" style={{ borderColor: '#3d3530' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: '#9a7b50', color: '#fff' }}
          >
            {user.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#ede9e3' }}>
              {user.email}
            </p>
            <button
              onClick={handleSignOut}
              className="text-xs hover:underline"
              style={{ color: '#6a6259' }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
        style={{ backgroundColor: '#2a2520', color: '#c9a96e' }}
        aria-label="Abrir menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-72 h-full flex flex-col"
            style={{ backgroundColor: '#2a2520' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ color: '#6a6259' }}
              aria-label="Fechar menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col md:w-64 md:shrink-0"
        style={{ backgroundColor: '#2a2520' }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

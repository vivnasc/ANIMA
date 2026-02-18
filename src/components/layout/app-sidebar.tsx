'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MIRROR_LIST } from '@/lib/ai/mirrors'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AppSidebarProps {
  user: User
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    {
      label: 'Painel',
      href: '/dashboard',
      icon: '📊',
    },
    {
      label: 'Espelhos',
      href: '/mirrors',
      icon: '🪞',
    },
  ]

  return (
    <aside className={cn(
      "flex flex-col border-r border-border bg-card transition-all duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            ANIMA
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Mirror Links */}
        {!collapsed && (
          <div className="pt-4">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Espelhos
            </p>
          </div>
        )}

        {MIRROR_LIST.map((mirror) => (
          <Link
            key={mirror.slug}
            href={`/chat/${mirror.slug}`}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === `/chat/${mirror.slug}`
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            style={{
              backgroundColor: pathname === `/chat/${mirror.slug}` ? `${mirror.color}15` : undefined,
              borderLeft: pathname === `/chat/${mirror.slug}` ? `3px solid ${mirror.color}` : '3px solid transparent',
            }}
          >
            <span className="text-lg">{mirror.icon}</span>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <span>{mirror.name}</span>
                {mirror.isPremium && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    PRO
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {user.email?.[0]?.toUpperCase() || '?'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <button
                onClick={handleSignOut}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

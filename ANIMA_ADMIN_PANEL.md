# 🎛️ ANIMA - ADMIN PANEL SPECIFICATIONS

**Documento:** Painel de Administração Completo  
**Data:** 18 Fevereiro 2026  
**Acesso:** `/admin` (role: admin apenas)

---

## 📋 ÍNDICE

1. [Autenticação & Acesso](#autenticação--acesso)
2. [Dashboard Principal](#dashboard-principal)
3. [Users Management](#users-management)
4. [Conversations Monitor](#conversations-monitor)
5. [Insights Wall Moderation](#insights-wall-moderation)
6. [Círculos Management](#círculos-management)
7. [Jornadas Guiadas](#jornadas-guiadas)
8. [Email Management](#email-management)
9. [Subscriptions & Revenue](#subscriptions--revenue)
10. [Ghost Content](#ghost-content)
11. [Analytics Dashboard](#analytics-dashboard)
12. [Settings](#settings)

---

## 1. AUTENTICAÇÃO & ACESSO

### Database Schema - Admin Roles

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
-- Possible values: 'user' | 'admin' | 'moderator'

-- Create admin users (manual, initial setup)
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@anima.app'; -- replace with actual admin email

-- Index for performance
CREATE INDEX idx_users_role ON users(role);
```

### Middleware Protection

```typescript
// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Check if route is admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Not logged in - redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userData?.role !== 'admin' && userData?.role !== 'moderator') {
      // Not admin - redirect to app
      return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*']
}
```

### Admin Layout

```typescript
// app/(admin)/layout.tsx

import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 2. DASHBOARD PRINCIPAL

### Route

```typescript
// app/(admin)/admin/page.tsx

import { Suspense } from 'react'
import { MetricsCards } from '@/components/admin/metrics-cards'
import { GrowthChart } from '@/components/admin/growth-chart'
import { AlertsPanel } from '@/components/admin/alerts-panel'
import { RecentActivity } from '@/components/admin/recent-activity'

export default async function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma ANIMA
        </p>
      </div>
      
      {/* Metrics Cards */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsCards />
      </Suspense>
      
      {/* Growth Chart */}
      <Suspense fallback={<ChartSkeleton />}>
        <GrowthChart period="30d" />
      </Suspense>
      
      {/* Alerts */}
      <Suspense fallback={<AlertsSkeleton />}>
        <AlertsPanel />
      </Suspense>
      
      {/* Recent Activity */}
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity limit={10} />
      </Suspense>
    </div>
  )
}
```

### Metrics Cards Component

```typescript
// components/admin/metrics-cards.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTodayMetrics } from '@/lib/admin/metrics'
import { Users, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'

export async function MetricsCards() {
  const metrics = await getTodayMetrics()
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.newUsersToday > 0 ? '+' : ''}{metrics.newUsersToday} hoje
          </p>
        </CardContent>
      </Card>
      
      {/* Premium Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Premium</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.premiumUsers}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.newPremiumToday > 0 ? '+' : ''}{metrics.newPremiumToday} hoje
          </p>
        </CardContent>
      </Card>
      
      {/* Monthly Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MRR</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{metrics.mrr}</div>
          <p className="text-xs text-muted-foreground">
            +€{metrics.mrrGrowth} este mês
          </p>
        </CardContent>
      </Card>
      
      {/* Churn Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.churnRate}%</div>
          <p className="text-xs text-muted-foreground">
            {metrics.churnChange > 0 ? '+' : ''}{metrics.churnChange}% vs last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Metrics Query Functions

```typescript
// lib/admin/metrics.ts

import { createClient } from '@/lib/supabase/server'

export async function getTodayMetrics() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  
  // New users today
  const { count: newUsersToday } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today)
  
  // Premium users
  const { count: premiumUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_tier', 'premium')
    .eq('subscription_status', 'active')
  
  // New premium today
  const { count: newPremiumToday } = await supabase
    .from('subscription_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'activated')
    .gte('created_at', today)
  
  // MRR (Monthly Recurring Revenue)
  const mrr = (premiumUsers || 0) * 19
  
  // MRR growth this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count: newPremiumThisMonth } = await supabase
    .from('subscription_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'activated')
    .gte('created_at', startOfMonth.toISOString())
  
  const mrrGrowth = (newPremiumThisMonth || 0) * 19
  
  // Churn rate (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: cancelledLast30 } = await supabase
    .from('subscription_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'cancelled')
    .gte('created_at', thirtyDaysAgo.toISOString())
  
  const churnRate = premiumUsers > 0 
    ? ((cancelledLast30 || 0) / premiumUsers * 100).toFixed(1)
    : 0
  
  return {
    totalUsers: totalUsers || 0,
    newUsersToday: newUsersToday || 0,
    premiumUsers: premiumUsers || 0,
    newPremiumToday: newPremiumToday || 0,
    mrr,
    mrrGrowth,
    churnRate: Number(churnRate),
    churnChange: 0 // TODO: calculate vs previous period
  }
}
```

---

## 3. USERS MANAGEMENT

### Route

```typescript
// app/(admin)/admin/users/page.tsx

import { Suspense } from 'react'
import { UsersTable } from '@/components/admin/users-table'
import { UsersFilters } from '@/components/admin/users-filters'

export default async function UsersPage({
  searchParams
}: {
  searchParams: { 
    tier?: string
    phase?: string
    search?: string
    page?: string
  }
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Gestão de todos os utilizadores da plataforma
        </p>
      </div>
      
      <UsersFilters />
      
      <Suspense fallback={<TableSkeleton />}>
        <UsersTable 
          tier={searchParams.tier}
          phase={searchParams.phase}
          search={searchParams.search}
          page={Number(searchParams.page) || 1}
        />
      </Suspense>
    </div>
  )
}
```

### Users Table Component

```typescript
// components/admin/users-table.tsx

import { getUsersForAdmin } from '@/lib/admin/users'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export async function UsersTable({
  tier,
  phase,
  search,
  page = 1
}: {
  tier?: string
  phase?: string
  search?: string
  page?: number
}) {
  const { users, total } = await getUsersForAdmin({
    tier,
    phase,
    search,
    page,
    pageSize: 20
  })
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Tier</th>
              <th className="p-4 text-left font-medium">Phase</th>
              <th className="p-4 text-left font-medium">Conversas</th>
              <th className="p-4 text-left font-medium">Último Acesso</th>
              <th className="p-4 text-left font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <Badge variant={user.subscription_tier === 'premium' ? 'default' : 'secondary'}>
                    {user.subscription_tier}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge variant="outline">
                    {user.journey?.current_phase || 'foundation'}
                  </Badge>
                </td>
                <td className="p-4">
                  {user.journey?.total_conversations || 0}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {user.last_active_at 
                    ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                    : 'Nunca'
                  }
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/users/${user.id}`}>
                      Ver Perfil
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total} users
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={page === 1}
            asChild
          >
            <Link href={`?page=${page - 1}`}>Anterior</Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={page * 20 >= total}
            asChild
          >
            <Link href={`?page=${page + 1}`}>Próximo</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### User Profile Page

```typescript
// app/(admin)/admin/users/[id]/page.tsx

import { getUserProfile } from '@/lib/admin/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default async function UserProfilePage({
  params
}: {
  params: { id: string }
}) {
  const user = await getUserProfile(params.id)
  
  if (!user) {
    return <div>User not found</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.email}</h1>
          <p className="text-muted-foreground">User ID: {user.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Send Email</Button>
          <Button variant="outline">View Conversations</Button>
        </div>
      </div>
      
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informação Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tier:</span>
            <Badge variant={user.subscription_tier === 'premium' ? 'default' : 'secondary'}>
              {user.subscription_tier}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
              {user.subscription_status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Criado:</span>
            <span>{format(new Date(user.created_at), 'dd MMM yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Último acesso:</span>
            <span>
              {user.last_active_at 
                ? format(new Date(user.last_active_at), 'dd MMM yyyy HH:mm')
                : 'Nunca'
              }
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Journey Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Jornada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Fase Atual:</span>
            <Badge variant="outline">{user.journey?.current_phase || 'foundation'}</Badge>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">SOMA</p>
              <p className="text-2xl font-bold">{user.journey?.soma_conversations || 0}</p>
              <p className="text-xs text-muted-foreground">conversas</p>
            </div>
            <div>
              <p className="text-sm font-medium">SEREN</p>
              <p className="text-2xl font-bold">{user.journey?.seren_conversations || 0}</p>
              <p className="text-xs text-muted-foreground">conversas</p>
            </div>
            <div>
              <p className="text-sm font-medium">LUMA</p>
              <p className="text-2xl font-bold">{user.journey?.luma_conversations || 0}</p>
              <p className="text-xs text-muted-foreground">conversas</p>
            </div>
            <div>
              <p className="text-sm font-medium">ECHO</p>
              <p className="text-2xl font-bold">{user.journey?.echo_conversations || 0}</p>
              <p className="text-xs text-muted-foreground">conversas</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Padrões identificados:</span>
              <span className="font-medium">{user.patterns?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Badges desbloqueados:</span>
              <span className="font-medium">{user.badges?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Insights partilhados:</span>
              <span className="font-medium">{user.shared_insights?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {user.recent_activity?.length > 0 ? (
            <ul className="space-y-2">
              {user.recent_activity.map((activity, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(activity.created_at), 'dd MMM HH:mm')}
                  </span>
                  <span>•</span>
                  <span>{activity.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sem atividade recente</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 4. CONVERSATIONS MONITOR

### Route

```typescript
// app/(admin)/admin/conversations/page.tsx

import { Suspense } from 'react'
import { ConversationsTable } from '@/components/admin/conversations-table'
import { ConversationsFilters } from '@/components/admin/conversations-filters'
import { ConversationStats } from '@/components/admin/conversation-stats'

export default async function ConversationsPage({
  searchParams
}: {
  searchParams: {
    mirror?: string
    period?: string
    page?: string
  }
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conversations Monitor</h1>
        <p className="text-muted-foreground">
          Monitorização de conversas para quality control
        </p>
      </div>
      
      <Suspense fallback={<StatsSkeleton />}>
        <ConversationStats />
      </Suspense>
      
      <ConversationsFilters />
      
      <Suspense fallback={<TableSkeleton />}>
        <ConversationsTable
          mirror={searchParams.mirror}
          period={searchParams.period}
          page={Number(searchParams.page) || 1}
        />
      </Suspense>
    </div>
  )
}
```

### Conversation Detail Modal

```typescript
// components/admin/conversation-detail.tsx

'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export function ConversationDetail({
  conversationId,
  open,
  onOpenChange
}: {
  conversationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (conversationId && open) {
      setLoading(true)
      fetch(`/api/admin/conversations/${conversationId}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data.messages)
          setLoading(false)
        })
    }
  }, [conversationId, open])
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conversation Details</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {message.role}
                      </Badge>
                      <span className="text-xs opacity-70">
                        {format(new Date(message.created_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 5. INSIGHTS WALL MODERATION

### Route

```typescript
// app/(admin)/admin/insights/page.tsx

import { Suspense } from 'react'
import { PendingInsights } from '@/components/admin/pending-insights'
import { InsightsStats } from '@/components/admin/insights-stats'
import { RecentInsights } from '@/components/admin/recent-insights'

export default async function InsightsModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Insights Wall Moderation</h1>
        <p className="text-muted-foreground">
          Modera conteúdo partilhado pelos users
        </p>
      </div>
      
      <Suspense fallback={<StatsSkeleton />}>
        <InsightsStats />
      </Suspense>
      
      <Suspense fallback={<InsightsSkeleton />}>
        <PendingInsights />
      </Suspense>
      
      <Suspense fallback={<InsightsSkeleton />}>
        <RecentInsights limit={20} />
      </Suspense>
    </div>
  )
}
```

### Pending Insights Component

```typescript
// components/admin/pending-insights.tsx

import { getPendingInsights } from '@/lib/admin/insights'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, AlertTriangle } from 'lucide-react'
import { ApproveInsightButton } from './approve-insight-button'
import { RejectInsightButton } from './reject-insight-button'

export async function PendingInsights() {
  const insights = await getPendingInsights()
  
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aguardam Moderação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Sem insights pendentes</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Aguardam Moderação ({insights.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {insight.mirror_slug.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {insight.user_email}
                </span>
                <span className="text-xs text-muted-foreground">
                  há {formatDistanceToNow(new Date(insight.created_at))}
                </span>
              </div>
              
              {insight.is_flagged && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Flagged
                </Badge>
              )}
            </div>
            
            <blockquote className="italic text-base border-l-4 border-primary pl-4">
              "{insight.insight_text}"
            </blockquote>
            
            <div className="flex gap-2">
              <ApproveInsightButton insightId={insight.id} />
              <RejectInsightButton insightId={insight.id} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

### Approve/Reject Actions

```typescript
// components/admin/approve-insight-button.tsx

'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ApproveInsightButton({ insightId }: { insightId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  async function handleApprove() {
    setLoading(true)
    
    try {
      const res = await fetch(`/api/admin/insights/${insightId}/approve`, {
        method: 'POST'
      })
      
      if (!res.ok) throw new Error('Failed to approve')
      
      toast.success('Insight aprovado')
      router.refresh()
    } catch (error) {
      toast.error('Erro ao aprovar insight')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button
      size="sm"
      onClick={handleApprove}
      disabled={loading}
    >
      <Check className="h-4 w-4 mr-1" />
      Aprovar
    </Button>
  )
}
```

### API Route - Approve Insight

```typescript
// app/api/admin/insights/[id]/approve/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  // Check admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (userData?.role !== 'admin' && userData?.role !== 'moderator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Approve insight
  const { error } = await supabase
    .from('shared_insights')
    .update({ 
      is_approved: true,
      is_flagged: false 
    })
    .eq('id', params.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
```

---

## 6. CÍRCULOS MANAGEMENT

### Database Schema Additions

```sql
-- Add moderation fields to circles if not exist
ALTER TABLE circles ADD COLUMN IF NOT EXISTS moderator_ids UUID[];
ALTER TABLE circles ADD COLUMN IF NOT EXISTS auto_approve_responses BOOLEAN DEFAULT true;

-- Add admin notes to circle_responses
ALTER TABLE circle_responses ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE circle_responses ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);
ALTER TABLE circle_responses ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
```

### Route

```typescript
// app/(admin)/admin/circles/page.tsx

import { Suspense } from 'react'
import { CirclesList } from '@/components/admin/circles-list'
import { CreateThreadButton } from '@/components/admin/create-thread-button'

export default async function CirclesManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Círculos Management</h1>
          <p className="text-muted-foreground">
            Gere círculos, threads e modera respostas
          </p>
        </div>
        <CreateThreadButton />
      </div>
      
      <Suspense fallback={<CirclesSkeleton />}>
        <CirclesList />
      </Suspense>
    </div>
  )
}
```

### Create Weekly Thread

```typescript
// components/admin/create-thread-form.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CreateThreadForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      circle_id: formData.get('circle_id'),
      title: formData.get('title'),
      prompt: formData.get('prompt'),
      week_number: formData.get('week_number'),
      starts_at: new Date(formData.get('starts_at') as string).toISOString(),
      ends_at: new Date(formData.get('ends_at') as string).toISOString()
    }
    
    try {
      const res = await fetch('/api/admin/circles/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!res.ok) throw new Error('Failed to create thread')
      
      toast.success('Thread criado com sucesso')
      router.refresh()
      router.push('/admin/circles')
    } catch (error) {
      toast.error('Erro ao criar thread')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Thread Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="circle_id">Círculo</Label>
            <Select name="circle_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Seleciona círculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soma-circle">🌱 Círculo SOMA</SelectItem>
                <SelectItem value="seren-circle">🌊 Círculo SEREN</SelectItem>
                <SelectItem value="luma-circle">✨ Círculo LUMA</SelectItem>
                <SelectItem value="echo-circle">🔊 Círculo ECHO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="week_number">Semana do Mês</Label>
            <Select name="week_number" required>
              <SelectTrigger>
                <SelectValue placeholder="Seleciona semana" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semana 1</SelectItem>
                <SelectItem value="2">Semana 2</SelectItem>
                <SelectItem value="3">Semana 3</SelectItem>
                <SelectItem value="4">Semana 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="title">Título do Thread</Label>
            <Input
              id="title"
              name="title"
              placeholder="ex: Ansiedade Como Mensageira"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="prompt">Prompt/Pergunta</Label>
            <Textarea
              id="prompt"
              name="prompt"
              placeholder="Escreve a pergunta guia para a semana..."
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="starts_at">Data Início</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="date"
                required
              />
            </div>
            <div>
              <Label htmlFor="ends_at">Data Fim</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="date"
                required
              />
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Criando...' : 'Criar Thread'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## 7. JORNADAS GUIADAS

### Route

```typescript
// app/(admin)/admin/journeys/page.tsx

import { Suspense } from 'react'
import { JourneysList } from '@/components/admin/journeys-list'
import { JourneysStats } from '@/components/admin/journeys-stats'
import { CreateJourneyButton } from '@/components/admin/create-journey-button'

export default async function JourneysManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jornadas Guiadas</h1>
          <p className="text-muted-foreground">
            Gere jornadas e edita prompts diários
          </p>
        </div>
        <CreateJourneyButton />
      </div>
      
      <Suspense fallback={<StatsSkeleton />}>
        <JourneysStats />
      </Suspense>
      
      <Suspense fallback={<JourneysSkeleton />}>
        <JourneysList />
      </Suspense>
    </div>
  )
}
```

### Edit Journey Prompts

```typescript
// app/(admin)/admin/journeys/[id]/edit/page.tsx

import { getJourneyForEdit } from '@/lib/admin/journeys'
import { EditPromptsForm } from '@/components/admin/edit-prompts-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function EditJourneyPage({
  params
}: {
  params: { id: string }
}) {
  const journey = await getJourneyForEdit(params.id)
  
  if (!journey) {
    return <div>Journey not found</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/journeys">
            <Button variant="ghost" size="sm">← Voltar</Button>
          </Link>
          <h1 className="text-3xl font-bold mt-2">{journey.name}</h1>
          <p className="text-muted-foreground">
            {journey.duration_days} dias • {journey.mirror_slug?.toUpperCase() || 'All Mirrors'}
          </p>
        </div>
      </div>
      
      <EditPromptsForm journey={journey} />
    </div>
  )
}
```

---

## 8. EMAIL MANAGEMENT

### Route

```typescript
// app/(admin)/admin/emails/page.tsx

import { Suspense } from 'react'
import { EmailStats } from '@/components/admin/email-stats'
import { EmailTemplates } from '@/components/admin/email-templates'
import { SendTestEmailButton } from '@/components/admin/send-test-email-button'

export default async function EmailManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">
            Gere templates e monitora performance
          </p>
        </div>
        <SendTestEmailButton />
      </div>
      
      <Suspense fallback={<StatsSkeleton />}>
        <EmailStats period="7d" />
      </Suspense>
      
      <Suspense fallback={<TemplatesSkeleton />}>
        <EmailTemplates />
      </Suspense>
    </div>
  )
}
```

---

## 9. SUBSCRIPTIONS & REVENUE

### Route

```typescript
// app/(admin)/admin/subscriptions/page.tsx

import { Suspense } from 'react'
import { RevenueMetrics } from '@/components/admin/revenue-metrics'
import { SubscriptionsList } from '@/components/admin/subscriptions-list'
import { ChurnAnalysis } from '@/components/admin/churn-analysis'
import { ReferralStats } from '@/components/admin/referral-stats'

export default async function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions & Revenue</h1>
        <p className="text-muted-foreground">
          Monitora receita, churn e referrals
        </p>
      </div>
      
      <Suspense fallback={<MetricsSkeleton />}>
        <RevenueMetrics />
      </Suspense>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <ChurnAnalysis />
        </Suspense>
        
        <Suspense fallback={<CardSkeleton />}>
          <ReferralStats />
        </Suspense>
      </div>
      
      <Suspense fallback={<TableSkeleton />}>
        <SubscriptionsList />
      </Suspense>
    </div>
  )
}
```

---

## 10. GHOST CONTENT

### Route

```typescript
// app/(admin)/admin/ghosts/page.tsx

import { Suspense } from 'react'
import { GhostPersonas } from '@/components/admin/ghost-personas'
import { CreateGhostButton } from '@/components/admin/create-ghost-button'

export default async function GhostContentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ghost Content</h1>
          <p className="text-muted-foreground">
            Gere personas ghost e conteúdo curado
          </p>
        </div>
        <CreateGhostButton />
      </div>
      
      <Suspense fallback={<GhostsSkeleton />}>
        <GhostPersonas />
      </Suspense>
    </div>
  )
}
```

### Add Ghost Insight Form

```typescript
// components/admin/add-ghost-insight-form.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function AddGhostInsightForm({ 
  ghostPersona 
}: { 
  ghostPersona: string 
}) {
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      ghost_persona: ghostPersona,
      mirror_slug: formData.get('mirror_slug'),
      insight_text: formData.get('insight_text'),
      initial_resonances: Number(formData.get('initial_resonances'))
    }
    
    try {
      const res = await fetch('/api/admin/ghosts/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!res.ok) throw new Error('Failed')
      
      toast.success('Insight ghost criado')
      setText('')
    } catch (error) {
      toast.error('Erro ao criar insight')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="mirror_slug">Mirror</Label>
        <Select name="mirror_slug" required>
          <SelectTrigger>
            <SelectValue placeholder="Seleciona mirror" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="soma">🌱 SOMA</SelectItem>
            <SelectItem value="seren">🌊 SEREN</SelectItem>
            <SelectItem value="luma">✨ LUMA</SelectItem>
            <SelectItem value="echo">🔊 ECHO</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="insight_text">Insight (max 280 chars)</Label>
        <Textarea
          id="insight_text"
          name="insight_text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          rows={4}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {text.length}/280 caracteres
        </p>
      </div>
      
      <div>
        <Label htmlFor="initial_resonances">Resonances Iniciais (fake seed)</Label>
        <Input
          id="initial_resonances"
          name="initial_resonances"
          type="number"
          min="0"
          max="100"
          defaultValue="15"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Simula engagement inicial (10-50 recomendado)
        </p>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Criando...' : 'Publicar Insight Ghost'}
      </Button>
    </form>
  )
}
```

---

## 11. ANALYTICS DASHBOARD

### Route

```typescript
// app/(admin)/admin/analytics/page.tsx

import { Suspense } from 'react'
import { GrowthChart } from '@/components/admin/growth-chart'
import { ConversionFunnel } from '@/components/admin/conversion-funnel'
import { TopPerformers } from '@/components/admin/top-performers'
import { WeeklyHighlights } from '@/components/admin/weekly-highlights'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function AnalyticsDashboardPage({
  searchParams
}: {
  searchParams: { period?: string }
}) {
  const period = searchParams.period || '30d'
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Análise profunda de métricas e performance
          </p>
        </div>
        
        <Select defaultValue={period}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Suspense fallback={<ChartSkeleton />}>
        <GrowthChart period={period} />
      </Suspense>
      
      <Suspense fallback={<FunnelSkeleton />}>
        <ConversionFunnel period={period} />
      </Suspense>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <TopPerformers period={period} />
        </Suspense>
        
        <Suspense fallback={<CardSkeleton />}>
          <WeeklyHighlights />
        </Suspense>
      </div>
    </div>
  )
}
```

---

## 12. SETTINGS

### Route

```typescript
// app/(admin)/admin/settings/page.tsx

import { Suspense } from 'react'
import { GeneralSettings } from '@/components/admin/general-settings'
import { PricingSettings } from '@/components/admin/pricing-settings'
import { ReferralSettings } from '@/components/admin/referral-settings'
import { NotificationSettings } from '@/components/admin/notification-settings'

export default async function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configurações gerais da plataforma
        </p>
      </div>
      
      <Suspense fallback={<SettingsSkeleton />}>
        <GeneralSettings />
      </Suspense>
      
      <Suspense fallback={<SettingsSkeleton />}>
        <PricingSettings />
      </Suspense>
      
      <Suspense fallback={<SettingsSkeleton />}>
        <ReferralSettings />
      </Suspense>
      
      <Suspense fallback={<SettingsSkeleton />}>
        <NotificationSettings />
      </Suspense>
    </div>
  )
}
```

### Settings Form Example

```typescript
// components/admin/pricing-settings.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function PricingSettings() {
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      free_messages_limit: Number(formData.get('free_messages_limit')),
      premium_price: Number(formData.get('premium_price'))
    }
    
    try {
      const res = await fetch('/api/admin/settings/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!res.ok) throw new Error('Failed')
      
      toast.success('Settings atualizadas')
    } catch (error) {
      toast.error('Erro ao atualizar')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>
          Configura limites e preços
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="free_messages_limit">
              Mensagens Free Tier (por mês)
            </Label>
            <Input
              id="free_messages_limit"
              name="free_messages_limit"
              type="number"
              min="1"
              max="50"
              defaultValue="10"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="premium_price">
              Preço Premium (€/mês)
            </Label>
            <Input
              id="premium_price"
              name="premium_price"
              type="number"
              min="1"
              step="0.01"
              defaultValue="19"
              required
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## 📱 MOBILE RESPONSIVENESS

Todos os componentes admin devem ser **mobile-responsive**:

```typescript
// components/admin/sidebar.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/conversations', label: 'Conversations', icon: '💬' },
  { href: '/admin/insights', label: 'Insights', icon: '🔍' },
  { href: '/admin/circles', label: 'Círculos', icon: '🌐' },
  { href: '/admin/journeys', label: 'Jornadas', icon: '🗺️' },
  { href: '/admin/emails', label: 'Emails', icon: '📧' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💰' },
  { href: '/admin/ghosts', label: 'Ghosts', icon: '👻' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  
  const SidebarContent = () => (
    <nav className="space-y-1 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">ANIMA Admin</h2>
      </div>
      
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === item.href
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r">
        <SidebarContent />
      </aside>
      
      {/* Mobile Sheet */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
```

---

## 🔐 SECURITY BEST PRACTICES

### Rate Limiting for Admin Actions

```typescript
// lib/admin/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const adminRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute for admin
  analytics: true,
  prefix: 'admin'
})

// Usage in admin API routes:
export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success } = await adminRateLimiter.limit(`admin:${ip}`)
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  
  // Continue...
}
```

### Audit Log

```sql
-- Track admin actions
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- 'approve_insight', 'reject_insight', 'ban_user', etc
  resource_type TEXT, -- 'insight', 'user', 'conversation', etc
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_created ON admin_audit_log(created_at DESC);
```

---

## ✅ IMPLEMENTATION CHECKLIST

```
Setup:
[ ] Create admin role in users table
[ ] Implement middleware protection
[ ] Create admin layout + sidebar
[ ] Setup admin routes structure

Core Pages:
[ ] Dashboard (metrics + charts)
[ ] Users management
[ ] Conversations monitor
[ ] Insights moderation
[ ] Círculos management
[ ] Jornadas management
[ ] Email management
[ ] Subscriptions & revenue
[ ] Ghost content
[ ] Analytics
[ ] Settings

Security:
[ ] Role-based access control
[ ] Admin rate limiting
[ ] Audit logging
[ ] CSRF protection

UX:
[ ] Mobile responsive
[ ] Loading states
[ ] Error handling
[ ] Toast notifications
[ ] Confirmation dialogs for destructive actions
```

---

**FIM DO DOCUMENTO - ADMIN PANEL SPECIFICATIONS**

Todas as especificações estão prontas para implementação! 🎛️

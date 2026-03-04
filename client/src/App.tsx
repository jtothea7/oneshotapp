import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { WorkspaceLayout } from '@/components/layout/WorkspaceLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { BillingPage } from '@/pages/BillingPage'
import { OverviewTab } from '@/pages/workspace/OverviewTab'
import { SettingsTab } from '@/pages/workspace/SettingsTab'
import { ResearchTab } from '@/pages/workspace/ResearchTab'
import { GbpTab } from '@/pages/workspace/GbpTab'
import { CrawlTab } from '@/pages/workspace/CrawlTab'
import { GenerateTab } from '@/pages/workspace/GenerateTab'
import { BulkTab } from '@/pages/workspace/BulkTab'
import { PublishTab } from '@/pages/workspace/PublishTab'
import { VideoTab } from '@/pages/workspace/VideoTab'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/billing" element={<BillingPage />} />

        <Route path="/client/:clientId" element={<WorkspaceLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewTab />} />
          <Route path="settings" element={<SettingsTab />} />
          <Route path="research" element={<ResearchTab />} />
          <Route path="gbp" element={<GbpTab />} />
          <Route path="crawl" element={<CrawlTab />} />
          <Route path="generate" element={<GenerateTab />} />
          <Route path="bulk" element={<BulkTab />} />
          <Route path="publish" element={<PublishTab />} />
          <Route path="video" element={<VideoTab />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

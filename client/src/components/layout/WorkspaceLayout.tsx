import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TABS = [
  { path: 'overview', label: 'Overview', icon: '📊' },
  { path: 'settings', label: 'Settings', icon: '⚙️' },
  { path: 'research', label: 'Research', icon: '🔍' },
  { path: 'gbp', label: 'GBP', icon: '📍' },
  { path: 'crawl', label: 'Crawl', icon: '🌐' },
  { path: 'generate', label: 'Generate', icon: '✍️' },
  { path: 'bulk', label: 'Bulk', icon: '📦' },
  { path: 'publish', label: 'Publish', icon: '🚀' },
  { path: 'video', label: 'Video', icon: '🎬' },
] as const

export function WorkspaceLayout() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const activeTab = location.pathname.split('/').pop() || 'overview'

  return (
    <div>
      {/* Client header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-[var(--text-muted)]"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {/* Client name will be fetched in a later chunk */}
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Client Workspace
          </h1>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="mb-6 flex gap-0 border-b border-[var(--border)]">
        {TABS.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(`/client/${clientId}/${tab.path}`)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-all ${
              activeTab === tab.path
                ? 'border-[var(--primary)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <Outlet />
    </div>
  )
}

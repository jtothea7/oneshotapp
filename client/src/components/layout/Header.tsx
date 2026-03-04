import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Settings, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-1)] px-6">
      <button
        onClick={() => navigate('/')}
        className="text-base font-semibold tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity"
      >
        One Shot
      </button>

      <div className="flex items-center gap-3">
        {/* Credit balance — placeholder for Chunk 6 */}
        <button
          onClick={() => navigate('/billing')}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          <span>0 credits</span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/settings')}
          className="text-[var(--text-secondary)]"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-muted)]">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-[var(--text-muted)]">
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

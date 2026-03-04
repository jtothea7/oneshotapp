import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const navigate = useNavigate()

  // Placeholder — will be replaced with real data in Chunk 3
  const clients: { id: string; emoji: string; name: string; url: string; pages: number }[] = []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
          Clients
        </h1>
        <div className="flex gap-2">
          <Button
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Client
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/settings')}
            className="border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]"
          >
            <Settings className="mr-1.5 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card className="border-dashed border-[var(--border)] bg-[var(--card)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-[var(--text-muted)]">No clients yet. Create your first client to get started.</p>
            <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]">
              <Plus className="mr-1.5 h-4 w-4" />
              New Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer border-[var(--card-border)] bg-[var(--card)] transition-all hover:border-[#3f3f46] hover:bg-[var(--card-hover)] hover:shadow-[0_0_0_1px_rgba(124,92,252,0.15),0_8px_24px_rgba(0,0,0,0.3)]"
              onClick={() => navigate(`/client/${client.id}/overview`)}
            >
              <CardContent className="p-6">
                <div className="mb-2 text-2xl">{client.emoji}</div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{client.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">{client.url}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{client.pages} pages</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

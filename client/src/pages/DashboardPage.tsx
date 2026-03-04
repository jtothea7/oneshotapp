import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clients as clientsApi, type Client } from '@/lib/api'

export function DashboardPage() {
  const navigate = useNavigate()
  const [clientList, setClientList] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const data = await clientsApi.list()
      setClientList(data)
    } catch {
      // Will show empty state
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const client = await clientsApi.create({
        businessName: newName.trim(),
        websiteUrl: newUrl.trim() || undefined,
      })
      setDialogOpen(false)
      setNewName('')
      setNewUrl('')
      navigate(`/client/${client.id}/overview`)
    } catch {
      // Error handling
    } finally {
      setCreating(false)
    }
  }

  const NewClientDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]">
          <Plus className="mr-1.5 h-4 w-4" />
          New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[var(--popover-border)] bg-[var(--popover)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">New Client</DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            Create a new client to start building their SEO content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Business name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-[var(--input)] border-[var(--input-border)] text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-focus-border)]"
            autoFocus
          />
          <Input
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="bg-[var(--input)] border-[var(--input-border)] text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-focus-border)]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setDialogOpen(false)}
            className="border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading clients...</p>
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
          Clients
        </h1>
        <div className="flex gap-2">
          {NewClientDialog}
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

      {clientList.length === 0 ? (
        <Card className="border-dashed border-[var(--border)] bg-[var(--card)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-[var(--text-muted)]">No clients yet. Create your first client to get started.</p>
            {NewClientDialog}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientList.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer border-[var(--card-border)] bg-[var(--card)] transition-all hover:border-[#3f3f46] hover:bg-[var(--card-hover)] hover:shadow-[0_0_0_1px_rgba(124,92,252,0.15),0_8px_24px_rgba(0,0,0,0.3)]"
              onClick={() => navigate(`/client/${client.id}/overview`)}
            >
              <CardContent className="p-6">
                <div className="mb-2 text-2xl">{client.emoji}</div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{client.business_name}</h3>
                <p className="text-sm text-[var(--text-muted)]">{client.website_url}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{client.pageCount} pages</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

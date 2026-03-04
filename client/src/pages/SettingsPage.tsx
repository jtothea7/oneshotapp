import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiKeys, type ApiKeyStatus } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Check, X, KeyRound, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_KEY_CONFIG = [
  { service: 'anthropic', label: 'Anthropic (Claude)', placeholder: 'sk-ant-...', description: 'Primary content engine' },
  { service: 'openai', label: 'OpenAI (GPT Image)', placeholder: 'sk-...', description: 'Image generation' },
  { service: 'dataforseo_login', label: 'DataForSEO Login', placeholder: 'Login credential', description: 'SEO research data' },
  { service: 'dataforseo_password', label: 'DataForSEO Password', placeholder: 'Password credential', description: 'SEO research data' },
  { service: 'pictory_client_id', label: 'Pictory Client ID', placeholder: 'Client ID', description: 'Video generation' },
  { service: 'pictory_client_secret', label: 'Pictory Client Secret', placeholder: 'Client Secret', description: 'Video generation' },
  { service: 'zerogpt', label: 'ZeroGPT', placeholder: 'API key', description: 'AI detection' },
  { service: 'google_oauth_client_id', label: 'Google OAuth Client ID', placeholder: 'Client ID', description: 'YouTube upload' },
  { service: 'google_oauth_client_secret', label: 'Google OAuth Client Secret', placeholder: 'Client Secret', description: 'YouTube upload' },
] as const

function ApiKeyRow({
  config,
  status,
  onSave,
}: {
  config: typeof API_KEY_CONFIG[number]
  status: ApiKeyStatus | undefined
  onSave: (service: string, value: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value.trim()) return
    setSaving(true)
    await onSave(config.service, value.trim())
    setValue('')
    setEditing(false)
    setSaving(false)
  }

  const handleCancel = () => {
    setValue('')
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border-subtle)] py-4 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KeyRound className="h-4 w-4 text-[var(--text-muted)]" />
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">{config.label}</div>
            <div className="text-xs text-[var(--text-muted)]">{config.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status?.isSet ? (
            <span className="rounded-full bg-[var(--success-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--success)]">
              {status.maskedValue}
            </span>
          ) : (
            <span className="text-xs text-[var(--text-disabled)]">Not set</span>
          )}
          {!editing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(true)}
              className="border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]"
            >
              {status?.isSet ? 'Update' : 'Set'}
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <div className="flex gap-2 pl-7">
          <Input
            type="password"
            placeholder={config.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 bg-[var(--input)] border-[var(--input-border)] text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-focus-border)]"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !value.trim()}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-[var(--text-muted)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [keys, setKeys] = useState<ApiKeyStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      const data = await apiKeys.list()
      setKeys(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (service: string, value: string) => {
    await apiKeys.set(service, value)
    await loadKeys()
  }

  return (
    <div>
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
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
            Settings
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-[var(--text-muted)]"
        >
          Logout
        </Button>
      </div>

      {/* Account Section */}
      <Card className="mb-6 border-[var(--card-border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
        </CardContent>
      </Card>

      {/* API Keys Section */}
      <Card className="border-[var(--card-border)] bg-[var(--card)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--primary)]" />
            <CardTitle className="text-[var(--text-primary)]">API Keys</CardTitle>
          </div>
          <CardDescription className="text-[var(--text-secondary)]">
            API keys are encrypted and stored securely on the server. They are never exposed in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading API keys...</p>
          ) : error ? (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          ) : (
            <div>
              {API_KEY_CONFIG.map((config) => (
                <ApiKeyRow
                  key={config.service}
                  config={config}
                  status={keys.find((k) => k.service === config.service)}
                  onSave={handleSave}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-[28px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
        Settings
      </h1>
      <Card className="border-[var(--card-border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--text-primary)]">API Keys</CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            API keys are encrypted and stored securely on the server. They are never exposed in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)]">
            API key management will be built in Chunk 2.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

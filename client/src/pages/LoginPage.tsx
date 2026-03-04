import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signInWithEmail(email)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Card className="w-full max-w-md border-[var(--card-border)] bg-[var(--card)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-[var(--text-primary)]">
            One Shot
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Local SEO automation platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center">
              <div className="mb-2 text-lg font-medium text-[var(--success)]">
                Check your email
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                We sent a magic link to <strong className="text-[var(--text-primary)]">{email}</strong>.
                Click the link to sign in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[var(--input)] border-[var(--input-border)] text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-focus-border)]"
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--destructive)]">{error}</p>
              )}
              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
              >
                {loading ? 'Sending...' : 'Login'}
              </Button>
              <p className="text-center text-xs text-[var(--text-muted)]">
                Member of AI SEO Mastery Pro? Use the email from your Skool account.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

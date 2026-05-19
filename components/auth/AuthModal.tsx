'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

type Mode = 'signin' | 'signup'

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reset = () => { setError(null); setInfo(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    reset()
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else { setInfo('Check your email for a confirmation link.'); setEmail(''); setPassword('') }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onClose()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === 'signin' ? 'Sign in' : 'Create account'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          {info  && <p className="text-xs text-muted-foreground">{info}</p>}
          <Button type="submit" className="w-full" disabled={loading || !supabase}>
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); reset() }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        {!supabase && (
          <p className="text-center text-xs text-muted-foreground">
            Auth not configured — set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

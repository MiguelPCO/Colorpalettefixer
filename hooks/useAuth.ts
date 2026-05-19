'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSessionStore } from '@/lib/store/sessionStore'

export function useAuth() {
  const setUserId = useSessionStore((s) => s.setUserId)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUserId])
}

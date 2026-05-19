import { supabase } from '@/lib/supabase/client'
import type { Color } from '@/lib/color/types'

export interface CloudPalette {
  id: string
  name: string
  colors: Color[]
  created_at: string
}

export async function fetchCloudPalettes(): Promise<CloudPalette[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('cloud_palettes')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as CloudPalette[]
}

export async function saveCloudPalette(name: string, colors: Color[]): Promise<CloudPalette | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('cloud_palettes')
    .insert({ name, colors, user_id: user.id })
    .select()
    .single()
  if (error || !data) return null
  return data as CloudPalette
}

export async function deleteCloudPalette(id: string): Promise<void> {
  if (!supabase) return
  await supabase.from('cloud_palettes').delete().eq('id', id)
}

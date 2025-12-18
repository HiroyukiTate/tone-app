import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // iOSでのセッション永続化対応
    persistSession: true,
    storageKey: 'tone-auth',
    storage: window.localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})
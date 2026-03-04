import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

// Service role client — bypasses RLS, for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Anon client — respects RLS, for verifying user tokens
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Use hardcoded values for now (will be replaced with proper environment variables)
// These values come from the secrets already set in Replit
const supabaseUrl = 'https://nlbpvvihxqwnwdgkwfhi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYnB2dmllbnFqd3dkZ2t3ZmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM2NjE0MDksImV4cCI6MTk5OTIzNzQwOX0.GXN9SPo8ljQKTx6qOVS_wH50I6UuztbplfJDK3u3M7I';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type { SupabaseClient };

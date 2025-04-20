import { createClient } from '@supabase/supabase-js';
import { Database } from '../client/src/types/database.types';

// Ensure we have the required environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in server');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
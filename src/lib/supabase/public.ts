import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Anonymous-key client — for public-facing reads/writes.
 * Subject to RLS policies. Use this for contact forms, public reviews, etc.
 * Never use the admin client for unauthenticated user operations.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

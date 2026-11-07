import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Server-side only. The service-role key must never reach the frontend.
export const supabase =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const BUCKETS = ['stories', 'destinations', 'events', 'products', 'artisans', 'businesses'].reduce(
  (acc, name) => ({ ...acc, [name]: `${env.SUPABASE_BUCKET_PREFIX}-${name}` }),
  {},
);

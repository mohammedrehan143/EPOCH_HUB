export { supabase, getSupabaseBrowserClient } from './client';
export { getSupabaseServerClient } from './server';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !url.startsWith('http') || url.includes('your-project') || url.includes('demo-project')) {
    return false;
  }
  if (!anonKey || anonKey.includes('your-anon-key') || anonKey.includes('dummy')) {
    return false;
  }
  return true;
}

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  url?: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials not fully configured in .env. Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    };
  }

  try {
    const { getSupabaseServerClient } = await import('./server');
    const client = getSupabaseServerClient();
    const startTime = Date.now();
    const { data, error } = await client.from('domains').select('count', { count: 'exact', head: true });
    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        connected: false,
        message: `Supabase reached, but query failed: ${error.message}`,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        error: error.message,
      };
    }

    return {
      connected: true,
      message: `Supabase connection active and healthy! (Latency: ${latencyMs}ms)`,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message}`,
      error: err.message,
    };
  }
}

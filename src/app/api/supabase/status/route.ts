import { NextResponse } from 'next/server';
import { isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabase';
import { queryOne } from '@/lib/db';

export async function GET() {
  try {
    const configured = isSupabaseConfigured();
    const conn = configured ? await testSupabaseConnection() : { connected: false, message: 'Supabase credentials not configured in .env' };

    // Get local SQLite record counts for reference
    const localStats = {
      users: queryOne<{ c: number }>('SELECT count(*) as c FROM users')?.c || 0,
      tasks: queryOne<{ c: number }>('SELECT count(*) as c FROM tasks')?.c || 0,
      events: queryOne<{ c: number }>('SELECT count(*) as c FROM events')?.c || 0,
      domains: queryOne<{ c: number }>('SELECT count(*) as c FROM domains')?.c || 0,
      submissions: queryOne<{ c: number }>('SELECT count(*) as c FROM submissions')?.c || 0,
      pointTransactions: queryOne<{ c: number }>('SELECT count(*) as c FROM point_transactions')?.c || 0,
    };

    const supaUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    return NextResponse.json({
      supabase: {
        configured,
        url: supaUrl ? `${supaUrl.slice(0, 15)}...` : null,
        hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        status: conn,
      },
      localDatabase: {
        engine: 'SQLite (WAL Mode)',
        stats: localStats,
      },
      instructions: {
        step1: 'Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file',
        step2: 'Execute supabase/migrations/20261007_init.sql in your Supabase SQL Editor',
        step3: 'Execute supabase/seed.sql or run "npm run supabase:sync" to push all rich demo data',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

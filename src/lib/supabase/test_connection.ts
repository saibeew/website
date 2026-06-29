
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  console.log('URL:', supabaseUrl);

  try {
    // 1. Check Auth Service (by trying to get a session, which handles connection implicitly)
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth Check Failed:', authError.message);
    } else {
      console.log('Auth Service: OK');
    }

    // 2. Check Database Access (fetching from a public table if strict RLS allows, or just checking health)
    // Since we have RLS, we might not see data, but we shouldn't get a connection error.
    const { data, error: dbError } = await supabase.from('strategies').select('count', { count: 'exact', head: true });

    if (dbError) {
       console.log('Database Check (Strategies):', dbError.message); // Might be RLS policy, which is fine for connection check
    } else {
       console.log('Database Check: OK');
    }

    console.log('\n--- Connection Verification Completed ---');

  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

testConnection();

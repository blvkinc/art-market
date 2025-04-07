import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable automatic URL parsing
    flowType: 'pkce',
  },
});

// Simple event counter for debugging
let authEventCount = 0;

// Log authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
  authEventCount++;
  console.log(`Auth event #${authEventCount}:`, event);
  console.log('Session exists:', !!session);
  
  if (session?.user) {
    console.log('User ID:', session.user.id);
  }
});

// Test the connection
(async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error.message);
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (err) {
    console.error('Supabase connection error:', err);
  }
})(); 
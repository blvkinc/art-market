import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: true, // Enable debug mode for auth
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
    console.log('User email:', session.user.email);
    console.log('User metadata:', session.user.user_metadata);
    
    // Test profile access
    (async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          console.log('User profile:', profile);
        }
      } catch (err) {
        console.error('Error in profile fetch:', err);
      }
    })();
  }
});

// Test the connection and database access
(async () => {
  try {
    // Test basic connection
    const { data: profileCount, error: countError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    if (countError) {
      console.error('Supabase connection test failed:', countError.message);
    } else {
      console.log('Supabase connection test successful');
    }
    
    // Test auth configuration
    const { data: authConfig } = await supabase.auth.getSession();
    console.log('Auth configuration:', authConfig);
    
  } catch (err) {
    console.error('Supabase connection error:', err);
  }
})(); 
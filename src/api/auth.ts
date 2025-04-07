import { supabase } from '../lib/supabase';

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { session: data.session, user: data.user, error };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Sign up with email, password, and invitation token
 */
export async function signUp(email: string, password: string, username: string, inviteToken: string) {
  // First verify the invitation token is valid
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', inviteToken)
    .eq('email', email)
    .eq('is_used', false)
    .single();
  
  if (inviteError || !invitation) {
    return { user: null, error: inviteError || new Error('Invalid or expired invitation') };
  }
  
  // If invitation is valid, proceed with signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        invitation_id: invitation.id
      }
    }
  });
  
  if (!error) {
    // Mark invitation as used
    await supabase
      .from('invitations')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', invitation.id);
  }
  
  return { user: data.user, error };
}

/**
 * Request password reset
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
}

/**
 * Update password with recovery token
 */
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password
  });
  
  return { user: data.user, error };
}

/**
 * Get the current session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Set up the OAuth flow for social providers
 */
export async function signInWithProvider(provider: 'google' | 'twitter' | 'github' | 'discord') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
  });
  
  return { data, error };
} 
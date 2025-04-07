import { supabase } from '../lib/supabase';

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(userId: string) {
  const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
  return { isAdmin: !!data, error };
}

/**
 * Get platform statistics
 */
export async function getStats() {
  const [usersResponse, artworksResponse, salesResponse] = await Promise.all([
    supabase.from('profiles').select('count'),
    supabase.from('artworks').select('count'),
    supabase.from('sales').select('price')
  ]);
  
  const totalUsers = usersResponse.count || 0;
  const totalArtworks = artworksResponse.count || 0;
  const totalSales = salesResponse.data?.length || 0;
  const totalRevenue = salesResponse.data?.reduce((sum, sale) => sum + sale.price, 0) || 0;
  
  return {
    totalUsers,
    totalArtworks,
    totalSales,
    totalRevenue,
    error: usersResponse.error || artworksResponse.error || salesResponse.error
  };
}

/**
 * Get all users with pagination
 */
export async function getUsers(limit = 20, page = 0) {
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  
  return { users: data, count, error };
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: 'buyer' | 'seller' | 'admin', limit = 20, page = 0) {
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('user_type', role)
    .order('created_at', { ascending: false })
    .range(from, to);
  
  return { users: data, count, error };
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, role: 'buyer' | 'seller' | 'admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ user_type: role })
    .eq('id', userId)
    .select()
    .single();
  
  return { profile: data, error };
}

/**
 * Get pending artworks that need approval
 */
export async function getPendingArtworks(limit = 20, page = 0) {
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('artworks')
    .select('*, profiles(*)', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .range(from, to);
  
  return { artworks: data, count, error };
}

/**
 * Approve or reject an artwork
 */
export async function moderateArtwork(artworkId: string, approved: boolean) {
  const status = approved ? 'approved' : 'rejected';
  
  const { data, error } = await supabase
    .from('artworks')
    .update({ status })
    .eq('id', artworkId)
    .select();
  
  return { artwork: data ? data[0] : null, error };
}

/**
 * Feature or unfeature an artwork
 */
export async function toggleFeaturedArtwork(artworkId: string, featured: boolean) {
  const { data, error } = await supabase
    .from('artworks')
    .update({ is_featured: featured })
    .eq('id', artworkId)
    .select();
  
  return { artwork: data ? data[0] : null, error };
}

/**
 * Verify or unverify an artist
 */
export async function toggleVerifiedArtist(userId: string, verified: boolean) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: verified })
    .eq('id', userId)
    .select();
  
  return { profile: data ? data[0] : null, error };
}

/**
 * Get recent sales for admin dashboard
 */
export async function getRecentSales(limit = 10) {
  const { data, error } = await supabase
    .from('sales')
    .select('*, artworks(*), profiles!sales_buyer_id_fkey(*), profiles!sales_seller_id_fkey(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { sales: data, error };
}

/**
 * Get sales by time period for charts
 */
export async function getSalesByPeriod(period: 'day' | 'week' | 'month' | 'year') {
  // In a real app, this would be a more complex SQL query
  // using date_trunc or window functions
  const { data, error } = await supabase.rpc('get_sales_by_period', { period_type: period });
  
  return { salesData: data, error };
}

/**
 * Create an invitation link
 */
export async function createInvitation(email: string, role: 'buyer' | 'seller' | 'admin' = 'buyer', expiryDays = 7) {
  // Generate random token
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { invitation: null, inviteLink: null, error: new Error('User not authenticated') };
  }
  
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email,
      token,
      role,
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();
  
  return { 
    invitation: data, 
    inviteLink: data ? `${window.location.origin}/signup?token=${data.token}&email=${encodeURIComponent(email)}` : null,
    error 
  };
}

/**
 * Get all invitations
 */
export async function getInvitations(limit = 20, page = 0) {
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('invitations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  
  return { invitations: data, count, error };
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(invitationId: string) {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .eq('is_used', false); // Only delete if not used
  
  return { success: !error, error };
} 
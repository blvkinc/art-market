import { supabase } from '../lib/supabase';

/**
 * Get a profile by ID
 */
export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  return { profile: data, error };
}

/**
 * Get a profile by username
 */
export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  return { profile: data, error };
}

/**
 * Update a user's profile
 */
export async function updateProfile(id: string, updates: {
  username?: string;
  full_name?: string;
  bio?: string;
  website?: string;
  avatar_url?: string;
  is_artist?: boolean;
  user_type?: 'buyer' | 'seller' | 'admin';
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { profile: data, error };
}

/**
 * Upload a profile avatar
 */
export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase
    .storage
    .from('user-content')
    .upload(filePath, file);

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  // Get the public URL
  const { data } = supabase
    .storage
    .from('user-content')
    .getPublicUrl(filePath);

  // Update the user's profile with the new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId);

  return { url: data.publicUrl, error: updateError };
}

/**
 * Get all artists (users with is_artist flag)
 */
export async function getArtists(limit = 12, page = 0) {
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('is_artist', true)
    .order('created_at', { ascending: false })
    .range(from, to);
  
  return { artists: data, count, error };
}

/**
 * Follow an artist/user
 */
export async function followUser(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: followerId,
      following_id: followingId
    })
    .select();
  
  return { data, error };
}

/**
 * Unfollow an artist/user
 */
export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .match({
      follower_id: followerId,
      following_id: followingId
    });
  
  return { error };
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .match({
      follower_id: followerId,
      following_id: followingId
    })
    .single();
  
  return { isFollowing: !!data, error };
}

/**
 * Get a user's followers
 */
export async function getFollowers(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles!follows_follower_id_fkey(*)')
    .eq('following_id', userId);
  
  return { followers: data, error };
}

/**
 * Get users that a user is following
 */
export async function getFollowing(userId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles!follows_following_id_fkey(*)')
    .eq('follower_id', userId);
  
  return { following: data, error };
}

/**
 * Become a seller (upgrade from buyer to seller)
 */
export async function becomeArtist(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      user_type: 'seller',
      is_artist: true 
    })
    .eq('id', userId)
    .select();
  
  return { profile: data ? data[0] : null, error };
}

/**
 * Get all sellers (artists)
 */
export async function getSellers(limit = 12, page = 0) {
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('user_type', 'seller')
    .order('created_at', { ascending: false })
    .range(from, to);
  
  return { sellers: data, count, error };
} 
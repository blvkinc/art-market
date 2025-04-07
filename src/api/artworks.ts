import { supabase } from '../lib/supabase';

/**
 * Get all artworks with pagination
 */
export async function getArtworks(limit = 12, page = 0, category?: string) {
  const from = page * limit;
  const to = from + limit - 1;
  
  let query = supabase
    .from('artworks')
    .select('*, profiles(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  
  // Apply category filter if provided
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error, count } = await query;
  
  return { artworks: data, count, error };
}

/**
 * Get featured artworks
 */
export async function getFeaturedArtworks(limit = 6) {
  const { data, error } = await supabase
    .from('artworks')
    .select('*, profiles(*)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { artworks: data, error };
}

/**
 * Get artwork by ID
 */
export async function getArtworkById(id: string) {
  const { data, error } = await supabase
    .from('artworks')
    .select('*, profiles(*)')
    .eq('id', id)
    .single();
  
  // Increment view count
  if (data) {
    await supabase
      .from('artworks')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);
  }
  
  return { artwork: data, error };
}

/**
 * Get artworks by user ID
 */
export async function getArtworksByUserId(userId: string, limit = 12, page = 0) {
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('artworks')
    .select('*, profiles(*)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);
  
  return { artworks: data, count, error };
}

/**
 * Create a new artwork
 */
export async function createArtwork(artwork: {
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  license_options: any[];
  user_id: string;
  image_file: File;
}) {
  // 1. Upload the image
  const fileExt = artwork.image_file.name.split('.').pop();
  const fileName = `${artwork.user_id}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `artworks/${fileName}`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('artwork-images')
    .upload(filePath, artwork.image_file);
    
  if (uploadError) {
    return { artwork: null, error: uploadError };
  }
  
  // 2. Get the public URL
  const { data: urlData } = supabase
    .storage
    .from('artwork-images')
    .getPublicUrl(filePath);
    
  // 3. Save the artwork metadata to the database
  const { data, error } = await supabase
    .from('artworks')
    .insert({
      title: artwork.title,
      description: artwork.description,
      price: artwork.price,
      category: artwork.category,
      tags: artwork.tags,
      license_options: artwork.license_options,
      user_id: artwork.user_id,
      image_url: urlData.publicUrl,
    })
    .select()
    .single();
  
  return { artwork: data, error };
}

/**
 * Update an artwork
 */
export async function updateArtwork(id: string, updates: {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  tags?: string[];
  license_options?: any[];
  is_featured?: boolean;
}) {
  const { data, error } = await supabase
    .from('artworks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { artwork: data, error };
}

/**
 * Delete an artwork
 */
export async function deleteArtwork(id: string) {
  // First, get the artwork to find the image URL
  const { data: artwork } = await supabase
    .from('artworks')
    .select('image_url')
    .eq('id', id)
    .single();
  
  // Delete the artwork record from the database
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id);
  
  // If successful and we have an image URL, delete the image file too
  if (!error && artwork?.image_url) {
    const path = artwork.image_url.split('/').pop();
    if (path) {
      await supabase
        .storage
        .from('artwork-images')
        .remove([`artworks/${path}`]);
    }
  }
  
  return { error };
}

/**
 * Like an artwork
 */
export async function likeArtwork(artworkId: string, userId: string) {
  const { data, error } = await supabase
    .from('likes')
    .insert({
      artwork_id: artworkId,
      user_id: userId
    })
    .select();
  
  return { data, error };
}

/**
 * Unlike an artwork
 */
export async function unlikeArtwork(artworkId: string, userId: string) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .match({
      artwork_id: artworkId,
      user_id: userId
    });
  
  return { error };
}

/**
 * Check if a user has liked an artwork
 */
export async function hasLiked(artworkId: string, userId: string) {
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .match({
      artwork_id: artworkId,
      user_id: userId
    })
    .single();
  
  return { hasLiked: !!data, error };
}

/**
 * Get likes count for an artwork
 */
export async function getLikesCount(artworkId: string) {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact' })
    .eq('artwork_id', artworkId);
  
  return { count, error };
}

/**
 * Search artworks
 */
export async function searchArtworks(query: string, limit = 20) {
  // This is a simple search - in production you might want to implement more sophisticated search
  const { data, error } = await supabase
    .from('artworks')
    .select('*, profiles(*)')
    .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
    .limit(limit);
  
  return { artworks: data, error };
} 
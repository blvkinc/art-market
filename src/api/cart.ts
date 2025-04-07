import { supabase } from '../lib/supabase';

/**
 * Get the cart items for a user
 */
export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, artworks(*), artworks.profiles(*)')
    .eq('user_id', userId);
  
  return { cartItems: data, error };
}

/**
 * Add an item to the cart
 */
export async function addToCart(userId: string, artworkId: string, licenseType: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: userId,
      artwork_id: artworkId,
      license_type: licenseType
    })
    .select();
  
  return { cartItem: data ? data[0] : null, error };
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(cartItemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);
  
  return { error };
}

/**
 * Clear the entire cart for a user
 */
export async function clearCart(userId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  
  return { error };
}

/**
 * Process a checkout (simplified version - would connect to payment gateway in production)
 */
export async function processCheckout(userId: string, paymentDetails: any) {
  try {
    // 1. Get all cart items for the user
    const { data: cartItems, error: fetchError } = await supabase
      .from('cart_items')
      .select('*, artworks(*)')
      .eq('user_id', userId);
    
    if (fetchError) throw fetchError;
    if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');
    
    // 2. Process payment (simplified for this example)
    // In a real app, you would call a payment gateway API here
    const paymentSuccess = true; // Mock successful payment
    
    if (!paymentSuccess) throw new Error('Payment failed');
    
    // 3. Create sales records for each item
    const salesInserts = cartItems.map(item => ({
      artwork_id: item.artwork_id,
      seller_id: item.artworks.user_id,
      buyer_id: userId,
      price: item.artworks.price, // This would be the selected license price in reality
      license_type: item.license_type,
      transaction_id: `tr_${Math.random().toString(36).substring(2, 15)}`,
      status: 'completed'
    }));
    
    const { error: salesError } = await supabase
      .from('sales')
      .insert(salesInserts);
    
    if (salesError) throw salesError;
    
    // 4. Clear the cart
    await clearCart(userId);
    
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get purchase history for a user
 */
export async function getPurchaseHistory(userId: string) {
  const { data, error } = await supabase
    .from('sales')
    .select('*, artworks(*), artworks.profiles(*)')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });
  
  return { purchases: data, error };
}

/**
 * Get sales history for an artist
 */
export async function getSalesHistory(userId: string) {
  const { data, error } = await supabase
    .from('sales')
    .select('*, artworks(*), profiles!sales_buyer_id_fkey(*)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });
  
  return { sales: data, error };
} 
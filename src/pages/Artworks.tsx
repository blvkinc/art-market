import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ArtworkCard from '../components/ArtworkCard';

interface Artwork {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  artist_id: string;
  created_at: string;
  artist: {
    username: string;
    full_name: string;
  };
}

const Artworks = () => {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchArtworks();
  }, [sortBy]);

  const fetchArtworks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('artworks')
        .select(`
          *,
          artist:profiles(username, full_name)
        `)
        .eq('status', 'active');

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setArtworks(data || []);
    } catch (err) {
      console.error('Error fetching artworks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter artworks based on search query
  const filteredArtworks = artworks.filter(artwork =>
    artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.artist.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.artist.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Explore Artworks</h1>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Sort and Filter */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_low' | 'price_high')}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="text-gray-400 mb-6">
              {filteredArtworks.length} {filteredArtworks.length === 1 ? 'artwork' : 'artworks'} found
            </div>

            {/* Artworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ArtworkCard
                    artwork={{
                      id: artwork.id,
                      title: artwork.title,
                      artist: artwork.artist.full_name || artwork.artist.username,
                      price: artwork.price,
                      image: artwork.image_url,
                      artistId: artwork.artist_id
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredArtworks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No artworks found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Artworks; 
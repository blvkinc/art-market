import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  user_type: string;
  user_metadata?: {
    user_type?: string;
  };
  artworks: { count: number }[];
  followers: { count: number }[];
}

interface Artist {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  artworks_count: number;
  followers_count: number;
}

interface SellerProfile {
  id: string;
  profiles: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    user_type: string;
  };
}

function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Starting to fetch artists...');

        // First get all seller profiles
        const { data: sellerProfiles, error: sellerError } = await supabase
          .from('seller_profiles')
          .select(`
            id,
            profiles:profiles!inner (
              id,
              username,
              full_name,
              avatar_url,
              bio,
              user_type
            )
          `) as { data: SellerProfile[] | null, error: any };

        if (sellerError) {
          console.error('Error fetching seller profiles:', sellerError);
          throw sellerError;
        }

        if (!sellerProfiles || sellerProfiles.length === 0) {
          console.log('No sellers found in the database');
          setArtists([]);
          return;
        }

        // Get artwork and follower counts for each seller
        const artistsWithCounts = await Promise.all(
          sellerProfiles.map(async (seller) => {
            const profile = seller.profiles;
            
            // Get artwork count
            const { count: artworksCount } = await supabase
              .from('artworks')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);

            // Get follower count
            const { count: followersCount } = await supabase
              .from('follows')
              .select('*', { count: 'exact', head: true })
              .eq('followed_id', profile.id);

            return {
              id: profile.id,
              username: profile.username,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              bio: profile.bio,
              artworks_count: artworksCount || 0,
              followers_count: followersCount || 0
            };
          })
        );

        console.log('Transformed artists data:', artistsWithCounts);
        setArtists(artistsWithCounts);
      } catch (err) {
        console.error('Detailed error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch artists');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 bg-black text-white min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold tracking-tight mb-6">Featured Artists</h1>
          <p className="text-gray-300 text-xl max-w-3xl">
            Discover the talented artists behind our collection of unique digital artwork, each bringing their own style and vision to the platform.
          </p>
        </motion.div>
        
        {artists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No artists found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <Link
                  to={`/artists/${artist.id}`}
                  className="block bg-black border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] group relative"
                >
                  {/* Highlight effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent"></div>
                  
                  <div className="relative h-48 overflow-hidden">
                    {artist.avatar_url ? (
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        src={artist.avatar_url}
                        alt={artist.full_name || artist.username}
                        className="w-full h-full object-cover object-center transform transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <span className="text-6xl font-bold text-white/20">
                          {(artist.full_name || artist.username)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                  </div>
                  
                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] bg-black transform group-hover:scale-105 transition-all duration-500">
                        {artist.avatar_url ? (
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.4 }}
                            src={artist.avatar_url}
                            alt={artist.full_name || artist.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <span className="text-xl font-bold text-white/30">
                              {(artist.full_name || artist.username)[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors duration-300">
                          {artist.full_name || artist.username}
                        </h3>
                        <p className="text-gray-400 text-sm font-medium">@{artist.username}</p>
                        {artist.bio && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2 group-hover:text-gray-400 transition-colors duration-300">{artist.bio}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm border-t border-white/10 pt-4">
                      <div className="group-hover:transform group-hover:translate-y-[-2px] transition-all duration-300">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Artworks</p>
                        <p className="font-bold text-white text-lg">{artist.artworks_count}</p>
                      </div>
                      <div className="group-hover:transform group-hover:translate-y-[-2px] transition-all duration-300">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Followers</p>
                        <p className="font-bold text-white text-lg">{artist.followers_count}</p>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300"
                      >
                        View Profile
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Artists;
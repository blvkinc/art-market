import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Globe, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ArtworkCard from '../components/ArtworkCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Artist {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  website: string;
  artworks_count: number;
  followers_count: number;
  following_count: number;
  is_followed?: boolean;
}

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

function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching artist data for ID:', id);

        // Fetch artist profile
        const { data: artistData, error: artistError } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            full_name,
            avatar_url,
            bio,
            website,
            user_type
          `)
          .eq('id', id)
          .single();

        console.log('Artist data:', artistData);
        console.log('Artist error:', artistError);

        if (artistError) throw artistError;
        if (!artistData) throw new Error('Artist not found');
        
        // Verify this is a seller/artist
        if (artistData.user_type !== 'seller') {
          throw new Error('This profile is not an artist');
        }

        // Check if the current user is following this artist
        if (user) {
          const { data: followData } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', id)
            .single();

          setIsFollowing(!!followData);
        }

        // Get artwork count
        const { count: artworksCount } = await supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true })
          .eq('artist_id', id);

        // Get follower count
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', id);

        // Get following count
        const { count: followingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', id);

        // Fetch artist's artworks
        const { data: artworksData, error: artworksError } = await supabase
          .from('artworks')
          .select(`
            *,
            artist:profiles(username, full_name)
          `)
          .eq('artist_id', id)
          .order('created_at', { ascending: false });

        console.log('Artworks data:', artworksData);
        console.log('Artworks error:', artworksError);

        if (artworksError) throw artworksError;

        // Transform the data
        const transformedArtist = {
          ...artistData,
          artworks_count: artworksCount || 0,
          followers_count: followersCount || 0,
          following_count: followingCount || 0
        };

        console.log('Transformed artist:', transformedArtist);

        setArtist(transformedArtist);
        setArtworks(artworksData || []);
      } catch (err) {
        console.error('Error fetching artist data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch artist data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id, user]);

  const handleFollow = async () => {
    if (!user || !artist) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', artist.id);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: artist.id
          });
      }

      setIsFollowing(!isFollowing);
      // Update followers count
      setArtist(prev => prev ? {
        ...prev,
        followers_count: prev.followers_count + (isFollowing ? -1 : 1)
      } : null);
    } catch (err) {
      console.error('Error updating follow status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-black pt-20 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl text-white mb-4">Error</h2>
          <p className="text-red-400">{error || 'Artist not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Artist Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-white/5">
            {artist.avatar_url ? (
              <img
                src={artist.avatar_url}
                alt={artist.full_name || artist.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-white/30">
                  {(artist.full_name || artist.username)[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                  {artist.full_name || artist.username}
                </h1>
                <p className="text-gray-400 mb-2">@{artist.username}</p>
                {artist.bio && (
                  <p className="text-gray-300 mb-4">{artist.bio}</p>
                )}
                {artist.website && (
                  <div className="flex gap-4">
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>
              {user && user.id !== artist.id && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>
              )}
            </div>
            
            <div className="flex gap-8 mt-6">
              <div>
                <p className="text-2xl font-bold text-white">{artist.artworks_count}</p>
                <p className="text-gray-400">Artworks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{artist.followers_count}</p>
                <p className="text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{artist.following_count}</p>
                <p className="text-gray-400">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Artist's Artworks */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8">Latest Artworks</h2>
          {artworks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No artworks found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default ArtistProfile;
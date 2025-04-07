import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingCart, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EditArtworkModal from '../components/EditArtworkModal';

interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  artist_id: string;
  artist: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  tags: string[];
  created_at: string;
}

const ArtworkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        console.log('Fetching artwork with ID:', id);
        console.log('Current user:', user);

        const { data, error } = await supabase
          .from('artworks')
          .select(`
            *,
            artist:profiles(
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        console.log('Supabase response:', { data, error });
        console.log('Fetched artwork data:', data);

        if (error) {
          console.error('Error fetching artwork:', error);
          throw error;
        }

        if (!data) {
          console.error('No artwork found with ID:', id);
          throw new Error('Artwork not found');
        }

        // Log the image URL specifically
        console.log('Artwork image URL:', data.image_url);

        setArtwork(data);
      } catch (err) {
        console.error('Error in fetchArtwork:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch artwork');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtwork();
  }, [id, user]);

  const handleEdit = async (updatedArtwork: any) => {
    try {
      const { error } = await supabase
        .from('artworks')
        .update({
          title: updatedArtwork.title,
          description: updatedArtwork.description,
          price: updatedArtwork.price,
          tags: updatedArtwork.tags
        })
        .eq('id', updatedArtwork.id);

      if (error) throw error;

      setArtwork(prev => prev ? { ...prev, ...updatedArtwork } : null);
    } catch (err) {
      console.error('Error updating artwork:', err);
      // You might want to show an error message to the user here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-black pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center py-12">
          <h2 className="text-2xl text-white mb-4">Error</h2>
          <p className="text-red-400">{error || 'Artwork not found'}</p>
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

  const isArtist = user?.id === artwork.artist_id;

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Artwork Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10"
          >
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Artwork Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">{artwork.title}</h1>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/profile/${artwork.artist_id}`}
                    className="flex items-center gap-4 mb-6 group"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {artwork.artist.avatar_url ? (
                        <img
                          src={artwork.artist.avatar_url}
                          alt={artwork.artist.full_name || artwork.artist.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <span className="text-white/50 text-xl">
                            {(artwork.artist.full_name || artwork.artist.username)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium group-hover:text-white/80 transition-colors">
                        {artwork.artist.full_name || artwork.artist.username}
                      </h3>
                      <p className="text-gray-400">@{artwork.artist.username}</p>
                    </div>
                  </Link>
                </div>
              </div>
              {isArtist && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
            
            {/* Price */}
            <div className="mb-6">
              <p className="text-gray-400">Price</p>
              <p className="text-3xl font-bold text-white">${artwork.price.toFixed(2)}</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-white font-medium mb-2">Description</h3>
              <p className="text-gray-400 whitespace-pre-wrap">{artwork.description}</p>
            </div>

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {artwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/10 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-auto">
              {user && user.id !== artwork.artist_id && (
                <button className="flex-1 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </button>
              )}
              <button className="px-6 py-3 rounded-lg font-medium border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Like
              </button>
              <button className="px-6 py-3 rounded-lg font-medium border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <EditArtworkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        artwork={artwork}
        onSave={handleEdit}
      />
    </div>
  );
};

export default ArtworkDetail; 
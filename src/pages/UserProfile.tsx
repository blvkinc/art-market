import React, { useState, useRef, useEffect } from 'react';
import { Settings, Grid, Heart, Clock, LogOut, Upload } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ArtworkCard from '../components/ArtworkCard';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { supabase } from '../lib/supabase';

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

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('artworks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInView = useInView(contentRef, { once: true, amount: 0.1 });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user's artworks
  useEffect(() => {
    const fetchArtworks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching artworks for user:', user.id);
        
        let query = supabase
          .from('artworks')
          .select(`
            *,
            artist:profiles(username, full_name)
          `);

        // If user is a seller, show their artworks
        // If user is a buyer, show their collected/purchased artworks
        if (user.user_type === 'seller') {
          console.log('User is a seller, fetching their artworks');
          query = query.eq('artist_id', user.id);
        } else {
          console.log('User is a buyer, showing empty state');
          // For buyers, you might want to implement a separate table for purchased/collected artworks
          // For now, we'll just show an empty state
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Fetched artworks:', data);
        setArtworks(data || []);
      } catch (err) {
        console.error('Error fetching artworks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch artworks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtworks();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserRoleBadge = () => {
    if (!user) return null;
    
    const role = user.user_type;
    const colors = {
      admin: 'bg-red-500/20 text-red-200 border-red-500/50',
      seller: 'bg-blue-500/20 text-blue-200 border-blue-500/50',
      buyer: 'bg-green-500/20 text-green-200 border-green-500/50'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${colors[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (!user) return null;

  // Determine collections based on user type
  const collections = user.user_type === 'seller' ? [
    {
      id: 1,
      title: "Digital Dreams",
      artist: user.full_name || user.username || 'Unknown Artist',
      price: 299,
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 2,
      title: "Neon Nights",
      artist: user.full_name || user.username || 'Unknown Artist',
      price: 199,
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=800",
    },
  ] : [
    {
      id: 3,
      title: "Abstract Flow",
      artist: "Sarah Johnson",
      price: 349,
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 4,
      title: "Cyberpunk City",
      artist: "James Wilson",
      price: 499,
      image: "https://images.unsplash.com/photo-1620064916958-605375619af8?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const tabVariants = {
    inactive: { opacity: 0.7, y: 0 },
    active: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: { 
      opacity: 1, 
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-black border border-white/10 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || user.username}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white/50 text-4xl">
                    {user.email[0].toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white">{user.full_name || user.username}</h1>
                  <p className="text-gray-400 mt-1">@{user.username}</p>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="inline-block mt-2"
                  >
                    {getUserRoleBadge()}
                  </motion.span>
                </div>
                <div className="flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/profile/edit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </motion.div>
                  {user.user_type === 'seller' && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/upload"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Artwork
                      </Link>
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-medium hover:bg-red-500/30 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-black border border-white/10 rounded-xl p-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('artworks')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'artworks'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Grid className="w-5 h-5 inline-block mr-2" />
              Artworks
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'likes'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Heart className="w-5 h-5 inline-block mr-2" />
              Likes
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Clock className="w-5 h-5 inline-block mr-2" />
              History
            </button>
          </div>

          {/* Tab Content */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">
              {error}
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-12">
              {user.user_type === 'seller' ? (
                <div>
                  <p className="text-gray-400 mb-4">You haven't uploaded any artworks yet.</p>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Your First Artwork
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">You haven't collected any artworks yet.</p>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
                  >
                    <Grid className="w-4 h-4" />
                    Explore Artworks
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
};

export default UserProfile;
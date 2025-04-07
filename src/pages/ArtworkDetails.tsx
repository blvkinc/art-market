import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, ShoppingCart, Zap, Shield, Tag, Award } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Temporary mock data - would be fetched from Supabase in production
const mockArtwork = {
  id: 1,
  title: "Digital Dreams",
  description: "A surreal landscape exploring the intersection of nature and technology, featuring vibrant colors and floating elements that challenge perceptions of reality.",
  artist: "Elena Chen",
  artistId: "elena-chen",
  price: 299,
  image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800",
  created_at: "2023-09-15",
  category: "Digital Painting",
  tags: ["surreal", "landscape", "colorful"],
  licenseOptions: [
    { id: 1, name: "Personal Use", price: 299, description: "Use for personal, non-commercial purposes" },
    { id: 2, name: "Commercial License", price: 499, description: "Use for commercial projects with limited distribution" },
    { id: 3, name: "Extended Commercial", price: 999, description: "Unlimited commercial usage with no restrictions" }
  ]
};

const ArtworkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState(mockArtwork); // In production would be null initially
  const [selectedLicense, setSelectedLicense] = useState(mockArtwork.licenseOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    // In production you would fetch artwork data from Supabase
    const fetchArtwork = async () => {
      setIsLoading(true);
      try {
        // Example Supabase query (commented out since we're using mock data)
        /*
        const { data, error } = await supabase
          .from('artworks')
          .select('*, profiles(username, avatar_url)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setArtwork(data);
        */
        
        // Using mock data for now
        setArtwork(mockArtwork);
      } catch (error) {
        console.error('Error fetching artwork:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  useEffect(() => {
    // GSAP animation for the image
    if (imageRef.current) {
      gsap.from(imageRef.current, {
        duration: 1.5,
        scale: 1.05,
        opacity: 0,
        ease: "power3.out"
      });
    }
  }, [artwork]);

  const handleLicenseChange = (license: typeof selectedLicense) => {
    setSelectedLicense(license);
  };

  const handleAddToCart = () => {
    // In production, add to cart logic using Supabase or local storage
    console.log(`Added to cart: ${artwork.title} with ${selectedLicense.name} license`);
    
    // Animation feedback for button press
    gsap.to(".add-to-cart-btn", {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Artwork not found</p>
        <Link to="/explore" className="text-white bg-black py-2 px-4 rounded">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/explore" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Explore
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Artwork Image */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl overflow-hidden"
          >
            <img
              ref={imageRef}
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-auto object-cover rounded-2xl"
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Artwork Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{artwork.title}</h1>
          <div className="mb-6">
            <Link to={`/artists/${artwork.artistId}`} className="text-gray-400 hover:text-white">
              by <span className="font-medium text-white">{artwork.artist}</span>
            </Link>
          </div>
          
          <p className="text-gray-300 mb-8">{artwork.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5">
              <Tag className="w-3 h-3 mr-1" />
              {artwork.category}
            </span>
            {artwork.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5">
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">License Options</h3>
            <div className="space-y-3">
              {artwork.licenseOptions.map((license) => (
                <div
                  key={license.id}
                  onClick={() => handleLicenseChange(license)}
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    selectedLicense.id === license.id 
                      ? 'border-white bg-white/5' 
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{license.name}</h4>
                      <p className="text-sm text-gray-400">{license.description}</p>
                    </div>
                    <div className="text-xl font-bold">${license.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn flex-1 bg-white text-black px-6 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-white/90 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
            <button className="px-6 py-3 rounded-lg font-medium border border-white/20 hover:bg-white/5 transition-colors">
              <Zap className="w-5 h-5" />
            </button>
          </div>
          
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Secure Transaction
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Verified Artist
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArtworkDetails; 
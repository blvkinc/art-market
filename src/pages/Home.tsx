import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ArtworkCard from '../components/ArtworkCard';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

function Home() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);
  
  const featuresRef = useRef<HTMLDivElement>(null);
  const artworksRef = useRef<HTMLDivElement>(null);
  const artistsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const artworksInView = useInView(artworksRef, { once: true, amount: 0.2 });
  const artistsInView = useInView(artistsRef, { once: true, amount: 0.2 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.5 });

  const featuredArtworks = [
    {
      id: 1,
      title: "Digital Dreams",
      artist: "Elena Chen",
      price: 299,
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 2,
      title: "Neon Nights",
      artist: "Marcus Rivera",
      price: 199,
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 3,
      title: "Abstract Flow",
      artist: "Sarah Johnson",
      price: 349,
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const topArtists = [
    {
      id: "artist1",
      name: "Elena Chen",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      artCount: 24
    },
    {
      id: "artist2",
      name: "Marcus Rivera",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      artCount: 18
    },
    {
      id: "artist3",
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      artCount: 31
    },
    {
      id: "artist4",
      name: "James Wilson",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      artCount: 27
    }
  ];

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <motion.div 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative bg-black text-white min-h-screen flex items-center"
      >
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=2070"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 z-10">
          <div className="max-w-3xl space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-tight"
            >
              Discover and Collect Digital Artwork
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl mb-8 text-gray-300"
            >
              _art is the premier marketplace for unique digital art from creative artists around the world.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex gap-4 flex-wrap"
            >
              <Link 
                to="/explore" 
                className="px-8 py-4 backdrop-blur-md bg-white/90 text-black rounded-lg font-medium hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                Explore Artwork
              </Link>
              <Link 
                to="/upload" 
                className="px-8 py-4 backdrop-blur-md bg-transparent border-2 border-white/50 text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-300"
              >
                Start Selling
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center"
          >
            <p className="text-sm text-gray-400 mb-2">Scroll to explore</p>
            <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <div ref={featuresRef} className="bg-black border-t border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white">Why Choose _art</h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              We provide the best platform for digital artists and collectors to connect and trade unique artwork.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Curated Artwork",
                description: "Discover unique pieces from verified artists worldwide, with new artwork added daily."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Secure Transactions",
                description: "Buy and sell with confidence using our secure payment methods and authentication."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Easy Process",
                description: "Start selling your digital art in minutes with our simple upload and listing process."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 backdrop-blur-md bg-white/10 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Artworks */}
      <div ref={artworksRef} className="bg-black border-t border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={artworksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white">Featured Artworks</h2>
            <Link to="/explore" className="text-white hover:text-gray-300 font-medium group flex items-center">
              View All 
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Top Artists */}
      <div ref={artistsRef} className="bg-black border-t border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={artistsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white">Top Artists</h2>
            <Link to="/artists" className="text-white hover:text-gray-300 font-medium group flex items-center">
              View All 
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={artistsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <Link 
                  to={`/artists/${artist.id}`}
                  className="group backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 transition hover:bg-white/10 flex flex-col items-center text-center shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
                >
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    src={artist.avatar} 
                    alt={artist.name} 
                    className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-white/20 group-hover:border-white transition-all duration-300"
                  />
                  <h3 className="text-lg font-medium text-white group-hover:text-white transition">
                    {artist.name}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{artist.artCount} artworks</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div ref={ctaRef} className="backdrop-blur-md bg-white/5 border-t border-white/10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between"
        >
          <div className="mb-8 md:mb-0 md:max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to showcase your digital art?
            </h2>
            <p className="text-gray-300 mb-0">
              Join our community of artists and start selling your creations today.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/upload"
              className="px-8 py-4 backdrop-blur-md bg-white/90 text-black rounded-lg font-bold hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Start Selling
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
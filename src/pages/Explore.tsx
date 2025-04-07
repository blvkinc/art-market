import React, { useState, useRef } from 'react';
import ArtworkCard from '../components/ArtworkCard';
import { motion, useInView, AnimatePresence } from 'framer-motion';

function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const resultsInView = useInView(resultsRef, { once: true, amount: 0.1 });

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'digital-painting', name: 'Digital Painting' },
    { id: '3d-art', name: '3D Art' },
    { id: 'pixel-art', name: 'Pixel Art' },
    { id: 'photography', name: 'Photography' },
    { id: 'illustration', name: 'Illustration' },
    { id: 'animation', name: 'Animation' },
  ];

  const artworks = [
    {
      id: 1,
      title: "Digital Dreams",
      artist: "Elena Chen",
      price: 299,
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800",
      category: "digital-painting"
    },
    {
      id: 2,
      title: "Neon Nights",
      artist: "Marcus Rivera",
      price: 199,
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=800",
      category: "3d-art"
    },
    {
      id: 3,
      title: "Abstract Flow",
      artist: "Sarah Johnson",
      price: 349,
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800",
      category: "digital-painting"
    },
    {
      id: 4,
      title: "Cyberpunk City",
      artist: "James Wilson",
      price: 499,
      image: "https://images.unsplash.com/photo-1620064916958-605375619af8?auto=format&fit=crop&q=80&w=800",
      category: "pixel-art"
    },
    {
      id: 5,
      title: "Nature's Whisper",
      artist: "Linda Kim",
      price: 249,
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
      category: "photography"
    },
    {
      id: 6,
      title: "Cosmic Journey",
      artist: "Alex Morgan",
      price: 399,
      image: "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=800",
      category: "illustration"
    },
  ];

  // Filter artworks based on search query, category, and price range
  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = !searchQuery || 
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || artwork.category === selectedCategory;
    
    const matchesPrice = artwork.price >= priceRange[0] && artwork.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const fadeUpVariants = {
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

  return (
    <div className="pt-20 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="flex justify-between items-center mb-12"
        >
          <h1 className="text-5xl font-bold tracking-tight text-white">Explore Artworks</h1>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 text-white transition-all duration-300"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-12"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search artworks, artists, or collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all duration-300 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          />
        </motion.div>
        
        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-12 overflow-hidden"
            >
              <motion.div 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-8 backdrop-blur-md border border-white/10 rounded-lg bg-white/5 shadow-[0_10px_25px_rgba(0,0,0,0.2)]"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-6 text-white">Categories</h3>
                    <div className="flex flex-wrap gap-3">
                      {categories.map(category => (
                        <motion.button
                          key={category.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-5 py-2 rounded-full text-sm ${
                            selectedCategory === category.id
                              ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                              : 'backdrop-blur-md bg-white/10 text-white hover:bg-white/20'
                          } transition-all duration-300`}
                        >
                          {category.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-6 text-white">Price Range</h3>
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-between items-center mb-10 text-white"
        >
          <h2 className="text-xl">
            Showing <span className="font-semibold">{filteredArtworks.length}</span> results
          </h2>
        </motion.div>

        {/* Artwork Grid */}
        <div ref={resultsRef}>
          {filteredArtworks.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={resultsInView ? "visible" : "hidden"}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  variants={fadeUpVariants}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ArtworkCard artwork={artwork} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 backdrop-blur-md border border-white/10 rounded-lg bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 mx-auto text-gray-400 mb-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-2xl font-medium text-white mb-3">No results found</h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  We couldn't find any artworks matching your search criteria. Try adjusting your filters or searching for something else.
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Explore;
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ArtworkCardProps {
  artwork: {
    id: number | string;
    title: string;
    artist: string;
    price: number;
    image: string;
    artistId?: string;
  };
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="group relative bg-black/60 border border-white/20 rounded-xl overflow-hidden hover:bg-black/80 transition-all duration-500 shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
    >
      <div className="w-full aspect-[4/3] overflow-hidden">
        <Link to={`/artwork/${artwork.id}`} className="block">
          <motion.img 
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.5 }}
            src={artwork.image} 
            alt={artwork.title} 
            className="w-full h-full object-cover transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </Link>
      </div>
      
      <div className="p-5">
        <Link to={`/artwork/${artwork.id}`} className="block">
          <h3 className="text-lg font-semibold line-clamp-1 text-white group-hover:text-white/90 transition-colors duration-300">{artwork.title}</h3>
        </Link>
        
        <Link 
          to={artwork.artistId ? `/artists/${artwork.artistId}` : '#'} 
          className="text-sm text-gray-300 hover:text-white mt-1 block transition-colors duration-300"
          onClick={(e) => {
            if (!artwork.artistId) e.preventDefault();
          }}
        >
          by {artwork.artist}
        </Link>
        
        <div className="mt-4 flex justify-between items-center">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="font-bold text-white"
          >
            ${artwork.price.toLocaleString()}
          </motion.span>
          <Link to={`/artwork/${artwork.id}`}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-black bg-white px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            >
              View
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtworkCard;
import React from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-white' : 'text-gray-400';
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white tracking-tighter">artify</Link>
          </div>

          <div className="hidden md:flex items-center space-x-12">
            <Link to="/explore" className={`${isActive('/explore')} hover:text-white transition-colors duration-200`}>
              Explore
            </Link>
            <Link to="/artists" className={`${isActive('/artists')} hover:text-white transition-colors duration-200`}>
              Artists
            </Link>
            <Link to="/collections" className={`${isActive('/collections')} hover:text-white transition-colors duration-200`}>
              Collections
            </Link>
            <Link to="/community" className={`${isActive('/community')} hover:text-white transition-colors duration-200`}>
              Community
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <Link to="/profile" className={`p-2 ${isActive('/profile')} hover:text-white transition-colors duration-200`}>
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
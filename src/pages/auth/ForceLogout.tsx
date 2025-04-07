import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ForceLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const forceLogout = async () => {
      try {
        console.log('Starting force logout process');
        
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        console.log('Cleared all storage');
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase sign out error:', error);
        } else {
          console.log('Supabase sign out successful');
        }
        
        // Force reload the page to clear any cached state
        console.log('Redirecting to login page');
        window.location.href = '/login';
      } catch (error) {
        console.error('Error during force logout:', error);
        // Even if there's an error, try to redirect to login
        window.location.href = '/login';
      }
    };

    forceLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black pt-20">
      <div className="bg-black border border-white/10 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Logging Out</h2>
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded text-blue-200 text-sm">
          <p className="mb-2">You are being logged out. Please wait...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};

export default ForceLogout; 
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ForceLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const forceLogout = async () => {
      try {
        console.log('Forcing logout...');
        
        // Clear all local storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        console.log('Logout successful, redirecting to login page');
        
        // Redirect to login page
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error during force logout:', error);
        // Even if there's an error, try to redirect
        navigate('/login', { replace: true });
      }
    };

    forceLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black pt-20">
      <div className="bg-black border border-white/10 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Logging Out</h2>
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded text-blue-200 text-sm">
          <p className="mb-2">Clearing authentication state and redirecting to login...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};

export default ForceLogout; 
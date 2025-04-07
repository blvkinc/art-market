import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, forcing navigation to login');
        setTimeoutReached(true);
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  // If loading timeout reached, redirect to login
  if (timeoutReached) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    // Show loading spinner while auth is being checked
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 
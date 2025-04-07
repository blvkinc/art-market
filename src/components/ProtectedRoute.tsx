import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, authError } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('ProtectedRoute: Loading timeout reached');
        setTimeoutReached(true);
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Debug current state
  useEffect(() => {
    console.log('ProtectedRoute state:', {
      isLoading,
      user: user ? 'exists' : 'null',
      authError,
      timeoutReached,
      redirectAttempted,
      path: location.pathname
    });
  }, [isLoading, user, location.pathname, timeoutReached, redirectAttempted, authError]);

  // Show loading state
  if (isLoading && !timeoutReached) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if ((!isLoading && !user) || timeoutReached) {
    console.log('No user or timeout reached, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute; 
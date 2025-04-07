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

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('ProtectedRoute: Loading timeout reached');
        setTimeoutReached(true);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  useEffect(() => {
    console.log('ProtectedRoute state:', {
      isLoading,
      user: user ? 'exists' : 'null',
      authError,
      timeoutReached,
      redirectAttempted,
      path: location.pathname
    });

    // Handle redirection based on auth state
    if (!isLoading && !redirectAttempted) {
      if (authError) {
        console.log('ProtectedRoute: Auth error detected, redirecting to login');
        setRedirectAttempted(true);
        return;
      }

      if (timeoutReached) {
        console.log('ProtectedRoute: Loading timeout reached, redirecting to login');
        setRedirectAttempted(true);
        return;
      }

      if (!user) {
        console.log('ProtectedRoute: User not authenticated, redirecting to login');
        setRedirectAttempted(true);
        return;
      }
    }
  }, [isLoading, user, authError, timeoutReached, redirectAttempted, location.pathname]);

  // Show loading state
  if (isLoading && !timeoutReached) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated or if there's an error
  if ((!isLoading && !user) || authError || timeoutReached) {
    const from = location.pathname;
    return <Navigate to="/login" state={{ from }} replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 
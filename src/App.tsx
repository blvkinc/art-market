import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Artists from './pages/Artists';
import ArtistProfile from './pages/ArtistProfile';
import ArtworkDetail from './pages/ArtworkDetail';
import UserProfile from './pages/UserProfile';
import UploadArtwork from './pages/UploadArtwork';
import EditProfile from './pages/EditProfile';
import Artworks from './pages/Artworks';
import AdminDashboard from './pages/admin/AdminDashboard';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ForceLogout from './pages/auth/ForceLogout';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Error handler component for auth errors
const AuthError = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // After displaying the error, redirect to login
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black pt-20">
      <div className="bg-black border border-white/10 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Authentication Error</h2>
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
          <p className="mb-2">There was a problem with authentication. Redirecting to login...</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Always declare all state variables at the top level
  const [appReady, setAppReady] = useState(false);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [authRedirectAttempted, setAuthRedirectAttempted] = useState(false);

  // Debug current authentication state
  useEffect(() => {
    console.log('App: Current auth state -', { 
      isLoading, 
      user: user?.id ? { id: user.id, email: user.email, userType: user.user_type } : null, 
      pathname: location.pathname,
      appReady,
      redirectInProgress,
      initialAuthCheckComplete,
      loadingTimeout,
      authRedirectAttempted
    });
    
    // Mark initial auth check as complete once loading is done
    if (!isLoading && !initialAuthCheckComplete) {
      setInitialAuthCheckComplete(true);
    }
  }, [isLoading, user, location.pathname, appReady, redirectInProgress, initialAuthCheckComplete, loadingTimeout, authRedirectAttempted]);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('App loading timeout reached, forcing app ready state');
        setLoadingTimeout(true);
        setAppReady(true);
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Handle authentication redirects and hash fragments
  useEffect(() => {
    // Skip if already handled
    if (redirectInProgress) return;
    
    const hash = location.hash;
    
    // Check for successful verification in the hash
    if (hash && (hash.includes('type=recovery') || hash.includes('type=signup'))) {
      console.log('Authentication redirect detected, redirecting to login');
      setRedirectInProgress(true);
      navigate('/login?verified=true', { replace: true });
      return;
    }
    
    // Check for OTP errors
    if (hash && hash.includes('error=') && hash.includes('error_code=otp_expired')) {
      console.log('OTP expired error detected, redirecting to login');
      setRedirectInProgress(true);
      navigate('/login?verification_failed=true', { replace: true });
      return;
    }
  }, [location.pathname, navigate, redirectInProgress]);

  // Reset redirect flag when URL changes
  useEffect(() => {
    if (redirectInProgress && !location.hash) {
      setRedirectInProgress(false);
    }
  }, [location.pathname, location.hash, redirectInProgress]);

  // Make sure app is ready even if auth loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!appReady) {
        setAppReady(true);
        console.log('App ready timeout triggered, forcing render');
      }
    }, 2000); // Force ready after 2 seconds

    return () => clearTimeout(timer);
  }, [appReady]);

  // Auto-redirect to profile when user is authenticated
  useEffect(() => {
    // Don't redirect if:
    // 1. App is not ready yet or auth is loading
    // 2. No user is logged in
    // 3. Already on profile page
    // 4. Not on login page 
    // 5. If a redirect is already in progress
    // 6. If we've already attempted a redirect
    
    if (!user || !appReady || isLoading || redirectInProgress || !initialAuthCheckComplete || authRedirectAttempted) return;
    
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
    const isOnProfilePage = location.pathname === '/profile';
    
    if (isAuthPage && !isOnProfilePage) {
      console.log('User is authenticated, redirecting to profile');
      setAuthRedirectAttempted(true);
      
      // Use navigate instead of window.location for smoother transitions
      navigate('/profile', { replace: true });
    }
  }, [user, appReady, isLoading, location.pathname, redirectInProgress, initialAuthCheckComplete, authRedirectAttempted, navigate]);

  // Security features effect - MUST be declared in the same order every render
  useEffect(() => {
    // Security features

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts for screenshots
    const handleKeyDown = (e: KeyboardEvent) => {
      // Windows/Linux: Printscreen, Ctrl+P
      // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (
        e.key === 'PrintScreen' || 
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Add CSS to make screenshots appear black
    const style = document.createElement('style');
    style.textContent = `
      html {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      @media print {
        html, body {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);

    // Apply event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
    };
  }, []);

  // Render different UI based on loading state, but keep hooks consistent
  if (!appReady && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p>Loading ArtStore...</p>
        </div>
      </div>
    );
  }

  // Main app render with routes
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<ArtistProfile />} />
        <Route path="/artworks" element={<Artworks />} />
        <Route path="/artworks/:id" element={<ArtworkDetail />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/error" element={<AuthError />} />
        <Route path="/force-logout" element={<ForceLogout />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/upload" element={<UploadArtwork />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <Footer />
    </div>
  );
}

export default App; 
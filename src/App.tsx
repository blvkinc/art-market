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
  const { clearAuthError } = useAuth();
  
  useEffect(() => {
    // After displaying the error, redirect to login
    const timer = setTimeout(() => {
      clearAuthError();
      navigate('/login', { replace: true });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate, clearAuthError]);
  
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

// Main App component
const App = () => {
  const { isLoading, user, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Always declare all state variables at the top level
  const [appReady, setAppReady] = useState(false);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [authRedirectAttempted, setAuthRedirectAttempted] = useState(false);

  // Debug current authentication state
  useEffect(() => {
    console.log('App: Current auth state -', { 
      isLoading, 
      user: user ? { id: user.id, type: user.user_type } : null, 
      pathname: location.pathname,
      appReady
    });
  }, [isLoading, user, location.pathname, appReady]);

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!appReady) {
        console.log('App ready timeout triggered, forcing render');
        setAppReady(true);
      }
    }, 3000); // 3 seconds timeout

    return () => clearTimeout(timer);
  }, [appReady]);

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
  }, [location.pathname, navigate, redirectInProgress, location.hash]);

  // Clear localStorage on auth errors to ensure clean state
  useEffect(() => {
    if (authError) {
      console.log('Auth error detected, clearing local storage');
      localStorage.clear();
    }
  }, [authError]);

  // Reset redirect flag when URL changes
  useEffect(() => {
    if (redirectInProgress && !location.hash) {
      setRedirectInProgress(false);
    }
  }, [location.pathname, location.hash, redirectInProgress]);

  // Auto-redirect to profile when user is authenticated
  useEffect(() => {
    if (!user || !appReady || isLoading || redirectInProgress || authRedirectAttempted) return;
    
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
    const isOnProfilePage = location.pathname === '/profile';
    
    if (isAuthPage && !isOnProfilePage) {
      console.log('User is authenticated, redirecting to profile');
      setAuthRedirectAttempted(true);
      navigate('/profile', { replace: true });
    }
  }, [user, appReady, isLoading, location.pathname, redirectInProgress, authRedirectAttempted, navigate]);

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

  // Show loading state
  if (isLoading && !appReady) {
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
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadArtwork />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </div>
  );
};

export default App; 
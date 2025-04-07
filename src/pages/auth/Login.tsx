import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, authError } = useAuth();

  // Debug log for component mount
  useEffect(() => {
    console.log('Login component mounted');
    return () => console.log('Login component unmounted');
  }, []);

  // Redirect to profile if already logged in
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      console.log('Checking auth state:', {
        user: user ? 'exists' : 'null',
        userDetails: user ? { id: user.id, email: user.email } : null,
        redirectAttempted
      });

      // Clear any previous errors when component mounts
      if (!redirectAttempted) {
        setError(null);
      }

      if (user?.id && !redirectAttempted) {
        console.log('User is authenticated, redirecting to profile...');
        setRedirectAttempted(true);
        
        // Add a small delay to ensure user state is fully updated
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 300);
      }
    };

    checkAuthAndRedirect();
  }, [user, redirectAttempted, navigate]);

  // Check for query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get('verified');
    
    if (verified === 'true') {
      setSuccess('Your email has been verified. You can now sign in.');
    }
    
    // Clean the URL
    if (verified === 'true' && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [location]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (isLoading) return;
    
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    setRedirectAttempted(false); // Reset redirect flag to allow new redirect attempts
    
    try {
      console.log('Starting sign in process for:', email);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in.');
        } else {
          setError(error.message || 'An error occurred during sign in. Please try again.');
        }
        return;
      }

      console.log('Sign in successful:', {
        data: data ? 'exists' : 'null',
        userState: user ? 'exists' : 'null'
      });
      
      setSuccess('Sign in successful! Redirecting...');
      
      // Let the useEffect handle the redirect to maintain consistent behavior
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If there's an auth error from the context, display it
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black border border-white/10 p-8 rounded-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign In</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-200 text-sm">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 text-white disabled:opacity-60"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 text-white disabled:opacity-60"
              placeholder="Enter your password"
            />
          </div>
          
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-white">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className={`w-full py-3 px-6 bg-white text-black font-medium rounded-lg transition-opacity ${isLoading || !email || !password ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 
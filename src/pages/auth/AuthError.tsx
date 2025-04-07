import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthError = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorType, setErrorType] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Parse error from URL
    const searchParams = new URLSearchParams(location.hash.substring(1));
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setErrorType(error);
      const message = errorDescription || 'An authentication error occurred.';
      setErrorMessage(message.replace(/\+/g, ' '));
      
      // Clean the URL from error parameters
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else {
      // If no error parameter, redirect to login
      navigate('/login');
    }
  }, [location, navigate]);

  const getErrorTitle = () => {
    switch(errorType) {
      case 'access_denied':
        return 'Access Denied';
      case 'invalid_request':
        return 'Invalid Request';
      default:
        return 'Authentication Error';
    }
  };

  const getActionText = () => {
    if (errorType === 'access_denied' && location.hash.includes('otp_expired')) {
      return 'The email verification link has expired. Please request a new verification link.';
    }
    return 'Please try signing in again or contact support if the problem persists.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black border border-white/10 p-8 rounded-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">{getErrorTitle()}</h2>
        
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
          <p className="mb-2">{errorMessage}</p>
          <p>{getActionText()}</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <Link 
            to="/login" 
            className="w-full py-3 px-6 bg-white text-black font-medium rounded-lg text-center hover:opacity-90 transition-opacity"
          >
            Return to Login
          </Link>
          
          {errorType === 'access_denied' && location.hash.includes('otp_expired') && (
            <Link 
              to="/register" 
              className="w-full py-3 px-6 bg-transparent text-white border border-white/50 font-medium rounded-lg text-center hover:bg-white/10 transition-colors"
            >
              Sign Up Again
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthError; 
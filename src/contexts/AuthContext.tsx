import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Define types for the user and context
type User = {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  user_type: 'buyer' | 'seller' | 'admin';
  bio?: string;
  website?: string;
  is_artist?: boolean;
  is_verified?: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isSeller: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signUp: (email: string, password: string, userType: 'buyer' | 'seller' | 'admin') => Promise<{ data: any; error: Error | null }>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to fetch user profile
const fetchUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return profile;
};

// Helper function to update user state with profile data
const updateUserState = async (session: any, setUser: (user: User | null) => void) => {
  try {
    if (!session?.user) {
      console.log('No user in session, setting user to null');
      setUser(null);
      return;
    }

    console.log('Updating user state for:', session.user.id);
    
    // First try to get the profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      
      // If profile doesn't exist, create it
      console.log('Profile not found, creating new profile');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          username: session.user.email?.split('@')[0] || '',
          user_type: session.user.user_metadata?.user_type || 'buyer',
          is_artist: session.user.user_metadata?.is_artist || false
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw createError;
      }
      
      profile = newProfile;
      console.log('Created new profile:', profile);
    } else {
      console.log('Existing profile found:', profile);
    }

    // Get role-specific profile
    const userType = profile?.user_type || session.user.user_metadata?.user_type || 'buyer';
    const roleProfileTable = userType === 'seller' ? 'seller_profiles' : 'buyer_profiles';
    
    console.log('Checking for role profile in table:', roleProfileTable);
    const { data: roleProfile, error: roleError } = await supabase
      .from(roleProfileTable)
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (roleError && roleError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching role profile:', roleError);
      // Create role profile if it doesn't exist
      const { error: createRoleError } = await supabase
        .from(roleProfileTable)
        .insert({ id: session.user.id });

      if (createRoleError) {
        console.error('Error creating role profile:', createRoleError);
      } else {
        console.log('Created new role profile in table:', roleProfileTable);
      }
    } else if (roleError && roleError.code === 'PGRST116') {
      console.log('Role profile not found, creating one in table:', roleProfileTable);
      // Create role profile if it doesn't exist
      const { error: createRoleError } = await supabase
        .from(roleProfileTable)
        .insert({ id: session.user.id });

      if (createRoleError) {
        console.error('Error creating role profile:', createRoleError);
      } else {
        console.log('Created new role profile in table:', roleProfileTable);
      }
    } else {
      console.log('Role profile found:', roleProfile);
    }

    // Set the user state with complete profile data
    const userData = {
      id: session.user.id,
      email: session.user.email || '',
      username: profile?.username || session.user.email?.split('@')[0] || '',
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
      user_type: profile?.user_type || session.user.user_metadata?.user_type || 'buyer',
      bio: profile?.bio || '',
      website: profile?.website || '',
      is_artist: profile?.is_artist || session.user.user_metadata?.is_artist || false,
      is_verified: profile?.is_verified || false
    };
    
    console.log('Setting user state with data:', userData);
    setUser(userData);
    console.log('User state updated successfully');
  } catch (error) {
    console.error('Error in updateUserState:', error);
    // Set a basic user state even if profile fetch fails
    setUser({
      id: session.user.id,
      email: session.user.email || '',
      user_type: session.user.user_metadata?.user_type || 'buyer',
      is_artist: session.user.user_metadata?.is_artist || false
    });
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper function to clear auth error
  const clearAuthError = () => {
    setAuthError(null);
  };

  // Helper function to clear all auth state
  const clearAuthState = () => {
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    console.log('Auth state cleared');
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        setIsLoading(true);
        setAuthError(null);

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setAuthError(sessionError.message);
          clearAuthState();
          return;
        }

        console.log('Session check result:', session ? 'Found session' : 'No session');

        if (session?.user) {
          console.log('Found existing session for user:', session.user.id);
          await updateUserState(session, setUser);
        } else {
          console.log('No active session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError(error instanceof Error ? error.message : 'Error initializing auth');
        clearAuthState();
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
          console.log('Auth initialization complete');
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state');
        clearAuthState();
        setIsLoading(false);
        return;
      }
      
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('Processing sign in event for user:', session.user.id);
        try {
          setIsLoading(true);
          await updateUserState(session, setUser);
          console.log('User state updated successfully after', event);
        } catch (error) {
          console.error('Error updating user state:', error);
          setAuthError(error instanceof Error ? error.message : 'Error updating user state');
          clearAuthState();
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting sign in process for:', email);
      
      // Clear any existing state first
      clearAuthState();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { data: null, error };
      }

      if (!data.user || !data.session) {
        console.error('Sign in succeeded but no user or session returned');
        return { data: null, error: new Error('No user data returned') };
      }

      console.log('Sign in successful for user:', data.user.id);
      
      // Update the user state
      await updateUserState(data.session, setUser);
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { data: null, error: error instanceof Error ? error : new Error('An unknown error occurred') };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userType: 'buyer' | 'seller' | 'admin' = 'buyer') => {
    try {
      setIsLoading(true);
      console.log('Starting signup process with user type:', userType);

      // Step 1: Create auth user with complete metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            is_artist: userType === 'seller',
            username: email.split('@')[0],
            full_name: '',
            avatar_url: ''
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { data: null, error: authError };
      }

      if (!authData.user) {
        console.error('No user data returned from auth signup');
        return { data: null, error: new Error('User creation failed') };
      }

      console.log('Auth user created successfully:', {
        id: authData.user.id,
        email: authData.user.email,
        metadata: authData.user.user_metadata
      });

      // Step 2: Wait for the auth user to be fully created and trigger to run
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Verify profile creation
      let profile = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!profile && retryCount < maxRetries) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error(`Profile fetch attempt ${retryCount + 1} failed:`, profileError);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          return { data: null, error: new Error('Failed to create user profile') };
        }

        profile = profileData;
      }

      if (!profile) {
        return { data: null, error: new Error('Failed to create user profile after retries') };
      }

      // Step 4: Verify role-specific profile creation
      const roleProfileTable = userType === 'seller' ? 'seller_profiles' : 'buyer_profiles';
      const { data: roleProfile, error: roleProfileError } = await supabase
        .from(roleProfileTable)
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (roleProfileError) {
        console.error('Role profile verification failed:', roleProfileError);
        // Try to create the role profile manually if it doesn't exist
        const { error: createRoleError } = await supabase
          .from(roleProfileTable)
          .insert({ id: authData.user.id });

        if (createRoleError) {
          console.error('Failed to create role profile:', createRoleError);
          return { data: null, error: new Error('Failed to create role-specific profile') };
        }
      }

      // Step 5: Update user state with complete profile data
      await updateUserState(authData.session, setUser);

      // Step 6: Handle email verification
      if (!authData.session) {
        // Email verification is required
        return { 
          data: { 
            user: authData.user,
            session: null,
            profile: profile,
            requiresVerification: true
          }, 
          error: null 
        };
      }

      return { 
        data: { 
          user: authData.user,
          session: authData.session,
          profile: profile,
          requiresVerification: false
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('An unexpected error occurred') 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('Starting sign out process');
      setIsLoading(true);
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }
      
      // Then clear the state
      clearAuthState();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, make sure we clear the state
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading: isLoading && !isInitialized, // Only show loading on initial load
    isSeller: user?.user_type === 'seller',
    signIn,
    signUp,
    signOut,
    authError,
    clearAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
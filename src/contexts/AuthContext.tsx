import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: 'buyer' | 'seller') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to update user state with profile data
  const updateUserState = async (session: any, setUser: (user: User | null) => void) => {
    try {
      if (!session?.user) {
        console.log('No user in session, setting user to null');
        setUser(null);
        return;
      }

      console.log('Updating user state for:', session.user.id);
      console.log('User metadata:', session.user.user_metadata);
      
      // First try to get the profile
      console.log('Attempting to fetch profile from database...');
      let profile;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('Profile fetch response:', { data: profileData, error: profileError });

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        console.log('Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // If profile doesn't exist, create it
        console.log('Profile not found, creating new profile');
        const profileData = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.email?.split('@')[0] || '',
          full_name: session.user.user_metadata?.full_name || '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          user_type: session.user.user_metadata?.user_type || 'buyer',
          is_verified: false,
          bio: '',
          website: ''
        };
        
        console.log('Creating profile with data:', profileData);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        console.log('Profile creation response:', { data: newProfile, error: createError });

        if (createError) {
          console.error('Error creating profile:', createError);
          console.log('Profile creation error details:', {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
          });
          throw createError;
        }
        
        console.log('Successfully created new profile:', newProfile);
        profile = newProfile;
      } else {
        console.log('Successfully fetched existing profile:', profileData);
        
        // Update profile if bio or website is null
        if (profileData.bio === null || profileData.website === null) {
          console.log('Profile has null fields, updating...');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              bio: profileData.bio === null ? '' : profileData.bio,
              website: profileData.website === null ? '' : profileData.website
            })
            .eq('id', session.user.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating profile:', updateError);
          } else {
            console.log('Successfully updated profile:', updatedProfile);
            profile = updatedProfile;
          }
        } else {
          profile = profileData;
        }
      }

      // Get role-specific profile
      const userType = profile?.user_type || session.user.user_metadata?.user_type || 'buyer';
      const roleProfileTable = userType === 'seller' ? 'seller_profiles' : 'buyer_profiles';
      
      console.log('Checking for role profile in table:', roleProfileTable);
      let roleProfile;
      const { data: roleProfileData, error: roleError } = await supabase
        .from(roleProfileTable)
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('Role profile fetch response:', { data: roleProfileData, error: roleError });

      if (roleError) {
        console.error('Error fetching role profile:', roleError);
        console.log('Role profile error details:', {
          code: roleError.code,
          message: roleError.message,
          details: roleError.details,
          hint: roleError.hint
        });
        
        // Create role profile if it doesn't exist
        const roleProfileData = { 
          id: session.user.id,
          ...(userType === 'seller' ? {
            artist_bio: '',
            portfolio_url: '',
            social_links: {},
            total_sales: 0,
            total_revenue: 0
          } : {
            favorite_artists: [],
            purchase_history: [],
            saved_artworks: []
          })
        };

        console.log('Creating role profile with data:', roleProfileData);

        const { data: newRoleProfile, error: createRoleError } = await supabase
          .from(roleProfileTable)
          .insert(roleProfileData)
          .select()
          .single();

        console.log('Role profile creation response:', { data: newRoleProfile, error: createRoleError });

        if (createRoleError) {
          console.error('Error creating role profile:', createRoleError);
          console.log('Role profile creation error details:', {
            code: createRoleError.code,
            message: createRoleError.message,
            details: createRoleError.details,
            hint: createRoleError.hint
          });
          throw createRoleError;
        }

        console.log('Successfully created role profile:', newRoleProfile);
        roleProfile = newRoleProfile;
      } else {
        console.log('Successfully fetched role profile:', roleProfileData);
        roleProfile = roleProfileData;
      }

      // Set the user state with complete profile data
      const userData = {
        id: session.user.id,
        email: session.user.email || '',
        username: profile?.username || session.user.email?.split('@')[0] || '',
        full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
        avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
        user_type: profile?.user_type || session.user.user_metadata?.user_type || 'buyer',
        bio: profile?.bio || '',
        website: profile?.website || '',
        is_artist: userType === 'seller',
        is_verified: profile?.is_verified || false
      };
      
      console.log('Setting user state with data:', userData);
      setUser(userData);
      console.log('User state updated successfully');
    } catch (error: any) {
      console.error('Error in updateUserState:', error);
      console.log('Full error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      // Set a basic user state even if profile fetch fails
      const fallbackUserData = {
        id: session.user.id,
        email: session.user.email || '',
        user_type: session.user.user_metadata?.user_type || 'buyer',
        is_artist: session.user.user_metadata?.user_type === 'seller'
      };
      console.log('Setting fallback user state:', fallbackUserData);
      setUser(fallbackUserData);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      if (session) {
        updateUserState(session, setUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (event === 'SIGNED_IN') {
        console.log('Processing sign in event for user:', session?.user?.id);
        updateUserState(session, setUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userType: 'buyer' | 'seller') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType
        }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate('/');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    setUser({ ...user, ...updates });
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
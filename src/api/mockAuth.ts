// Mock data for the auth demo
const DEMO_USERS = [
  {
    id: 'admin-user-id',
    email: 'admin@artify.com',
    password: 'admin123',
    profile: {
      id: 'admin-user-id',
      username: 'admin',
      full_name: 'Admin User',
      avatar_url: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
      website: null,
      bio: 'Platform administrator',
      user_type: 'admin',
      is_artist: false,
      is_verified: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'seller-user-id',
    email: 'artist@artify.com',
    password: 'artist123',
    profile: {
      id: 'seller-user-id',
      username: 'artistuser',
      full_name: 'Artist User',
      avatar_url: 'https://ui-avatars.com/api/?name=Artist+User&background=random',
      website: 'https://artistportfolio.com',
      bio: 'Digital artist specializing in fantasy illustrations',
      user_type: 'seller',
      is_artist: true,
      is_verified: true,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: 'buyer-user-id',
    email: 'user@artify.com',
    password: 'user123',
    profile: {
      id: 'buyer-user-id',
      username: 'collector',
      full_name: 'Regular User',
      avatar_url: 'https://ui-avatars.com/api/?name=Regular+User&background=random',
      website: null,
      bio: 'Art enthusiast and collector',
      user_type: 'buyer',
      is_artist: false,
      is_verified: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  }
];

// Store the current user in memory
let currentUser = null;
let currentSession = null;

/**
 * Simulated delay to mimic API calls
 */
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  await delay();
  
  const user = DEMO_USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (!user) {
    return { 
      session: null, 
      user: null, 
      error: new Error('Invalid login credentials') 
    };
  }
  
  // Create mock session and store current user
  const session = {
    access_token: `mock_token_${user.id}`,
    refresh_token: `mock_refresh_${user.id}`,
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { username: user.profile.username }
    },
    expires_at: Date.now() + 60 * 60 * 1000 // 1 hour
  };
  
  currentUser = user;
  currentSession = session;
  
  return { session, user: session.user, error: null };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  await delay();
  currentUser = null;
  currentSession = null;
  return { error: null };
}

/**
 * Sign up with email, password, and invitation token
 */
export async function signUp(email: string, password: string, username: string, inviteToken: string) {
  await delay();
  
  // In demo mode, any valid-looking token is accepted
  if (!inviteToken || inviteToken.length < 6) {
    return { 
      user: null, 
      error: new Error('Invalid invitation token') 
    };
  }
  
  // Check if email is already used
  if (DEMO_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return {
      user: null,
      error: new Error('Email already in use')
    };
  }
  
  // Create a new user
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    profile: {
      id: `user-${Date.now()}`,
      username,
      full_name: null,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      website: null,
      bio: null,
      user_type: 'buyer',
      is_artist: false,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
  
  DEMO_USERS.push(newUser);
  
  return { 
    user: {
      id: newUser.id,
      email: newUser.email,
      user_metadata: { username: newUser.profile.username }
    }, 
    error: null 
  };
}

/**
 * Request password reset
 */
export async function resetPassword(email: string) {
  await delay();
  // Just simulate success regardless of email
  return { data: {}, error: null };
}

/**
 * Get the current session
 */
export async function getCurrentSession() {
  await delay();
  return { 
    data: { session: currentSession }, 
    error: null 
  };
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  await delay();
  if (!currentUser) {
    return { user: null, error: null };
  }
  
  return { 
    user: {
      id: currentUser.id,
      email: currentUser.email,
      user_metadata: { username: currentUser.profile.username }
    }, 
    error: null 
  };
}

/**
 * Get user profile
 */
export async function getProfile(userId: string) {
  await delay();
  const user = DEMO_USERS.find(u => u.id === userId);
  if (!user) {
    return { data: null, error: new Error('User not found') };
  }
  
  return { data: user.profile, error: null };
} 
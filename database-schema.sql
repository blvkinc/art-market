-- PROFILES TABLE
-- Base profile information for all users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'seller', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- BUYER PROFILES TABLE
-- Additional information specific to buyers
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  favorite_artists UUID[] DEFAULT '{}',
  purchase_history JSONB DEFAULT '[]',
  saved_artworks UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- SELLER PROFILES TABLE
-- Additional information specific to sellers
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID REFERENCES public.profiles(id) PRIMARY KEY,
  artist_bio TEXT,
  portfolio_url TEXT,
  social_links JSONB DEFAULT '{}',
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for buyer profiles
CREATE POLICY "Buyers can view their own profile" 
  ON public.buyer_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Buyers can update their own profile" 
  ON public.buyer_profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for seller profiles
CREATE POLICY "Seller profiles are viewable by everyone" 
  ON public.seller_profiles FOR SELECT USING (true);

CREATE POLICY "Sellers can update their own profile" 
  ON public.seller_profiles FOR UPDATE USING (auth.uid() = id);

-- ARTWORKS TABLE
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  preview_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  license_options JSONB DEFAULT '[]',
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  is_sold BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artworks
CREATE POLICY "Artworks are viewable by everyone" 
  ON public.artworks FOR SELECT USING (true);

CREATE POLICY "Users can insert their own artworks" 
  ON public.artworks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artworks" 
  ON public.artworks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artworks" 
  ON public.artworks FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES public.profiles(id) NOT NULL,
  following_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Follows are viewable by everyone" 
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" 
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID REFERENCES public.artworks(id) NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  license_type TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales
CREATE POLICY "Users can view their own sales" 
  ON public.sales FOR SELECT USING (
    auth.uid() = seller_id OR auth.uid() = buyer_id
  );

CREATE POLICY "Users can insert their own purchases" 
  ON public.sales FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  artwork_id UUID REFERENCES public.artworks(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, artwork_id)
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Likes are viewable by everyone" 
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Users can like artworks" 
  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike artworks" 
  ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  artwork_id UUID REFERENCES public.artworks(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Users can post comments" 
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  artwork_id UUID REFERENCES public.artworks(id) NOT NULL,
  license_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, artwork_id, license_type)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cart items
CREATE POLICY "Users can view their own cart" 
  ON public.cart_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their cart" 
  ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart" 
  ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from their cart" 
  ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
CREATE POLICY "Only admins can view invitations" 
  ON public.invitations FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can create invitations" 
  ON public.invitations FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Public can verify their own invitations by token" 
  ON public.invitations FOR SELECT
  USING (true);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username TEXT;
  user_type TEXT;
BEGIN
  -- Get username from email or metadata
  username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer');

  -- Create base profile
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio,
    user_type,
    is_artist,
    is_verified
  ) VALUES (
    NEW.id,
    username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    user_type,
    user_type = 'seller',
    false
  );

  -- Create role-specific profile
  IF user_type = 'seller' THEN
    INSERT INTO public.seller_profiles (id) VALUES (NEW.id);
  ELSE
    INSERT INTO public.buyer_profiles (id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to clean up unverified users
CREATE OR REPLACE FUNCTION public.cleanup_unverified_users()
RETURNS void AS $$
DECLARE
    unverified_user RECORD;
BEGIN
    -- Get all unverified users older than 24 hours
    FOR unverified_user IN 
        SELECT id, email 
        FROM auth.users 
        WHERE email_confirmed_at IS NULL 
        AND created_at < NOW() - INTERVAL '24 hours'
    LOOP
        -- Delete from role-specific tables first
        DELETE FROM public.buyer_profiles WHERE id = unverified_user.id;
        DELETE FROM public.seller_profiles WHERE id = unverified_user.id;
        
        -- Delete from base profile
        DELETE FROM public.profiles WHERE id = unverified_user.id;
        
        -- Delete from auth.users
        DELETE FROM auth.users WHERE id = unverified_user.id;
        
        RAISE LOG 'Cleaned up unverified user: %', unverified_user.email;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resend verification email
CREATE OR REPLACE FUNCTION public.resend_verification_email(user_email TEXT)
RETURNS boolean AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE LOG 'User not found: %', user_email;
        RETURN false;
    END IF;
    
    -- Update the user's email_confirmed_at to NULL to trigger a new verification email
    UPDATE auth.users 
    SET email_confirmed_at = NULL 
    WHERE id = user_id;
    
    RAISE LOG 'Reset verification for user: %', user_email;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up unverified users (runs daily)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'cleanup-unverified-users',
    '0 0 * * *', -- Run at midnight every day
    $$
    SELECT public.cleanup_unverified_users();
    $$
); 
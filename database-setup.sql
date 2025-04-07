-- PROFILES TABLE
-- Base profile information for all users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'seller', 'admin')),
  is_artist BOOLEAN DEFAULT false,
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

-- ARTWORKS TABLE
CREATE TABLE IF NOT EXISTS public.artworks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  image_url TEXT NOT NULL,
  artist_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
  id SERIAL PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) NOT NULL,
  following_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(follower_id, following_id)
);

-- LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  artwork_id INTEGER REFERENCES public.artworks(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, artwork_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for artworks
CREATE POLICY "Artworks are viewable by everyone" 
  ON public.artworks FOR SELECT USING (true);

CREATE POLICY "Users can insert their own artworks" 
  ON public.artworks FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update their own artworks" 
  ON public.artworks FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Users can delete their own artworks" 
  ON public.artworks FOR DELETE USING (auth.uid() = artist_id);

-- RLS Policies for follows
CREATE POLICY "Follows are viewable by everyone" 
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" 
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for likes
CREATE POLICY "Likes are viewable by everyone" 
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Users can like artworks" 
  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike artworks" 
  ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username TEXT;
  user_type TEXT;
  user_email TEXT;
BEGIN
  -- Get username from email or metadata
  user_email := NEW.email;
  username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer');

  -- Create base profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    avatar_url,
    bio,
    website,
    user_type,
    is_artist,
    is_verified
  ) VALUES (
    NEW.id,
    user_email,
    username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'website', ''),
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

-- Function to update profile type
CREATE OR REPLACE FUNCTION public.update_profile_type(user_id UUID, new_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_type TEXT;
BEGIN
  -- Check if new_type is valid
  IF new_type NOT IN ('buyer', 'seller', 'admin') THEN
    RAISE EXCEPTION 'Invalid user type: %', new_type;
    RETURN FALSE;
  END IF;

  -- Get current user type
  SELECT user_type INTO current_type 
  FROM public.profiles
  WHERE id = user_id;

  -- If no change, return true
  IF current_type = new_type THEN
    RETURN TRUE;
  END IF;

  -- Update profile
  UPDATE public.profiles
  SET user_type = new_type,
      is_artist = (new_type = 'seller'),
      updated_at = NOW()
  WHERE id = user_id;

  -- Handle role-specific profiles
  IF current_type = 'buyer' AND new_type = 'seller' THEN
    -- Convert from buyer to seller
    DELETE FROM public.buyer_profiles WHERE id = user_id;
    INSERT INTO public.seller_profiles (id) VALUES (user_id);
  ELSIF current_type = 'seller' AND new_type = 'buyer' THEN
    -- Convert from seller to buyer
    DELETE FROM public.seller_profiles WHERE id = user_id;
    INSERT INTO public.buyer_profiles (id) VALUES (user_id);
  ELSIF new_type = 'buyer' THEN
    -- New buyer profile
    INSERT INTO public.buyer_profiles (id) VALUES (user_id)
    ON CONFLICT (id) DO NOTHING;
  ELSIF new_type = 'seller' THEN
    -- New seller profile
    INSERT INTO public.seller_profiles (id) VALUES (user_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error updating profile type: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
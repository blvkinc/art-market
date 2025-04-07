-- Create a 'roles' table to manage user roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL, -- e.g., 'admin', 'moderator', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "Roles are viewable by everyone" 
  ON public.roles FOR SELECT USING (true);

-- Only admins can modify roles
CREATE POLICY "Only admins can insert roles" 
  ON public.roles FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update roles" 
  ON public.roles FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete roles" 
  ON public.roles FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a seller
CREATE OR REPLACE FUNCTION is_seller(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND user_type = 'seller'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a buyer
CREATE OR REPLACE FUNCTION is_buyer(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND user_type = 'buyer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view all profiles
CREATE POLICY "Allow public read access to profiles"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY "Allow admins to update any profile"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for artworks
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Allow public read access to artworks
CREATE POLICY "Allow public read access to artworks"
  ON artworks FOR SELECT
  USING (true);

-- Allow sellers to create artworks
CREATE POLICY "Allow sellers to create artworks"
  ON artworks FOR INSERT
  WITH CHECK (is_seller(auth.uid()));

-- Allow sellers to update their own artworks
CREATE POLICY "Allow sellers to update own artworks"
  ON artworks FOR UPDATE
  USING (is_seller(auth.uid()) AND artist_id = auth.uid());

-- Allow admins to update any artwork
CREATE POLICY "Allow admins to update any artwork"
  ON artworks FOR UPDATE
  USING (is_admin(auth.uid()));

-- Function to update a user's role
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, is_admin BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Update the role
  IF is_admin THEN
    -- First delete any existing admin role
    DELETE FROM public.roles 
    WHERE user_id = target_user_id AND role = 'admin';
    
    -- Then insert the new role
    INSERT INTO public.roles (user_id, role)
    VALUES (target_user_id, 'admin');
  ELSE
    -- Remove admin role
    DELETE FROM public.roles 
    WHERE user_id = target_user_id AND role = 'admin';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get sales by time period (day, week, month, year)
CREATE OR REPLACE FUNCTION public.get_sales_by_period(period_type TEXT)
RETURNS TABLE (
  period TEXT,
  count BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN period_type = 'day' THEN TO_CHAR(created_at, 'YYYY-MM-DD')
      WHEN period_type = 'week' THEN TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD')
      WHEN period_type = 'month' THEN TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM')
      WHEN period_type = 'year' THEN TO_CHAR(DATE_TRUNC('year', created_at), 'YYYY')
      ELSE TO_CHAR(created_at, 'YYYY-MM-DD')
    END AS period,
    COUNT(*),
    SUM(price)
  FROM
    public.sales
  GROUP BY
    period
  ORDER BY
    period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
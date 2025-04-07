// Define basic database models

export type UserType = 'buyer' | 'seller' | 'admin';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  user_type: UserType;
  is_artist: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  thumbnail_url?: string;
  preview_url?: string;
  category: string;
  tags: string[];
  license_options: LicenseOption[];
  artist_id: string;
  status: 'draft' | 'published' | 'sold';
  views: number;
  created_at: string;
  updated_at: string;
  artist?: Profile;
}

export interface LicenseOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Sale {
  id: string;
  artwork_id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  license_type: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  created_at: string;
  artworks?: Artwork;
  profiles?: Profile;
}

export interface Like {
  id: string;
  user_id: string;
  artwork_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  artwork_id: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface CartItem {
  id: string;
  user_id: string;
  artwork_id: string;
  license_type: string;
  created_at: string;
  artworks?: Artwork;
}

export interface Stats {
  totalUsers: number;
  totalArtworks: number;
  totalSales: number;
  totalRevenue: number;
}

export interface PeriodSalesData {
  period: string;
  count: number;
  revenue: number;
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  created_by: string;
  role: UserType;
  expires_at: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
} 
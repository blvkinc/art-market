# Artify - Digital Art Marketplace

A modern platform for digital artists to showcase and sell their artwork with advanced features for licensing, community building, and monetization.

## Features

### For Artists
- Customizable profiles with bio, portfolio, and social links
- Multiple file format support and watermarking
- Different licensing options (personal, commercial, exclusive)
- Various monetization options (fixed price, auctions, subscriptions)
- Analytics on artwork performance

### For Collectors
- Discover unique digital art across various categories
- Secure transactions with multiple payment options
- License management for purchased art
- Community features to follow favorite artists

### Platform Features
- Responsive design with animations powered by Framer Motion and GSAP
- Full authentication system with Supabase
- Secure database with row-level security
- Admin dashboard for platform management

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, GSAP
- **Backend**: Supabase (Authentication, Database, Storage)
- **Hosting**: Vercel/Netlify (recommended)

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account

### Local Development

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd artify
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up Supabase**
   - Create a new project in Supabase
   - Run the SQL scripts from `database-schema.sql` and `database-functions.sql` in the Supabase SQL editor
   - Create storage buckets: `user-content` and `artwork-images`
   - Set up storage policies to allow uploads

4. **Configure environment variables**
   - Create a `.env` file based on the `.env.example`
   - Add your Supabase URL and anon key

5. **Start the development server**
   ```
   npm run dev
   ```

### Database Setup

The SQL scripts in this project will create the following tables:
- `profiles`: User profiles extending Supabase Auth
- `artworks`: Digital art listings with metadata
- `sales`: Record of purchases
- `likes`: User likes on artworks
- `follows`: User follow relationships
- `comments`: Comments on artworks
- `cart_items`: Shopping cart items
- `roles`: User role management for admin access

### Deployment

1. **Build the application**
   ```
   npm run build
   ```

2. **Deploy to hosting provider**
   - Deploy to Vercel/Netlify with environment variables set
   - Ensure Supabase project is on a paid plan for production use

## API Documentation

The `src/api` directory contains all the functions for interacting with Supabase:
- `auth.ts`: Authentication-related functions
- `profiles.ts`: User profile management
- `artworks.ts`: Artwork CRUD operations
- `cart.ts`: Shopping cart and checkout
- `admin.ts`: Admin dashboard functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Setting Up Authentication

This application uses Supabase for authentication and database functionality. Follow these steps to set up your environment:

1. **Create a Supabase Project**:
   - Go to [Supabase](https://app.supabase.co/) and create a new project
   - Note your project URL and anon key from the API settings

2. **Set Environment Variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL and anon key

3. **Database Setup**:
   - Run the SQL scripts from `database-schema.sql` and `database-functions.sql` in the Supabase SQL editor
   - This will create the necessary tables, functions, and permissions

4. **Start the Development Server**:
   ```bash
   npm install
   npm run dev
   ```

5. **Create Admin User**:
   - Sign up through the UI or directly in Supabase Auth
   - Use the SQL editor to update the user's role to 'admin':
   ```sql
   UPDATE profiles SET user_type = 'admin' WHERE id = 'your-user-id';
   ```

## Authentication Flow

The application implements an invite-only authentication system:

1. **User Request**: Users request invitations through the form
2. **Admin Approval**: Admins generate invitation links with preset roles
3. **Registration**: Invited users can register with their token
4. **Role-Based Access**: Different UI and permissions based on user roles:
   - **Admin**: Full system access, invitation management
   - **Seller/Artist**: Artwork management, sales tracking
   - **Buyer**: Browsing, purchasing, collection management 
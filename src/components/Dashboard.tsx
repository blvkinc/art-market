import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, signOut, isAdmin, isSeller, isBuyer } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect happens automatically due to the protected route
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Welcome, {profile?.username || user?.email}</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email: {user?.email}</p>
              <p className="text-gray-600">Username: {profile?.username || 'Not set'}</p>
              <p className="text-gray-600">Role: {profile?.user_type || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-600">Full Name: {profile?.full_name || 'Not set'}</p>
              <p className="text-gray-600">Artist: {profile?.is_artist ? 'Yes' : 'No'}</p>
              <p className="text-gray-600">Verified: {profile?.is_verified ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isAdmin && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold mb-3 text-purple-800">Admin Tools</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/admin/invitations" 
                    className="text-purple-600 hover:text-purple-800 font-medium block"
                  >
                    Manage Invitations
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/users" 
                    className="text-purple-600 hover:text-purple-800 font-medium block"
                  >
                    Manage Users
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/artworks" 
                    className="text-purple-600 hover:text-purple-800 font-medium block"
                  >
                    Moderate Artworks
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {isSeller && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Seller Tools</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/artworks/upload" 
                    className="text-blue-600 hover:text-blue-800 font-medium block"
                  >
                    Upload Artwork
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/artworks/manage" 
                    className="text-blue-600 hover:text-blue-800 font-medium block"
                  >
                    Manage My Artworks
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/sales" 
                    className="text-blue-600 hover:text-blue-800 font-medium block"
                  >
                    My Sales History
                  </Link>
                </li>
              </ul>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold mb-3 text-green-800">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/explore" 
                  className="text-green-600 hover:text-green-800 font-medium block"
                >
                  Explore Artworks
                </Link>
              </li>
              <li>
                <Link 
                  to="/artists" 
                  className="text-green-600 hover:text-green-800 font-medium block"
                >
                  Browse Artists
                </Link>
              </li>
              {isBuyer && (
                <li>
                  <Link 
                    to="/cart" 
                    className="text-green-600 hover:text-green-800 font-medium block"
                  >
                    My Cart
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
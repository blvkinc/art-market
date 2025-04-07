import { useState, useEffect } from 'react';
import { createInvitation, getInvitations, revokeInvitation } from '../../api/admin';
import { Invitation } from '../../types/models';
import { useAuth } from '../../contexts/AuthContext';

export default function InvitationManager() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [expiryDays, setExpiryDays] = useState(7);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const { invitations, error } = await getInvitations();
      if (error) {
        setError(error.message);
      } else {
        setInvitations(invitations || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setInviteLink(null);
      
      const { invitation, inviteLink, error } = await createInvitation(email, role, expiryDays);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(`Invitation sent to ${email}`);
        setInviteLink(inviteLink || null);
        setEmail('');
        loadInvitations();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await revokeInvitation(id);
      if (error) {
        setError(error.message);
      } else {
        loadInvitations();
        setSuccess('Invitation revoked successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Invite link copied to clipboard!');
  };

  if (!isAdmin) {
    return <div className="text-center py-8">You don't have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Invitation Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      {inviteLink && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Invitation Link:</p>
          <div className="flex items-center mt-2">
            <input 
              type="text" 
              readOnly 
              value={inviteLink} 
              className="flex-grow p-2 border rounded"
            />
            <button 
              onClick={() => copyToClipboard(inviteLink)}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Invitation</h2>
        
        <form onSubmit={handleCreateInvitation}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'buyer' | 'seller' | 'admin')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiry">
              Expires In (Days)
            </label>
            <input
              id="expiry"
              type="number"
              min="1"
              max="30"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Invitation'}
          </button>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Active Invitations</h2>
        
        {loading ? (
          <p>Loading invitations...</p>
        ) : invitations.length === 0 ? (
          <p>No active invitations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className="py-2 px-4 border-b border-gray-200">{invitation.email}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{invitation.role}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {invitation.is_used ? (
                        <span className="bg-gray-200 text-gray-800 py-1 px-2 rounded text-xs">Used</span>
                      ) : new Date(invitation.expires_at) < new Date() ? (
                        <span className="bg-red-200 text-red-800 py-1 px-2 rounded text-xs">Expired</span>
                      ) : (
                        <span className="bg-green-200 text-green-800 py-1 px-2 rounded text-xs">Active</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {!invitation.is_used && new Date(invitation.expires_at) > new Date() && (
                        <button
                          onClick={() => handleRevokeInvitation(invitation.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
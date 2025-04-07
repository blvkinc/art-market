import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Image, CreditCard, LineChart, Settings, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Mock data - would be fetched from Supabase in production
const mockStats = {
  totalUsers: 1243,
  totalArtworks: 5678,
  totalSales: 432,
  totalRevenue: 123456,
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(mockStats);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set active tab based on URL path
    const path = location.pathname.split('/').pop() || 'overview';
    setActiveTab(path);
  }, [location.pathname]);

  // Tabs for the admin dashboard
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LineChart className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'artworks', label: 'Artworks', icon: <Image className="w-5 h-5" /> },
    { id: 'sales', label: 'Sales', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'database', label: 'Database', icon: <Database className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // Mock function to fetch dashboard stats
  const fetchStats = async () => {
    setIsLoading(true);

    try {
      // In production, we would fetch real data from Supabase
      // Example:
      /*
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('count');

      const { data: artworks, error: artworksError } = await supabase
        .from('artworks')
        .select('count');

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('sum(amount)');

      if (usersError || artworksError || salesError) {
        throw new Error('Error fetching stats');
      }

      setStats({
        totalUsers: users[0].count,
        totalArtworks: artworks[0].count,
        totalSales: sales.length,
        totalRevenue: sales[0].sum,
      });
      */

      // Using mock data for now
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Example admin sub-component: Overview
  const Overview = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Total Users
          </p>
          <h3 className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</h3>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 mb-2 flex items-center">
            <Image className="w-4 h-4 mr-2" />
            Artworks
          </p>
          <h3 className="text-3xl font-bold">{stats.totalArtworks.toLocaleString()}</h3>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 mb-2 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Total Sales
          </p>
          <h3 className="text-3xl font-bold">{stats.totalSales.toLocaleString()}</h3>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 mb-2 flex items-center">
            <LineChart className="w-4 h-4 mr-2" />
            Revenue
          </p>
          <h3 className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center border-b border-white/10 pb-4">
                <div className={`w-2 h-2 rounded-full mr-3 ${i % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm">
                    {i % 2 === 0 ? 'New artwork uploaded' : 'New sale completed'} - {30 - i}m ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Authentication Service</span>
              </div>
              <span className="text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Database</span>
              </div>
              <span className="text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Storage Service</span>
              </div>
              <span className="text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Payment Processing</span>
              </div>
              <span className="text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                <span>Analytics</span>
              </div>
              <span className="text-yellow-500">Degraded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Example admin sub-component: Users management
  const UsersManagement = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users Management</h2>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4">User</th>
              <th className="text-left px-6 py-4">Role</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Joined</th>
              <th className="text-right px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-white/10">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-800 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium">User {i}</p>
                      <p className="text-gray-400 text-sm">user{i}@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{i === 1 ? 'Admin' : 'User'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    i % 3 === 0 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {i % 3 === 0 ? 'Pending' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">2023-0{i}-01</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-white transition-colors duration-200 mr-3">
                    Edit
                  </button>
                  <button className="text-red-400 hover:text-red-500 transition-colors duration-200">
                    Disable
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Example admin sub-component: Artworks management
  const ArtworksManagement = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Artworks Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="h-48 bg-gray-800 relative">
              <div className="absolute bottom-0 right-0 p-2">
                <div className={`px-2 py-1 rounded-full text-xs ${
                  i % 3 === 0 
                    ? 'bg-yellow-500/70 text-white' 
                    : i % 3 === 1 
                      ? 'bg-green-500/70 text-white'
                      : 'bg-red-500/70 text-white'
                }`}>
                  {i % 3 === 0 ? 'Pending' : i % 3 === 1 ? 'Approved' : 'Flagged'}
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1">Artwork Title {i}</h3>
              <p className="text-gray-400 text-sm mb-3">by Artist {i}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">${(i * 99).toLocaleString()}</span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Placeholder for other admin sections
  const Placeholder = ({ title }: { title: string }) => (
    <div className="min-h-[300px] flex items-center justify-center border border-dashed border-white/20 rounded-xl">
      <p className="text-xl text-gray-400">{title} section coming soon</p>
    </div>
  );

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 mb-8 md:mb-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden sticky top-24"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="font-bold text-xl">Admin Panel</h2>
            </div>
            <nav className="p-3">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <Link
                      to={`/admin/${tab.id}`}
                      className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-black'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {tab.icon}
                      <span className="ml-3">{tab.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/artworks" element={<ArtworksManagement />} />
              <Route path="/sales" element={<Placeholder title="Sales" />} />
              <Route path="/database" element={<Placeholder title="Database" />} />
              <Route path="/settings" element={<Placeholder title="Settings" />} />
            </Routes>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
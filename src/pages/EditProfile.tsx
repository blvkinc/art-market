import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    website: '',
    avatar_url: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            username: data.username || '',
            bio: data.bio || '',
            website: data.website || '',
            avatar_url: data.avatar_url || ''
          });
          setAvatarPreview(data.avatar_url);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      }
    };

    loadProfile();
  }, [user]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let avatarUrl = formData.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        console.log('Uploading new avatar...');
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // First, try to delete the old avatar if it exists
        if (formData.avatar_url) {
          const oldPath = formData.avatar_url.split('/').pop();
          if (oldPath) {
            try {
              const { error: deleteError } = await supabase.storage
                .from('user-content')
                .remove([`avatars/${oldPath}`]);
              
              if (deleteError) {
                console.warn('Failed to delete old avatar:', deleteError);
              }
            } catch (deleteErr) {
              console.warn('Error deleting old avatar:', deleteErr);
            }
          }
        }

        // Upload the new avatar
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('user-content')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw new Error(`Failed to upload avatar: ${uploadError.message}`);
        }

        console.log('Avatar uploaded successfully:', uploadData);

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('user-content')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error('Failed to get public URL for uploaded avatar');
        }

        avatarUrl = urlData.publicUrl;
        console.log('New avatar URL:', avatarUrl);
      }

      // Update profile
      console.log('Updating profile with data:', {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        website: formData.website,
        avatar_url: avatarUrl
      });

      const { error: updateError, data: updateData } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      console.log('Profile updated successfully:', updateData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error in profile update process:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-black border border-white/10 rounded-xl p-8"
      >
        <h1 className="text-2xl font-bold mb-6 text-white">Edit Profile</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-200 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white/50 text-2xl">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
              )}
              <label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 bg-white text-black p-1 rounded-full cursor-pointer hover:bg-white/90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-white font-medium">Profile Picture</h3>
              <p className="text-sm text-gray-400">
                Upload a new profile picture (JPG, PNG, GIF)
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-white mb-2">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 text-white"
              placeholder="Enter your full name"
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 text-white"
              placeholder="Choose a username"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 text-white"
              placeholder="Tell us about yourself"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 text-white"
              placeholder="https://your-website.com"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 bg-white text-black rounded-lg font-medium ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile; 
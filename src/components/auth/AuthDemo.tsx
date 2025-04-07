import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthDemo() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Artify Authentication System</h1>
      
      <div className="bg-indigo-100 border border-indigo-300 p-4 rounded-lg mb-8 text-indigo-800">
        <p className="text-lg font-semibold mb-2">⚠️ Connection Required</p>
        <p>This system requires a valid Supabase connection. Make sure you've set up the environment variables:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
        <p className="mt-2">Add these to your .env file or environment configuration.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-blue-700">For New Users</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 1: Request an Invitation</h3>
              <p className="text-gray-700 mb-2">
                Since this is an invite-only platform, new users need to request access.
              </p>
              <Link to="/request-invite" className="text-blue-600 hover:underline block">
                Request an Invitation &rarr;
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 2: Receive Invitation Email</h3>
              <p className="text-gray-700 mb-2">
                After an admin approves your request, you'll receive an email with an invitation link.
              </p>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm italic text-gray-600">
                  The invitation includes a unique token linked to your email address.
                </p>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Step 3: Complete Registration</h3>
              <p className="text-gray-700 mb-2">
                Follow the link in the email to complete your registration.
              </p>
              <Link 
                to="/signup?token=demo123&email=demo@example.com" 
                className="text-blue-600 hover:underline block"
              >
                Go to Signup Form &rarr;
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-green-700">For Existing Users</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Login with Email & Password</h3>
              <p className="text-gray-700 mb-2">
                If you already have an account, simply login with your credentials.
              </p>
              <Link to="/login" className="text-green-600 hover:underline block">
                Go to Login Page &rarr;
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Reset Forgotten Password</h3>
              <p className="text-gray-700 mb-2">
                If you forgot your password, you can request a password reset.
              </p>
              <Link to="/reset-password" className="text-green-600 hover:underline block">
                Go to Password Reset &rarr;
              </Link>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold mb-2 text-yellow-800">Admin Section</h3>
            <p className="text-gray-700 mb-3">
              Admins can manage invitations and users through the admin dashboard.
            </p>
            <Link to="/admin/invitations" className="text-purple-600 hover:underline block">
              View Admin Invitation Manager &rarr;
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Authentication System Features</h2>
        
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Invite-Only Registration:</strong> New users can only sign up with a valid invitation token</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Role-Based Access Control:</strong> Three user types - Admin, Seller, and Buyer</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Admin Invitation Management:</strong> Admins can generate and revoke invitation links</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Password Recovery:</strong> Users can reset their passwords via email</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>Secure Authentication:</strong> Powered by Supabase Auth with JWT tokens</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span><strong>User Profiles:</strong> Profile management with user type and permissions</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 
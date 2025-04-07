import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Artify
        </h1>
        <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto">
          A premium marketplace for digital art. Connect with artists, collect unique pieces, 
          and join our exclusive community.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/login"
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg text-lg w-full md:w-auto"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-blue-700 text-white hover:bg-blue-800 font-bold py-3 px-8 rounded-lg text-lg w-full md:w-auto"
          >
            Sign Up with Invitation
          </Link>
          <Link
            to="/request-invite"
            className="bg-transparent text-white hover:bg-white/10 border border-white font-bold py-3 px-8 rounded-lg text-lg w-full md:w-auto"
          >
            Request Invitation
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">For Artists</h3>
            <p className="text-white/90">
              Showcase your work to a curated audience of collectors and art enthusiasts. 
              Earn from your digital creations with flexible licensing options.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">For Collectors</h3>
            <p className="text-white/90">
              Discover unique digital art from talented creators. Build your collection 
              with confidence using our secure marketplace.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">Exclusive Community</h3>
            <p className="text-white/90">
              Join our invite-only platform to ensure quality interactions and a 
              premium experience for both artists and collectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
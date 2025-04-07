import React from 'react';
import { MessageSquare, Users, Calendar } from 'lucide-react';

function Community() {
  const events = [
    {
      id: 1,
      title: "Digital Art Workshop",
      date: "March 25, 2024",
      time: "2:00 PM PST",
      attendees: 45,
      image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 2,
      title: "NFT Marketing Strategies",
      date: "March 28, 2024",
      time: "11:00 AM PST",
      attendees: 32,
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
    },
  ];

  const discussions = [
    {
      id: 1,
      title: "The Future of Digital Art",
      author: "Elena Chen",
      replies: 24,
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      title: "Best Tools for Digital Artists",
      author: "Marcus Rivera",
      replies: 18,
      lastActive: "4 hours ago",
    },
    {
      id: 3,
      title: "Pricing Your Digital Art",
      author: "Sarah Johnson",
      replies: 35,
      lastActive: "1 day ago",
    },
  ];

  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight mb-12">Community</h1>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white/5 rounded-xl overflow-hidden group">
                <div className="relative h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <button className="w-full py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors">
                    Join Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discussions */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Recent Discussions</h2>
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <h3 className="text-xl font-semibold mb-2">{discussion.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">by {discussion.author}</span>
                    <div className="flex items-center gap-1 text-gray-400">
                      <MessageSquare className="w-4 h-4" />
                      <span>{discussion.replies} replies</span>
                    </div>
                  </div>
                  <span className="text-gray-400">Active {discussion.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;
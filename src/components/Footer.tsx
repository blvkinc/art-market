import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.1 });

  return (
    <motion.footer 
      ref={footerRef}
      className="bg-black border-t border-white/10 text-white py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <motion.div 
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold mb-4">_art</h3>
            <p className="text-gray-300 mb-6">A premium marketplace for digital art.</p>
            <div className="flex space-x-4">
              {[
                { icon: 'twitter', label: 'Twitter' },
                { icon: 'instagram', label: 'Instagram' },
                { icon: 'discord', label: 'Discord' }
              ].map((social) => (
                <motion.a
                  key={social.icon}
                  href="#"
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 text-white/70 hover:text-white hover:border-white transition-colors duration-300"
                >
                  <span className="sr-only">{social.label}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    />
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Artworks', path: '/explore' },
                { label: 'Artists', path: '/artists' },
                { label: 'Featured', path: '/explore?featured=true' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: 'Terms of Service', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Copyright', path: '/copyright' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div 
          className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} _art. All rights reserved.</p>
          <div className="flex space-x-5 mt-6 md:mt-0">
            {[
              { label: 'FAQ', path: '/faq' },
              { label: 'Contact', path: '/contact' },
              { label: 'Support', path: '/support' }
            ].map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className="text-gray-400 text-sm hover:text-white transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer; 
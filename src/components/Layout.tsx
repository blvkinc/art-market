import { ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP initialization for scroll animations
    const ctx = gsap.context(() => {
      // Animate sections as they come into view
      gsap.utils.toArray<HTMLElement>('.animate-on-scroll').forEach((section) => {
        gsap.fromTo(
          section,
          { 
            y: 50, 
            opacity: 0 
          },
          { 
            y: 0, 
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, mainRef);

    return () => ctx.revert(); // Clean up animations
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="pt-20" // Add padding top to account for fixed navbar
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
};

export default Layout; 
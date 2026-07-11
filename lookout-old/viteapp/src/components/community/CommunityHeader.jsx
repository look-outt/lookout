import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '@/assets/logo full.png';

function CommunityHeader() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogoClick = () => {
    navigate(-1)
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 text-white"
    >
      <nav className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between"
        >
          <div onClick={handleLogoClick}>
            <img
              src={logo}
              alt="Logo"
              className="h-10 sm:h-12 cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]"
            />
          </div>
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/15 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </motion.div>

        {/* Pill Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="hidden sm:flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-1.5 sm:px-3 py-1.5 sm:py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.35)] overflow-x-auto whitespace-nowrap"
          style={{ backgroundImage: 'linear-gradient(90deg, rgba(250,204,21,0.06), rgba(255,255,255,0.04))' }}
        >
          {/* Links */}
          <ul className="flex items-center gap-3 sm:gap-8 px-2.5 sm:px-4 text-xs sm:text-base">
            <li>
              <Link
                to="/"
                className="text-gray-200/90 hover:text-white transition-colors font-medium"
              >
                Content Creation
              </Link>
            </li>
            <li>
              <a href="https://forms.gle/ocQ3hBPhRiVrfo9L9" className="text-gray-200/90 hover:text-white transition-colors font-medium">
                Join Community
              </a>
            </li>
          </ul>

          {/* CTA cluster - arrow circle (left) + button (right) that swap on hover */}
          <motion.div
            layout
            transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
            className="group flex items-center gap-2"
          >
            <motion.button
              layout
              transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="order-1 group-hover:order-2 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] transition-colors relative grid place-items-center h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-yellow-400 text-black border border-yellow-300 shadow-[0_8px_24px_rgba(0,0,0,0.45)] group-hover:bg-black group-hover:text-white group-hover:border-white/25 group-hover:-translate-x-1.5 will-change-transform shrink-0"
              aria-label="Go"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </motion.button>

            <motion.div
              layout
              transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="order-2 group-hover:order-1 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] transition-colors relative overflow-hidden rounded-full bg-yellow-400 text-black px-3 py-1.5 sm:px-5 sm:py-2.5 font-semibold tracking-wide border border-yellow-300 shadow-[0_8px_24px_rgba(0,0,0,0.45)] group-hover:bg-black group-hover:text-white group-hover:border-white/25 group-hover:translate-x-1.5 will-change-transform text-xs sm:text-base shrink-0"
            >
              <Link
                to="/login"
                className="relative z-10 block"
              >
                <span className="relative z-10">Sign Up / Login</span>
              </Link>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(250,204,21,0.12))' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="sm:hidden w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.35)]"
            style={{ backgroundImage: 'linear-gradient(90deg, rgba(250,204,21,0.06), rgba(255,255,255,0.04))' }}
          >
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-xl px-3 py-2 text-gray-200/90 hover:text-white hover:bg-white/10 transition-colors font-medium"
                >
                  Content Creation
                </Link>
              </li>
              <li>
                <a
                  href="https://forms.gle/ocQ3hBPhRiVrfo9L9"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-xl px-3 py-2 text-gray-200/90 hover:text-white hover:bg-white/10 transition-colors font-medium"
                >
                  Join Community
                </a>
              </li>
            </ul>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="grid place-items-center h-9 w-9 rounded-full bg-yellow-400 text-black border border-yellow-300 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                aria-label="Go"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </button>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="relative overflow-hidden rounded-full bg-yellow-400 text-black px-4 py-2 font-semibold tracking-wide border border-yellow-300 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              >
                <span className="relative z-10">Sign Up / Login</span>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}

export default CommunityHeader;

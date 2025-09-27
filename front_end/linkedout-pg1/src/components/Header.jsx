import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogoClick = () => {
    navigate(-1) // Navigate to previous page
  }

  const menuItems = [
    { label: 'Write a post', to: '/write-post' },
    { label: 'Our Community', to: '/community' }
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 text-white"
    >
      <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3"
        >
          <div onClick={handleLogoClick}>
            <img
              src="/logo full.png"
              alt="Logo"
              className="h-12 cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]"
            />
          </div>
        </motion.div>

        {/* Pill Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="hidden sm:flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.35)]"
          style={{ backgroundImage: 'linear-gradient(90deg, rgba(250,204,21,0.06), rgba(255,255,255,0.04))' }}
        >
          {/* Links */}
          <ul className="flex items-center gap-8 px-4">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-gray-200/90 hover:text-white transition-colors font-medium">
                  {item.label}
                </Link>
              </li>
            ))}
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
              className="order-1 group-hover:order-2 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] transition-colors relative grid place-items-center h-11 w-11 rounded-full bg-yellow-400 text-black border border-yellow-300 shadow-[0_8px_24px_rgba(0,0,0,0.45)] group-hover:bg-black group-hover:text-white group-hover:border-white/25 group-hover:-translate-x-1.5 will-change-transform"
              aria-label="Go"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="h-5 w-5"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </motion.button>

            <motion.a
              layout
              transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
              href="https://forms.gle/dRrZBMTYFHTcJcTW6"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="order-2 group-hover:order-1 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] transition-colors relative overflow-hidden rounded-full bg-yellow-400 text-black px-5 py-2.5 font-semibold tracking-wide border border-yellow-300 shadow-[0_8px_24px_rgba(0,0,0,0.45)] group-hover:bg-black group-hover:text-white group-hover:border-white/25 group-hover:translate-x-1.5 will-change-transform"
            >
              <span className="relative z-10">Join Waitlist</span>
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(250,204,21,0.12))' }}
              />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Mobile Menu Toggle */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          className="sm:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="sm:hidden px-4 pb-4"
          >
            <div className="rounded-3xl border border-white/15 bg-black/70 backdrop-blur-xl p-4 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
              <ul className="flex flex-col gap-3">
                {menuItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="block rounded-xl px-4 py-3 text-base font-medium text-gray-100/90 transition-colors hover:bg-white/10 hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-3">
                <a
                  href="https://forms.gle/dRrZBMTYFHTcJcTW6"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-full border border-yellow-300 bg-yellow-400 py-3 text-center font-semibold text-black shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-colors hover:bg-black hover:text-white hover:border-white/25"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Waitlist
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header

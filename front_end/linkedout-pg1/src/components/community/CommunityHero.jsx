import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function CommunityHero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-24 text-white sm:pt-28">
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col gap-12 px-4 pb-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex w-full flex-1 flex-col items-start"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-sm text-yellow-300"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
            The home for LinkedIn creators
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            <motion.span
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Linked
            </motion.span>
            <span className="text-white">Out</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg md:text-xl"
          >
            World's largest community for <span className="font-semibold text-yellow-400">LinkedIn content creators</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex w-full max-w-md flex-col gap-4 sm:flex-row"
          >
            <motion.button
              onClick={() => window.open('https://forms.gle/ocQ3hBPhRiVrfo9L9', '_blank')}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(250,204,21,0.35)' }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-4 text-lg font-bold text-black shadow-2xl transition-all duration-300"
            >
              <span className="relative z-10 whitespace-nowrap">Join Community</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/past-events')}
              whileHover={{ scale: 1.05, borderColor: 'rgb(250 204 21)' }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden rounded-2xl border-2 border-yellow-400/50 px-8 py-4 text-lg font-bold text-yellow-400 transition-all duration-300 hover:bg-yellow-400/10"
            >
              <span className="relative z-10 whitespace-nowrap">Explore Past Events</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.button>
          </motion.div>

          {/* Mobile Octopus placement */}
          <motion.div
            className="mt-10 w-full md:hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.div
              animate={{
                y: ['-12px', '12px'],
                rotate: [-2, 2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'reverse'
              }}
              className="mx-auto max-w-xs"
            >
              <img
                src="/lo2/octopus.png"
                alt="LinkedOut Octopus Mascot"
                className="w-full drop-shadow-[0_0_25px_rgba(250,204,21,0.25)]"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Desktop Octopus */}
        <motion.div
          className="relative hidden flex-1 items-center justify-center md:flex"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <motion.div
            className="relative"
            animate={{ y: ['-15px', '15px'], rotate: [-2, 2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
          >
            <img
              src="/lo2/octopus.png"
              alt="LinkedOut Octopus Mascot"
              className="w-[clamp(260px,32vw,480px)] drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default CommunityHero;

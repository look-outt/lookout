import React from 'react';
import { motion } from 'framer-motion';
import SectionStatCard from './SectionStatCard';
import CARDS_DATA from './cards.data';

// Renders the whole cards section with fresh bento-style layout
export default function CardsSection() {
  return (
    <div className="mt-32 mb-24 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-block px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-semibold mb-6"
          whileHover={{ scale: 1.05 }}
        >
          ✨ Platform Features
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Everything You Need to
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
            Create Amazing Content
          </span>
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Powerful AI-driven tools designed to help you create, optimize, and grow your LinkedIn presence effortlessly.
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div className="space-y-8">
        {CARDS_DATA.map((card, index) => (
          <SectionStatCard key={card.title} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

// Fresh redesigned card section with modern bento-style layout
export default function SectionStatCard({ card, index }) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.2 }}
    >
      {/* Main Card Container - Bento Style */}
      <div className="relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-500/50 transition-all duration-500">
        
        {/* Animated Background Gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Glowing Orb Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl group-hover:bg-yellow-500/30 transition-all duration-700" />
        
        <div className="relative p-8 md:p-12">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              {/* Number Badge */}
              <motion.div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <span className="text-2xl font-bold text-yellow-500">0{index + 1}</span>
              </motion.div>

              {/* Title */}
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                {card.desc}
              </p>
            </div>

            {/* Icon */}
            <motion.div
              className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              {card.icon}
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {card.stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="relative group/stat"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 hover:border-yellow-500/30 transition-all duration-300">
                  {/* Stat Value */}
                  <motion.div
                    className="text-2xl md:text-3xl font-bold text-white mb-1"
                    animate={{
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: idx * 0.2
                    }}
                  >
                    {stat}
                  </motion.div>
                  
                  {/* Stat Label */}
                  <div className="text-xs text-white/50 font-medium uppercase tracking-wider">
                    {card.labels[idx]}
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 rounded-2xl bg-yellow-500/0 group-hover/stat:bg-yellow-500/5 transition-colors duration-300" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Pills */}
          <div className="flex flex-wrap gap-3">
            {card.features?.map((feature, idx) => (
              <motion.div
                key={idx}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-yellow-500/10 hover:border-yellow-500/30 hover:text-yellow-500 transition-all duration-300 cursor-default"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {feature}
              </motion.div>
            ))}
          </div>

          {/* Bottom Accent Line */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>

        {/* Floating Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-500/50 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

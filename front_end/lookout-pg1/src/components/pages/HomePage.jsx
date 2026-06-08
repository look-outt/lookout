import Header from '../Header';
import { Image } from '@/components/ui/image';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
// No backend: use local data for testimonials
import TESTIMONIALS from '@/sections/home/Community/testimonials.data.js';
import ThreeBackground from '../ui/ThreeBackground';
import CardsSection from '@/sections/home/Cards/CardsSection';
import useMounted from '@/hooks/useMounted';
import HeroHeadline from '@/sections/home/Hero/HeroHeadline';
import CommunitySection from '@/components/community/CommunitySection';
import CommunityFooter from '@/components/community/CommunityFooter';

const FeatureBoxes = React.lazy(() => import('../ui/feature-boxes'));
// Heavy UI components are lazy-loaded in their respective sections/components

// Positioned to match the exact 9 people in the reference image with red arrows
const silhouettes = [
  { 
    id: 1, 
    x: 10,  // First person (leftmost, woman in white top)
    y: 15,  // Positioned just above head
    name: "Prarthi Gula",
    position: "Student",
    company: "IGDTUW",
    review: "LookOut transformed my professional presence. The platform's comprehensive profile tools helped me secure three interviews in my first week. The intuitive interface made networking effortless and effective.",
    image: "/person1.jpg"
  },
  { 
    id: 2, 
    x: 33,  // Positioned for the person in black top
    y: 18,  // Adjusted for alignment
    name: "Piyush Singh",
    position: "Building @FYHSstudio | Personal Nutritionist",
    company: "",
    review: "As a nutrition coach, I've built a thriving practice with 500+ clients in just six months, thanks to LookOut's powerful networking tools. The platform's professional community features have been instrumental in establishing my credibility and connecting me with clients who value expert guidance.",
    image: "/person3.jpg"
  },
  { 
    id: 4, 
    x: 42,  // Fourth person
    y: 18,  // Positioned just above head
    name: "Ayushi Jain",
    position: "SDE Intern",
    company: "Salesforce | Research @ IISc",
    review: "Balancing research at IISc with internship applications was challenging until I discovered LookOut. The platform's extensive professional network connected me with an incredible opportunity at Salesforce, perfectly aligning with my technical skills and career aspirations.",
    image: "/person4.jpg"
  },
  { 
    id: 5, 
    x: 52,  // Fifth person (woman in white top, center)
    y: 15,  // Positioned just above head
    name: "Stuti Gupta",
    position: "President",
    company: "SattvaCS at Kalindi College",
    review: "As President of SattvaCS, I've seen firsthand how LookOut has elevated our technical society. The platform's event management and networking features have helped us connect with industry leaders and organize high-profile tech events, significantly enhancing our members' professional development.",
    image: "/person5.jpg"
  },
  { 
    id: 6, 
    x: 62,  // Sixth person (woman in blue shirt)
    y: 17,  // Positioned just above head
    name: "Deepanksha Saxena",
    position: "Founder",
    company: "Jackpot Sales Consulting",
    review: "Building Jackpot Sales Consulting from the ground up has been an incredible journey. LookOut's professional networking features and company pages have been invaluable in connecting us with Fortune 500 clients and establishing our reputation in the consulting space.",
    image: "/person6.jpg"
  },
  { 
    id: 7, 
    x: 72,  // Seventh person (Pranay Agarwal)
    y: 18,  // Positioned just above head
    name: "Pranay Agarwal",
    position: "Tech Lead, LookOut",
    company: "BSc at IIT Madras",
    review: "Leading the technology team at LookOut while pursuing my BSc at IIT Madras has been an extraordinary opportunity. Our platform is redefining professional networking for the next generation, and I'm proud to contribute to its development with features that foster meaningful professional connections.",
    image: "/person7.jpg"
  },
  { 
    id: 8, 
    x: 92,  // Last person (far right)
    y: 17,  // Positioned just above head
    name: "Gungun Yadav",
    position: "Founders Office Associate",
    company: "Linkvenza",
    review: "My journey from intern to Founders Office Associate at Linkvenza in just six months was accelerated by strategic networking on LookOut. The platform's messaging and connection features enabled me to build meaningful professional relationships that opened doors to this incredible opportunity.",
    image: "/person9.jpg"
  }
];


export default function HomePage() {
  const [testimonials, setTestimonials] = useState([]);
  const [hoveredSilhouette, setHoveredSilhouette] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const headlineRef = useRef(null);
  const mounted = useMounted();
  const reviewRef = useRef(null);
  
  // Removed default selection of first review
  
  const handleReviewClick = (silhouette) => {
    setSelectedReview(silhouette);
    setShowWelcome(false);
    setHasInteracted(true);
    // Smooth scroll to the review section on mobile
    if (window.innerWidth < 768) {
      reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    // For landing page without backend, hydrate from local static data
    setTestimonials(TESTIMONIALS);
  }, []);

  // mounted is handled by useMounted() hook for hydration-safe refs

  
  const handleSilhouetteClick = (silhouetteId) => {
    const silhouette = silhouettes.find((s) => s.id === silhouetteId);
    if (!silhouette) return;
    handleReviewClick(silhouette);
    if (window.innerWidth < 768) {
      reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleKeyDown = (event, silhouetteId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSilhouetteClick(silhouetteId);
    }
  };

  const phrases = useMemo(() => [
    'Post smarter, faster',
    'Own your golden voice',
    'Create. Ship. Shine.'
  ], []);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const scrollPhrases = useMemo(() => [
    'Stop struggling with generic tools — create what sounds like you.',
    'AI‑powered content in seconds — tailored to your voice.',
    'Write less, ship faster — keep your golden tone.',
  ], []);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: mounted ? headlineRef : undefined, offset: ["start end", "end start"] });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const clamped = Math.max(0, Math.min(0.999, v));
      const idx = Math.floor(clamped * scrollPhrases.length);
      if (idx !== activePhraseIndex) setActivePhraseIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress, activePhraseIndex]);
  
  // Images for carousel - using the 4 images you provided
  const carouselImages = useMemo(() => [
    '/lo-home landing/l1.png',
    '/lo-home landing/l2.jpg',
    '/lo-home landing/l3.jpg',
    '/lo-home landing/l4.jpg',
  ], []);
  
  useEffect(() => {
    const id = window.setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);
  
  useEffect(() => {
    const id = window.setInterval(() => {
      setImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  // removed typewriter effect

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <ThreeBackground />
      <main className="relative z-0 pt-24 sm:pt-28 lg:pt-32">
        <div className="flex flex-col gap-16">
      {/* Section 1: LookOut Header - Modern Nuraform-inspired Design */}
      <section className="relative z-10 overflow-visible px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Floating geometric elements */}
        <motion.div
          className="absolute top-20 left-6 hidden h-16 w-16 rounded-lg border-2 border-primary sm:block"
          animate={{ rotate: [0, 360], y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-10 top-32 hidden h-12 w-12 rounded-full bg-primary/20 sm:block"
          animate={{ scale: [1, 1.2, 1], x: [-5, 5, -5], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-24 left-10 hidden h-20 w-8 border border-primary/50 md:block"
          animate={{ rotate: [0, 180, 360], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8 text-left">
            <HeroHeadline />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ perspective: 900 }}
              whileHover={{ rotateX: -8, rotateY: 8, translateZ: 8 }}
              whileTap={{ scale: 0.98, rotateX: 0, rotateY: 0 }}
            >
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
                  className="order-1 group-hover:order-2 relative grid h-11 w-11 place-items-center rounded-full border border-yellow-300 bg-yellow-400 text-black shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-x-1.5 group-hover:bg-black group-hover:text-white group-hover:border-white/25 will-change-transform"
                  aria-label="Go"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
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
                  className="order-2 group-hover:order-1 relative overflow-hidden rounded-full border border-yellow-300 bg-yellow-400 px-5 py-2.5 font-semibold tracking-wide text-black shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-1.5 group-hover:bg-black group-hover:text-white group-hover:border-white/25 will-change-transform md:px-6 md:py-3"
                >
                  <span className="relative z-10">Join Waitlist</span>
                  <span
                    className="absolute inset-0 opacity-0 transition-opacity duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-100"
                    style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(250,204,21,0.12))' }}
                  />
                </motion.a>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="mt-2 flex gap-2">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
                <div className="h-3 w-3 rounded-full bg-primary/60"></div>
              </div>
            </motion.div>
          </div>



        </div>

        <div className="relative z-10 mt-16 space-y-8">
          <CardsSection carouselImages={carouselImages} />
          <div className="section-divider" />
        </div>

        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20">
          <motion.path
            d="M100,100 Q300,200 500,150 T900,200"
            stroke="#FFC300"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.path
            d="M200,300 Q400,100 600,250 T1000,300"
            stroke="#FFC300"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
          />
        </svg>
      </section>

      {/* Section 2: ChatGPT Line - Enhanced Dynamic Floating */}
  <section className="section-spacing relative z-10 overflow-x-hidden px-4 sm:px-6 lg:px-8">
        {/* Enhanced floating background elements */}
        <motion.div
          className="absolute top-10 left-20 w-24 h-24 border-2 border-primary/20 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2],
            x: [-10, 10, -10],
            y: [-15, 15, -15]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-32 right-16 w-16 h-16 bg-primary/10 rounded-lg transform rotate-45"
          animate={{
            rotate: [45, 225, 405],
            y: [-20, 20, -20],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-20 left-1/3 w-12 h-12 border border-primary/40 rounded-full"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.8, 0.4],
            rotate: [0, 180, 360],
            x: [-8, 8, -8]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="max-w-[120rem] mx-auto">
          <motion.div
            className="glass rounded-3xl p-12 relative overflow-hidden shadow-modern-lg"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 50px rgba(59, 130, 246, 0.2)",
            }}
          >
            {/* Enhanced floating particles in widget */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-primary/30 rounded-full"
                style={{
                  width: `${8 + (i % 3) * 4}px`,
                  height: `${8 + (i % 3) * 4}px`,
                  left: `${5 + i * 8}%`,
                  top: `${15 + (i % 4) * 20}%`
                }}
                animate={{
                  y: [-15, 15, -15],
                  x: [-5, 5, -5],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 4 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}

            {/* Floating geometric shapes */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`shape-${i}`}
                className="absolute border border-primary/20"
                style={{
                  width: `${12 + (i % 2) * 8}px`,
                  height: `${12 + (i % 2) * 8}px`,
                  left: `${10 + i * 15}%`,
                  top: `${10 + (i % 3) * 25}%`,
                  borderRadius: i % 2 === 0 ? '50%' : '0'
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3],
                  y: [-10, 10, -10]
                }}
                transition={{
                  duration: 6 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            ))}

            <div className="text-center mb-8 relative z-10" ref={headlineRef}>
              <motion.h2 
                className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activePhraseIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  >
                    {scrollPhrases[activePhraseIndex].split(' ').map((word, idx) => (
                      <span key={`${word}-${idx}`} className={idx % 2 === 0 ? 'float3d' : 'float3d--alt'}>
                        {word}{' '}
                      </span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </motion.h2>
            </div>

            {/* Enhanced Testimonials Label */}
            <div className="text-center relative z-10">
              <motion.div 
                className="mb-6 relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                animate={{
                  y: [-2, 2, -2]
                }}
              >
                <AnimatePresence mode="wait">
                </AnimatePresence>
                
                {/* Floating underline */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                />
              </motion.div>
            </div>

            {/* Enhanced connecting ropes within the widget */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <motion.path
                d="M50,50 Q150,100 250,80 T450,120"
                stroke="#FFC300"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
              />
              <motion.path
                d="M100,150 Q200,50 300,120 T500,80"
                stroke="#FFC300"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
              />
              <motion.path
                d="M0,100 Q100,200 200,150 T400,180"
                stroke="#FFC300"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", delay: 2 }}
              />
            </svg>

            {/* Pulsing glow effect */}
            <motion.div
              className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Feature Boxes Section - Nuraform Style */}
      <Suspense fallback={null}>
        <FeatureBoxes />
      </Suspense>

      {/* Section 3: One Prompt Line - Following Wireframe */}
      

        </div>
      </main>

      {/* New Footer Component */}
      <footer>
        {/* Community Section - Sponsors, Contact, Newsletter, Socials */}
          <CommunitySection />
          
          {/* Community Footer */}
          <CommunityFooter />
      </footer>
    </div>
  );
}
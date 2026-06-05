      {/* Social icons below the box */}
      <div className="flex justify-center gap-6 mt-8 mb-2">
        {/* X (Twitter) */}
        <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="bg-black/60 border border-yellow-700 rounded-xl p-3 text-white hover:text-yellow-400 transition-colors backdrop-blur-md flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M17.53 3H21L14.19 10.39L22.09 21H15.66L10.87 14.67L5.56 21H2L9.13 13.03L1.61 3H8.18L12.54 8.72L17.53 3ZM16.34 19H18.14L7.82 5H6.01L16.34 19Z" />
          </svg>
        </a>
        {/* Instagram */}
        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="bg-black/60 border border-yellow-700 rounded-xl p-3 text-white hover:text-yellow-400 transition-colors backdrop-blur-md flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25.75a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0z" />
          </svg>
        </a>
        {/* Social Media */}
        <a href="https://Social Media.com/" target="_blank" rel="noopener noreferrer" className="bg-black/60 border border-yellow-700 rounded-xl p-3 text-white hover:text-yellow-400 transition-colors backdrop-blur-md flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-6 h-6">
            <rect x="2" y="2" width="28" height="28" rx="6" fill="#0A66C2" opacity="0.8" />
            <path d="M10.5 13.5h3v7h-3v-7zm1.5-2a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3zm4 2h2.5v1h.03a2.75 2.75 0 0 1 2.47-1.5c2.01 0 2.5 1.32 2.5 3.04V22h-3v-3.5c0-.84-.02-1.92-1.17-1.92c-1.17 0-1.35.91-1.35 1.85V22h-3v-7z" fill="#fff" />
          </svg>
        </a>
      </div>

import React, { useState, useEffect, useRef } from 'react';
// Animated letter-by-letter text for Welcome Onboard
  const handleBack = () => {
    window.history.back();
  };
function AnimatedText({ text, className, style }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    function showNext() {
      if (i < text.length) {
        setDisplayed(prev => prev + text.charAt(i));
        i++;
        setTimeout(showNext, 55);
      }
    }
    showNext();
    return () => {};
  }, [text]);
  return <span className={className} style={style}>{displayed}</span>;
}
// Animated golden particles for interactive background
function AnimatedParticles({ count = 40 }) {
  const [particles, setParticles] = useState([]);
  const requestRef = useRef();

  useEffect(() => {
    // Uniform fairy dust: same size and opacity
    const initialParticles = Array.from({ length: count }).map(() => ({
      x: Math.random() * 1440,
      y: Math.random() * 900,
      r: 2.2,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      opacity: 0.45,
    }));
    setParticles(initialParticles);
  }, [count]);

  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev.map(p => {
        let nx = p.x + p.dx;
        let ny = p.y + p.dy;
        // Bounce off edges
        if (nx < 0 || nx > 1440) p.dx *= -1;
        if (ny < 0 || ny > 900) p.dy *= -1;
        return {
          ...p,
          x: Math.max(0, Math.min(1440, nx)),
          y: Math.max(0, Math.min(900, ny)),
        };
      }));
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0 w-full h-full pointer-events-none">
      {particles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#FFD700" opacity={p.opacity} />
      ))}
    </svg>
  );
}

export default function WaitlistPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Submission failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden font-sans">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 p-0 bg-transparent border-none focus:outline-none"
        aria-label="Go Back"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 8L12 16L20 24" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {/* Golden hue background and animated fairy dust */}
      <div className="absolute inset-0 z-0 bg-black">
        {/* Golden hue and large blurry spheres distributed to sides */}
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0 w-full h-full pointer-events-none">
          {/* Left side big sphere */}
          <circle cx="220" cy="350" r="210" fill="url(#gold-bg)" opacity="0.18" filter="url(#blur)" />
          {/* Right side big sphere */}
          <circle cx="1220" cy="500" r="260" fill="url(#gold-bg)" opacity="0.16" filter="url(#blur)" />
          {/* Center sphere, slightly larger and more translucent */}
          <circle cx="720" cy="450" r="320" fill="url(#gold-bg)" opacity="0.13" filter="url(#blur)" />
          {/* Top left smaller sphere */}
          <circle cx="180" cy="120" r="90" fill="url(#gold-bg)" opacity="0.10" filter="url(#blur)" />
          {/* Bottom right smaller sphere */}
          <circle cx="1300" cy="800" r="110" fill="url(#gold-bg)" opacity="0.09" filter="url(#blur)" />
          {/* Top right accent sphere */}
          <circle cx="1200" cy="120" r="70" fill="url(#gold-bg)" opacity="0.08" filter="url(#blur)" />
          {/* Bottom left accent sphere */}
          <circle cx="180" cy="800" r="60" fill="url(#gold-bg)" opacity="0.07" filter="url(#blur)" />
          <defs>
            <radialGradient id="gold-bg" cx="0" cy="0" r="1" gradientTransform="translate(720 450) scale(320)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFD700" />
              <stop offset="1" stopColor="#FFA500" />
            </radialGradient>
            <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="40" />
            </filter>
          </defs>
        </svg>
        {/* Animated fairy dust particles */}
        <AnimatedParticles count={40} />
      </div>
      {/* Coming soon banner */}
      {/* ...existing code... */}
      <div className="relative z-10 flex flex-col items-center mt-16 mb-8">
        {/* ...existing code... */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center mb-2" style={{letterSpacing: '-2px', opacity: 0.7, textShadow: '0 4px 32px #000'}}>Coming soon!</h1>
      </div>
      {/* Glassmorphism waitlist form */}
  <div className="relative z-10 w-full max-w-2xl mx-auto rounded-2xl bg-black/60 backdrop-blur-xl shadow-2xl border border-yellow-700 p-8 flex flex-col items-center" style={{boxShadow: '0 8px 32px 0 rgba(255,215,0,0.12), 0 1.5px 8px 0 rgba(0,0,0,0.25)'}}>
  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 mb-4 text-center drop-shadow-lg tracking-tight" style={{letterSpacing: '-1px'}}>Join our waitlist!</h2>
  {/* ...existing code... */}
        {submitted ? (
          <div className="text-center text-yellow-400 text-lg font-semibold py-8">Thank you for joining! We'll keep you posted.</div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            <div className="w-full flex flex-col items-center gap-3 justify-center">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-[260px] h-[44px] px-5 py-2 rounded-xl bg-black/10 border border-yellow-300 text-yellow-100 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-yellow-300 backdrop-blur-lg shadow-[0_2px_24px_0_rgba(255,224,102,0.10)]"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,224,102,0.10) 0%, rgba(255,215,0,0.05) 100%), rgba(0,0,0,0.10)',
                  boxShadow: '0 0 0 6px rgba(255,224,102,0.05), 0 2px 24px 0 rgba(255,224,102,0.10)',
                  border: '2px solid #FFE066',
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                  color: '#fffbe6',
                  transition: 'box-shadow 0.2s',
                }}
                placeholder="Your Name"
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-[260px] h-[44px] px-5 py-2 rounded-xl bg-black/10 border border-yellow-300 text-yellow-100 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-yellow-300 backdrop-blur-lg shadow-[0_2px_24px_0_rgba(255,224,102,0.10)]"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,224,102,0.10) 0%, rgba(255,215,0,0.05) 100%), rgba(0,0,0,0.10)',
                  boxShadow: '0 0 0 6px rgba(255,224,102,0.05), 0 2px 24px 0 rgba(255,224,102,0.10)',
                  border: '2px solid #FFE066',
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                  color: '#fffbe6',
                  transition: 'box-shadow 0.2s',
                }}
                placeholder="Your Email"
              />
              {error && (
                <div className="text-red-400 text-sm mt-2">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 h-[44px] rounded-xl border border-yellow-300 bg-gradient-to-r from-yellow-400/30 to-yellow-700/20 text-yellow-100 font-bold text-lg hover:bg-yellow-400/40 hover:text-black transition-all duration-200 backdrop-blur-lg mt-2 shadow-[0_2px_24px_0_rgba(255,224,102,0.18)]"
                style={{
                  boxShadow: '0 0 0 6px rgba(255,224,102,0.10), 0 2px 24px 0 rgba(255,224,102,0.18)',
                  border: '2px solid #FFE066',
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                  color: '#fffbe6',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {loading ? 'Joining...' : 'Join'}
              </button>
            </div>
            {error && <div className="text-red-500 text-sm text-center w-full">{error}</div>}
          </form>
        )}
      </div>
      {/* Social icons just below the box */}
  <div className="flex justify-center gap-3 mt-3 mb-2">
    {/* Social Media */}
    <a href="https://www.Social Media.com/company/theLookOut/" target="_blank" rel="noopener noreferrer" className="border border-[#FFD966] rounded-lg p-2 text-[#FFD966] hover:bg-[#FFD966]/60 hover:text-black transition-colors flex items-center justify-center backdrop-blur-md shadow bg-black/30" style={{opacity:0.85}}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5">
        <rect x="2" y="2" width="28" height="28" rx="6" fill="#0A66C2" opacity="0.8" />
        <path d="M10.5 13.5h3v7h-3v-7zm1.5-2a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3zm4 2h2.5v1h.03a2.75 2.75 0 0 1 2.47-1.5c2.01 0 2.5 1.32 2.5 3.04V22h-3v-3.5c0-.84-.02-1.92-1.17-1.92c-1.17 0-1.35.91-1.35 1.85V22h-3v-7z" fill="#fff" />
      </svg>
    </a>
    {/* Instagram */}
    <a href="https://www.instagram.com/LookOutofficial?igsh=MXQ0b3h6dWgxYXN6eA==" target="_blank" rel="noopener noreferrer" className="border border-[#FFD966] rounded-lg p-2 text-[#FFD966] hover:bg-[#FFD966]/60 hover:text-black transition-colors flex items-center justify-center backdrop-blur-md shadow bg-black/30" style={{opacity:0.85}}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.25.75a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0z" />
      </svg>
    </a>
    {/* Twitter (X) */}
    <a href="https://x.com/LookOut_off" target="_blank" rel="noopener noreferrer" className="border border-[#FFD966] rounded-lg p-2 text-[#FFD966] hover:bg-[#FFD966]/60 hover:text-black transition-colors flex items-center justify-center backdrop-blur-md shadow bg-black/30" style={{opacity:0.85}}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.53 3H21L14.19 10.39L22.09 21H15.66L10.87 14.67L5.56 21H2L9.13 13.03L1.61 3H8.18L12.54 8.72L17.53 3ZM16.34 19H18.14L7.82 5H6.01L16.34 19Z" />
      </svg>
    </a>
  </div>
    </div>
  );
}

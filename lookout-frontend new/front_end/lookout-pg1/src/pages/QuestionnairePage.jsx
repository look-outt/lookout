import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/onboarding.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const CORE_NICHES = [
  'Business & Startups', 'Marketing & Sales', 'Tech & STEM',
  'Finance & Web3', 'Law & Politics', 'Arts & Culture',
  'Fitness & Sports', 'Travel', 'Fashion & Lifestyle',
];
const MORE_NICHES = [
  'Food & Health', 'Education', 'Relationships', 'Spirituality',
  'Environment', 'Gaming', 'Entertainment', 'Cars & Motors',
  'Home & Outdoor', 'Magic & Mysticism', 'Animals',
];
const TOTAL_STEPS = 6;

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [vibe, setVibe] = useState('');
  const [customVibe, setCustomVibe] = useState('');
  const [niches, setNiches] = useState([]);
  const [contentStyles, setContentStyles] = useState([]);
  const [tones, setTones] = useState([]);
  const [endgames, setEndgames] = useState([]);
  const [showMoreNiches, setShowMoreNiches] = useState(false);

  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const toggle = (setter) => (val) =>
    setter((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

  /* Fairy dust */
  useEffect(() => {
    const createFairyDust = () => {
      const container = document.querySelector('.fairy-dust-container');
      if (!container) return;
      const dust = document.createElement('div');
      dust.className = 'fairy-dust';
      dust.style.left = `${Math.random() * 100}%`;
      container.appendChild(dust);
      setTimeout(() => dust.remove(), 4000);
    };
    const interval = setInterval(createFairyDust, 200);
    return () => clearInterval(interval);
  }, []);

  const finish = async () => {
    const user = auth.currentUser;
    const uid = user?.uid;
    const token = await user?.getIdToken().catch(() => null);

    if (uid) {
      try {
        await fetch(`${API_BASE}/questionnaire/save/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            uid,
            vibe: vibe === 'Mystery Flex' && customVibe ? customVibe : vibe,
            niches,
            content_styles: contentStyles,
            tones,
            endgames,
          }),
        });
      } catch {
        // non-critical — navigate anyway
      }
    }
    navigate('/create');
  };

  const vibeDisplay = vibe === 'Mystery Flex' && customVibe ? customVibe : vibe || '_____';

  return (
    <div className="auth-page questionnaire-page" style={{ position: 'relative' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="sphere"
          style={{ position: 'absolute', left: `${10 + i * 15}%`, top: `${20 + i * 10}%`, width: `${180 + i * 40}px`, height: `${180 + i * 40}px`, zIndex: 0, opacity: 0.5, filter: 'blur(8px)' }}
        />
      ))}
      <div className="fairy-dust-container" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, display: 'flex', alignItems: 'center', padding: '0 2rem', zIndex: 100 }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="LookOut" style={{ height: 48 }} />
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '5rem 1rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: 750, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#181818', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '2rem 1.5rem' }}>

          {/* Progress bar */}
          <div className="row" style={{ width: '100%', gap: 8, marginBottom: '1.5rem' }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 999, background: i <= step ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
            ))}
          </div>

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="login-form-box" style={{ maxWidth: 800, padding: '2.5rem', borderRadius: 16, border: '1px solid #222', background: '#181818' }}>
              <h2 className="title" style={{ fontSize: '1.5rem', color: '#FFD700' }}>Welcome to LookOut. Ready to make LinkedIn your playground?</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: '1rem' }}>3 quick questions, then boom — your first post idea is ready.</div>
              <div className="row" style={{ justifyContent: 'center', marginTop: 32 }}>
                <button className="btn btn-primary" onClick={next}>👉 Let's roll</button>
              </div>
            </div>
          )}

          {/* Step 1 — Vibe */}
          {step === 1 && (
            <div className="login-form-box" style={{ maxWidth: 800, padding: '2.5rem', borderRadius: 16, border: '1px solid #222', background: '#181818' }}>
              <h2 className="title" style={{ fontSize: '1.5rem', color: '#FFD700' }}>
                I'm a <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{vibeDisplay}</span> ready to dominate LinkedIn.
              </h2>
              <div className="row" style={{ flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                {['Student', 'Freelancer', 'Working Pro', 'Founder', 'Mystery Flex'].map((o) => (
                  <button key={o} className="btn btn-outline" style={{ background: vibe === o ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: vibe === o ? 'var(--primary)' : 'var(--border)' }} onClick={() => setVibe(o)}>
                    {o}
                  </button>
                ))}
              </div>
              {vibe === 'Mystery Flex' && (
                <input className="input" placeholder="I'm a…" value={customVibe} onChange={(e) => setCustomVibe(e.target.value)} style={{ marginTop: 16 }} />
              )}
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn btn-outline" onClick={back}>Back</button>
                <button className="btn btn-primary" onClick={next} disabled={!vibe || (vibe === 'Mystery Flex' && !customVibe)}>Next</button>
              </div>
            </div>
          )}

          {/* Step 2 — Niches */}
          {step === 2 && (
            <div className="login-form-box" style={{ maxWidth: 800, padding: '2.5rem', borderRadius: 16, border: '1px solid #222', background: '#181818' }}>
              <h2 className="title" style={{ fontSize: '1.5rem', color: '#FFD700' }}>
                I want to dominate <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{niches.length ? niches.join(', ') : '_____'}</span> on LinkedIn.
              </h2>
              <div className="stack" style={{ marginTop: 16 }}>
                <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                  {CORE_NICHES.map((o) => (
                    <button key={o} className="btn btn-outline" style={{ background: niches.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: niches.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setNiches)(o)}>{o}</button>
                  ))}
                </div>
                <button className="btn btn-outline" onClick={() => setShowMoreNiches(!showMoreNiches)} style={{ alignSelf: 'center', marginTop: 8 }}>
                  ✨ {showMoreNiches ? 'Show Less' : 'See More'}
                </button>
                {showMoreNiches && (
                  <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {MORE_NICHES.map((o) => (
                      <button key={o} className="btn btn-outline" style={{ background: niches.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: niches.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setNiches)(o)}>{o}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn btn-outline" onClick={back}>Back</button>
                <button className="btn btn-primary" onClick={next} disabled={!niches.length}>Next</button>
              </div>
            </div>
          )}

          {/* Step 3 — Style & Tone */}
          {step === 3 && (
            <div className="login-form-box" style={{ maxWidth: 800, padding: '2.5rem', borderRadius: 16, border: '1px solid #222', background: '#181818' }}>
              <h2 className="title" style={{ fontSize: '1.5rem', color: '#FFD700' }}>
                My posts should be <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{contentStyles.length ? contentStyles.join(' & ') : '_____'}</span> with a <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{tones.length ? tones.join(' & ') : '_____'}</span> tone.
              </h2>
              <div className="stack" style={{ marginTop: 16 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Length:</div>
                <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                  {['short & punchy', 'medium with stories', 'long & deep'].map((o) => (
                    <button key={o} className="btn btn-outline" style={{ background: contentStyles.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: contentStyles.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setContentStyles)(o)}>{o}</button>
                  ))}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Tone:</div>
                <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {['professional', 'conversational', 'bold/sarcastic', 'inspiring'].map((o) => (
                    <button key={o} className="btn btn-outline" style={{ background: tones.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: tones.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setTones)(o)}>{o}</button>
                  ))}
                </div>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn btn-outline" onClick={back}>Back</button>
                <button className="btn btn-primary" onClick={next} disabled={!contentStyles.length || !tones.length}>Next</button>
              </div>
            </div>
          )}

          {/* Step 4 — Endgame */}
          {step === 4 && (
            <div className="login-form-box" style={{ maxWidth: 800, padding: '2.5rem', borderRadius: 16, border: '1px solid #222', background: '#181818' }}>
              <h2 className="title" style={{ fontSize: '1.5rem', color: '#FFD700' }}>
                My LinkedIn endgame is to <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{endgames.length ? endgames.join(' & ') : '_____'}</span>.
              </h2>
              <div className="row" style={{ flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                {['land clients', 'build my brand', 'get recruiter attention', 'grow my startup', 'create chaos'].map((o) => (
                  <button key={o} className="btn btn-outline" style={{ background: endgames.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: endgames.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setEndgames)(o)}>{o}</button>
                ))}
              </div>
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn btn-outline" onClick={back}>Back</button>
                <button className="btn btn-primary" onClick={next} disabled={!endgames.length}>Next</button>
              </div>
            </div>
          )}

          {/* Step 5 — Summary (final) */}
          {step === 5 && (
            <div className="login-form-box" style={{ maxWidth: 800, padding: '2.5rem', borderRadius: 16, border: '1px solid #222', background: '#181818' }}>
              <h2 className="title" style={{ fontSize: '1.5rem', color: '#FFD700' }}>
                So you're a {vibeDisplay} in {niches.join(' & ')} who wants {tones.join(' & ')}, {contentStyles.join(' & ')} posts to {endgames.join(' & ')}. Dangerous combo. We like it.
              </h2>
              <div className="row" style={{ justifyContent: 'center', marginTop: 32 }}>
                <button className="btn btn-primary" onClick={finish}>🔥 Cook my first post</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

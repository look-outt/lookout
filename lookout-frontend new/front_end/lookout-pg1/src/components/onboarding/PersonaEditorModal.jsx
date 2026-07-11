import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import '../../styles/onboarding.css';

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

export default function PersonaEditorModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vibe, setVibe] = useState('');
  const [customVibe, setCustomVibe] = useState('');
  const [niches, setNiches] = useState([]);
  const [contentStyles, setContentStyles] = useState([]);
  const [tones, setTones] = useState([]);
  const [endgames, setEndgames] = useState([]);
  const [showMoreNiches, setShowMoreNiches] = useState(false);

  useEffect(() => {
    const fetchPersona = async () => {
      const user = auth.currentUser;
      const uid = user?.uid;
      const token = await user?.getIdToken().catch(() => null);
      if (uid) {
        try {
          const res = await fetch(`${API_BASE}/questionnaire/get/?uid=${uid}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success' && data.data) {
              const d = data.data;
              const stdVibes = ['Student', 'Freelancer', 'Working Pro', 'Founder'];
              if (d.vibe) {
                if (stdVibes.includes(d.vibe)) { setVibe(d.vibe); }
                else { setVibe('Mystery Flex'); setCustomVibe(d.vibe); }
              }
              setNiches(d.niches || []);
              setContentStyles(d.content_styles || []);
              setTones(d.tones || []);
              setEndgames(d.endgames || []);
            }
          }
        } catch (err) {
          console.error('Failed to fetch persona:', err);
        }
      }
      setLoading(false);
    };
    fetchPersona();
  }, []);

  const toggle = (setter) => (val) =>
    setter((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

  const handleSave = async () => {
    setSaving(true);
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
            // linkedin_url intentionally omitted
          }),
        });
      } catch (err) {
        console.error('Failed to save persona:', err);
      }
    }
    setSaving(false);
    onClose();
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
        <div style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>Loading Persona…</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', background: '#181818', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '2rem 1.5rem', border: '1px solid #222' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="title" style={{ fontSize: '1.5rem', color: '#FFD700', textShadow: '0 2px 8px #000, 0 0 2px #FFD70088', margin: 0 }}>Edit Persona</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="stack" style={{ gap: '1.5rem' }}>
          {/* Vibe */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Vibe</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
              {['Student', 'Freelancer', 'Working Pro', 'Founder', 'Mystery Flex'].map((o) => (
                <button key={o} className="btn btn-outline" style={{ background: vibe === o ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: vibe === o ? 'var(--primary)' : 'var(--border)' }} onClick={() => setVibe(o)}>{o}</button>
              ))}
            </div>
            {vibe === 'Mystery Flex' && (
              <input className="input" placeholder="I'm a…" value={customVibe} onChange={(e) => setCustomVibe(e.target.value)} style={{ marginTop: 10 }} />
            )}
          </div>

          {/* Niches */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Niches</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {CORE_NICHES.map((o) => (
                <button key={o} className="btn btn-outline" style={{ background: niches.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: niches.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setNiches)(o)}>{o}</button>
              ))}
            </div>
            <button className="btn btn-outline" onClick={() => setShowMoreNiches(!showMoreNiches)} style={{ alignSelf: 'flex-start', marginTop: 8 }}>✨ {showMoreNiches ? 'Show Less' : 'See More'}</button>
            {showMoreNiches && (
              <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {MORE_NICHES.map((o) => (
                  <button key={o} className="btn btn-outline" style={{ background: niches.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: niches.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setNiches)(o)}>{o}</button>
                ))}
              </div>
            )}
          </div>

          {/* Length */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Length</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {['short & punchy', 'medium with stories', 'long & deep'].map((o) => (
                <button key={o} className="btn btn-outline" style={{ background: contentStyles.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: contentStyles.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setContentStyles)(o)}>{o}</button>
              ))}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Tone</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {['professional', 'conversational', 'bold/sarcastic', 'inspiring'].map((o) => (
                <button key={o} className="btn btn-outline" style={{ background: tones.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: tones.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setTones)(o)}>{o}</button>
              ))}
            </div>
          </div>

          {/* Endgame */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Endgame</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
              {['land clients', 'build my brand', 'get recruiter attention', 'grow my startup', 'create chaos'].map((o) => (
                <button key={o} className="btn btn-outline" style={{ background: endgames.includes(o) ? 'rgba(255,215,0,0.12)' : 'transparent', borderColor: endgames.includes(o) ? 'var(--primary)' : 'var(--border)' }} onClick={toggle(setEndgames)(o)}>{o}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

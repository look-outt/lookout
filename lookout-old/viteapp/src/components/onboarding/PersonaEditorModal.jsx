import { useState, useEffect } from 'react';
import '@/styles/onboarding.css';

export default function PersonaEditorModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [vibe, setVibe] = useState('');
  const [customVibe, setCustomVibe] = useState('');
  const [niches, setNiches] = useState([]);
  const [contentStyles, setContentStyles] = useState([]);
  const [tones, setTones] = useState([]);
  const [endgames, setEndgames] = useState([]);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [showMoreNiches, setShowMoreNiches] = useState(false);

  useEffect(() => {
    const fetchPersona = async () => {
      const token = localStorage.getItem('lo_token');
      const uid = localStorage.getItem('lo_user_id');
      const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
      if (uid) {
        try {
          const res = await fetch(`${API_BASE}/questionnaire/get/?uid=${uid}`, {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success' && data.data) {
              const d = data.data;
              const stdVibes = ['Student','Freelancer','Working Pro','Founder'];
              if (d.vibe) {
                if (stdVibes.includes(d.vibe)) {
                  setVibe(d.vibe);
                } else {
                  setVibe('Mystery Flex');
                  setCustomVibe(d.vibe);
                }
              }
              setNiches(d.niches || []);
              setContentStyles(d.content_styles || []);
              setTones(d.tones || []);
              setEndgames(d.endgames || []);
              setLinkedinUrl(d.linkedin_url || '');
            }
          }
        } catch (error) {
          console.error('Failed to fetch persona:', error);
        }
      }
      setLoading(false);
    };
    fetchPersona();
  }, []);

  const toggleNiche = (niche) => {
    setNiches(prev => prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]);
  }

  const toggleContentStyle = (style) => {
    setContentStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
  }

  const toggleTone = (tone) => {
    setTones(prev => prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]);
  }

  const toggleEndgame = (goal) => {
    setEndgames(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  }

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('lo_token');
    const uid = localStorage.getItem('lo_user_id');
    const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    
    if (uid) {
      try {
        await fetch(`${API_BASE}/questionnaire/save/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ 
            uid,
            vibe: vibe === 'Mystery Flex' && customVibe ? customVibe : vibe,
            niches,
            content_styles: contentStyles,
            tones,
            endgames,
            linkedin_url: linkedinUrl || null,
          })
        });
      } catch (error) {
        console.error('Failed to save persona:', error);
      }
    }
    setSaving(false);
    onClose();
  };

  const coreNiches = [
    'Business & Startups', 'Marketing & Sales', 'Tech & STEM',
    'Finance & Web3', 'Law & Politics', 'Arts & Culture',
    'Fitness & Sports', 'Travel', 'Fashion & Lifestyle'
  ];

  const moreNiches = [
    'Food & Health', 'Education', 'Relationships', 'Spirituality',
    'Environment', 'Gaming', 'Entertainment', 'Cars & Motors',
    'Home & Outdoor', 'Magic & Mysticism', 'Animals'
  ];

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
        <div style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>Loading Persona...</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div 
        style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: '#181818', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '2rem 1.5rem', border: '1px solid #222' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="title" style={{ fontSize: '1.5rem', color: '#FFD700', textShadow: '0 2px 8px #000, 0 0 2px #FFD70088', margin: 0 }}>Edit Persona</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="stack" style={{ gap: '1.5rem' }}>
          {/* Vibe */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Vibe</div>
            <div className="row" style={{ flexWrap:'wrap', gap:10 }}>
              {['Student','Freelancer','Working Pro','Founder','Mystery Flex'].map(o=> (
                <button key={o} className="btn btn-outline" style={{ background:vibe===o?'rgba(255, 215, 0, 0.12)':'transparent', borderColor:vibe===o?'var(--primary)':'var(--border)' }} onClick={()=>setVibe(o)}>{o}</button>
              ))}
            </div>
            {vibe === 'Mystery Flex' && (
              <input 
                className="input" 
                placeholder="I'm a..." 
                value={customVibe} 
                onChange={(e) => setCustomVibe(e.target.value)}
                style={{ marginTop: 10 }}
              />
            )}
          </div>

          {/* Niches */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Niches</div>
            <div className="row" style={{ flexWrap:'wrap', gap:8 }}>
              {coreNiches.map(o=> (
                <button key={o} className="btn btn-outline" style={{ background:niches.includes(o)?'rgba(255, 215, 0, 0.12)':'transparent', borderColor:niches.includes(o)?'var(--primary)':'var(--border)' }} onClick={()=>toggleNiche(o)}>{o}</button>
              ))}
            </div>
            <button className="btn btn-outline" onClick={()=>setShowMoreNiches(!showMoreNiches)} style={{ alignSelf:'flex-start', marginTop:8 }}>✨ {showMoreNiches ? 'Show Less' : 'See More'}</button>
            {showMoreNiches && (
              <div className="row" style={{ flexWrap:'wrap', gap:8, marginTop:8 }}>
                {moreNiches.map(o=> (
                  <button key={o} className="btn btn-outline" style={{ background:niches.includes(o)?'rgba(255, 215, 0, 0.12)':'transparent', borderColor:niches.includes(o)?'var(--primary)':'var(--border)' }} onClick={()=>toggleNiche(o)}>{o}</button>
                ))}
              </div>
            )}
          </div>

          {/* Content Styles & Tones */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Length</div>
            <div className="row" style={{ flexWrap:'wrap', gap:8 }}>
              {['short & punchy','medium with stories','long & deep'].map(o=> (
                <button key={o} className="btn btn-outline" style={{ background:contentStyles.includes(o)?'rgba(255, 215, 0, 0.12)':'transparent', borderColor:contentStyles.includes(o)?'var(--primary)':'var(--border)' }} onClick={()=>toggleContentStyle(o)}>{o}</button>
              ))}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600', marginBottom: '8px', marginTop: '16px' }}>Tone</div>
            <div className="row" style={{ flexWrap:'wrap', gap:8 }}>
              {['professional','conversational','bold/sarcastic','inspiring'].map(o=> (
                <button key={o} className="btn btn-outline" style={{ background:tones.includes(o)?'rgba(255, 215, 0, 0.12)':'transparent', borderColor:tones.includes(o)?'var(--primary)':'var(--border)' }} onClick={()=>toggleTone(o)}>{o}</button>
              ))}
            </div>
          </div>

          {/* Endgames */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Endgame</div>
            <div className="row" style={{ flexWrap:'wrap', gap:10 }}>
              {['land clients','build my brand','get recruiter attention','grow my startup','create chaos'].map(o=> (
                <button key={o} className="btn btn-outline" style={{ background:endgames.includes(o)?'rgba(255, 215, 0, 0.12)':'transparent', borderColor:endgames.includes(o)?'var(--primary)':'var(--border)' }} onClick={()=>toggleEndgame(o)}>{o}</button>
              ))}
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>LinkedIn Profile URL</div>
            <input 
              className="input" 
              type="url" 
              placeholder="https://linkedin.com/in/yourprofile" 
              value={linkedinUrl} 
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/onboarding.css';
import PersonaEditorModal from '../components/onboarding/PersonaEditorModal';

// Logo path in public/
const LOGO_FULL = '/logo full.png';

const AI_API_URL = import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8000';

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPersonaEditor, setShowPersonaEditor] = useState(false);
  const [modelPreference, setModelPreference] = useState('gemini');
  const [geminiStatus, setGeminiStatus] = useState({
    available: true, rpm_used: 0, rpm_limit: 5,
    rpd_used: 0, rpd_limit: 100, rpm_resets_in: 0, rpd_resets_in: 0, reason: null,
  });
  const navigate = useNavigate();

  const userId = useMemo(() => auth.currentUser?.uid || '', []);

  const toggleMenu = (menuKey) => setExpandedMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));

  const menuItems = {
    create: { icon: '+', label: 'New Post', subItems: null },
    calendar: { icon: '📅', label: 'Content Calendar', subItems: ['This Week', 'This Month'] },
    settings: { icon: '⚙️', label: 'Settings', subItems: ['Logout', 'Delete Account'] },
    subscription: { icon: '💎', label: 'Plan & Billing', subItems: ['Current Plan', 'Billing History'] },
  };

  const welcomeMessage = {
    id: 1,
    content: "Hi there! I'm Ollie, your LinkedIn content assistant. I'm here to help you create amazing posts based on your preferences. What would you like to create today?",
    sender: 'bot',
    timestamp: new Date(),
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    setMessages([welcomeMessage]);
    return () => window.removeEventListener('resize', checkMobile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGeminiStatus = async () => {
    try {
      const res = await fetch(`${AI_API_URL}/gemini_status`);
      if (res.ok) {
        const data = await res.json();
        setGeminiStatus(data);
        if (!data.available && modelPreference === 'gemini') setModelPreference('gpt');
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchGeminiStatus();
    const interval = setInterval(fetchGeminiStatus, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && mobileMenuOpen && !event.target.closest('.wireframe-sidebar') && !event.target.closest('.mobile-menu-toggle')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, mobileMenuOpen]);

  const generateAIContent = async ({ userId: uid, query, modelPref }) => {
    const token = await auth.currentUser?.getIdToken().catch(() => null);
    const response = await fetch(`${AI_API_URL}/generate_post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ user_id: uid, query, model_preference: modelPref }),
    });
    if (!response.ok) throw new Error('Failed to generate content');
    return response.json();
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;
    if (!userId) { setErrorMessage('You need to be logged in to generate posts.'); return; }

    const userMessage = { id: Date.now(), content: prompt.trim(), sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setErrorMessage('');
    setFeedbackMessage('');
    setPrompt('');

    try {
      const response = await generateAIContent({ userId, query: userMessage.content, modelPref: modelPreference });
      if (response.fallback_triggered) setFeedbackMessage('Gemini was rate-limited. Falling back to Azure GPT.');
      fetchGeminiStatus();
      const botMessage = {
        id: Date.now() + 1,
        content: response.posts?.length > 0
          ? response.posts[0].content || "Here's your LinkedIn post!"
          : "I'm here to help you create amazing LinkedIn content! Could you tell me more?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        content: "I'm sorry, I encountered an issue. What kind of LinkedIn post are you looking to create?",
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleMenuItemClick = (menuItem, subItem) => {
    if (isMobile) setMobileMenuOpen(false);
    if (menuItem === 'create') {
      setMessages([welcomeMessage]);
    } else if (menuItem === 'settings' && subItem === 'Logout') {
      handleLogout();
    } else if (menuItem === 'settings' && subItem === 'Delete Account') {
      if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        auth.signOut();
        navigate('/login');
      }
    }
  };

  return (
    <div className="linkedout-page">
      <div className="golden-spheres">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="sphere" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${100 + Math.random() * 200}px`, height: `${100 + Math.random() * 200}px`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${15 + Math.random() * 10}s` }} />
        ))}
      </div>

      {isMobile && mobileMenuOpen && (
        <div className="mobile-menu-overlay active" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="wireframe-container">
        <div className="wireframe-main">
          <aside className={`wireframe-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMobile && mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
              <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
            </div>
            {sidebarCollapsed ? (
              <div className="sidebar-collapsed">
                <div className="collapsed-icons">
                  <div className="collapsed-icon">+</div>
                  <div className="collapsed-icon">📅</div>
                  <div className="collapsed-icon">⚙️</div>
                  <div className="collapsed-icon">💎</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="sidebar-section">
                  {Object.entries(menuItems).map(([key, item]) => (
                    <div key={key}>
                      <div className="sidebar-item" onClick={() => item.subItems ? toggleMenu(key) : handleMenuItemClick(key)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{item.icon} {item.label}</span>
                        {item.subItems && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{expandedMenus[key] ? '▼' : '▶'}</span>}
                      </div>
                      {expandedMenus[key] && (
                        <div style={{ marginLeft: 20, marginTop: 4 }}>
                          {item.subItems.map((subItem, idx) => (
                            <div key={idx} className="sidebar-item" onClick={() => handleMenuItemClick(key, subItem)} style={{ fontSize: 13, padding: '8px 12px', color: key === 'settings' && (subItem === 'Logout' || subItem === 'Delete Account') ? '#ff4444' : 'var(--text-muted)', borderLeft: '2px solid rgba(255,215,0,0.3)', marginLeft: 8, marginBottom: 2, cursor: 'pointer', fontWeight: key === 'settings' && (subItem === 'Logout' || subItem === 'Delete Account') ? 'bold' : 'normal' }}>
                              {subItem}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Model selector */}
                  <div className="sidebar-item" style={{ marginTop: 16, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>AI Model</span>
                    <select value={modelPreference} onChange={(e) => setModelPreference(e.target.value)} style={{ background: '#222', color: 'var(--text)', border: '1px solid var(--border)', padding: 6, borderRadius: 6, width: '100%', outline: 'none' }}>
                      <option value="gemini" disabled={!geminiStatus.available}>{geminiStatus.available ? 'Ollie-Gemini' : 'Ollie-Gemini (limit reached)'}</option>
                      <option value="gpt">Ollie-GPT</option>
                    </select>
                    <div style={{ marginTop: 6, fontSize: 11, color: geminiStatus.available ? 'rgba(255,215,0,0.7)' : '#ff6b6b', lineHeight: 1.4 }}>
                      {geminiStatus.available
                        ? <span>Gemini: {geminiStatus.rpd_used}/{geminiStatus.rpd_limit} today</span>
                        : <span>⚠ {geminiStatus.reason || 'Gemini limit reached'}</span>}
                    </div>
                  </div>
                  <button className="upgrade-btn">Upgrade plan</button>
                </div>
              </div>
            )}
          </aside>

          <div className={`chat-navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="navbar-left">
              {isMobile && (
                <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
              )}
              <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src={LOGO_FULL} alt="LookOut" style={{ height: 32 }} />
              </div>
            </div>
            <div className="navbar-center">💡 Tip: Use storytelling to make your posts more engaging</div>
            <div className="navbar-right">
              <button className="navbar-btn" onClick={() => navigator.share?.({ title: 'LookOut Chat', url: window.location.href }) || navigator.clipboard.writeText(window.location.href)}>
                📤 Share
              </button>
              <div className="user-avatar" style={{ cursor: 'pointer' }} onClick={() => setShowPersonaEditor(true)}>👤</div>
            </div>
          </div>

          <main className="wireframe-content">
            <div className="chat-interface">
              {messages.length <= 1 && (
                <div className="welcome-section">
                  <h1 className="welcome-title">Hey there, Let's LookOut! 🚀</h1>
                </div>
              )}

              {errorMessage && (
                <div className="status-banner status-error">
                  <span>{errorMessage}</span>
                  <button type="button" onClick={() => setErrorMessage('')}>Dismiss</button>
                </div>
              )}
              {feedbackMessage && (
                <div className="status-banner status-success">
                  <span>{feedbackMessage}</span>
                  <button type="button" onClick={() => setFeedbackMessage('')}>Close</button>
                </div>
              )}

              <div className="chat-messages-container" style={{ flex: 1, overflowY: 'auto', padding: '1rem', maxHeight: '60vh', marginBottom: '1rem' }}>
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.sender}`} style={{ display: 'flex', marginBottom: '1rem', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ background: message.sender === 'user' ? '#FFD700' : 'var(--card-bg)', color: message.sender === 'user' ? '#000' : 'var(--text)', padding: '0.75rem 1rem', borderRadius: 12, maxWidth: '70%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: message.sender === 'bot' ? '1px solid var(--border)' : 'none', whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message bot" style={{ display: 'flex', marginBottom: '1rem', justifyContent: 'flex-start' }}>
                    <div style={{ background: 'var(--card-bg)', color: 'var(--text)', padding: '0.75rem 1rem', borderRadius: 12, maxWidth: '70%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
                      Crafting LinkedIn brilliance… hang tight!
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    className="chat-input"
                    placeholder="Ask me to create a LinkedIn post…"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendPrompt(); } }}
                    disabled={isLoading}
                    rows={2}
                    style={{ resize: 'vertical', minHeight: 40, maxHeight: 120, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  />
                  <button type="button" className="chat-send-btn" onClick={handleSendPrompt} disabled={isLoading} title={isLoading ? 'Generating…' : 'Send message'}>
                    {isLoading ? '⏳' : '🐙'}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to logout? 🥺</h3>
            <div className="modal-buttons">
              <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {showPersonaEditor && <PersonaEditorModal onClose={() => setShowPersonaEditor(false)} />}
    </div>
  );
}

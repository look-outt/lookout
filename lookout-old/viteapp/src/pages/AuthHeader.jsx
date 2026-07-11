import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '@/assets/logo full.png'

const handleLogoClick = () => {
  window.location.href = '/';
};


export default function AuthHeader() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3"
        >
          <div onClick={handleLogoClick}>
            <img
              src={logo}
              alt="Logo"
              className="h-12 cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]"
            />
          </div>
        </motion.div>

      <nav style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        <Link to="/login" className="btn btn-outline" style={{padding: '8px 16px', fontSize: '14px'}}>Login</Link>
        <Link to="/signup" className="btn btn-primary" style={{padding: '8px 16px', fontSize: '14px'}}>Sign Up</Link>
      </nav>
    </header>
  )
}
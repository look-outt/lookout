import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/community.css'
import App from './App.jsx'

document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

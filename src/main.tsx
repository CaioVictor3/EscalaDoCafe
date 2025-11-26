import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Verificar se está na branch main e fazer log especial
const gitBranch = import.meta.env.VITE_GIT_BRANCH || 'unknown'
if (gitBranch === 'main') {
  console.log('🚀 PUBLICADO A PARTIR DA BRANCH MAIN')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

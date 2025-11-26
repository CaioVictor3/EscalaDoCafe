import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Log da branch atual para verificação no ambiente de produção
const gitBranch = import.meta.env.VITE_GIT_BRANCH || 'unknown'
if (gitBranch === 'main') {
  console.log('🚀 PUBLICADO A PARTIR DA BRANCH MAIN')
} else {
  console.log(`📦 Branch atual: ${gitBranch}`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

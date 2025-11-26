import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Função para detectar a branch atual do Git
function getGitBranch(): string {
  try {
    // No Netlify, a branch está na variável de ambiente CONTEXT ou BRANCH
    // CONTEXT pode ser 'production', 'deploy-preview', 'branch-deploy', etc.
    // Para branch-deploy, usar BRANCH ou HEAD
    if (process.env.CONTEXT === 'production') {
      return 'main'
    }
    
    // Para deploy preview ou branch deploy
    const netlifyBranch = process.env.HEAD || process.env.BRANCH || process.env.CONTEXT
    if (netlifyBranch && netlifyBranch !== 'production' && netlifyBranch !== 'deploy-preview') {
      // Remove o prefixo 'refs/heads/' se presente
      return netlifyBranch.replace(/^refs\/heads\//, '')
    }
    
    // Tenta detectar via git command (funciona localmente)
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
    return branch
  } catch (error) {
    // Se não conseguir detectar (ex: não é um repositório Git), retorna 'unknown'
    return 'unknown'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Injeta a branch atual como variável de ambiente durante o build
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(getGitBranch()),
  },
})

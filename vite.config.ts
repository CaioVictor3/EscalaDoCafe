import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Função para detectar a branch atual do Git
function getGitBranch(): string {
  try {
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

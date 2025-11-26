import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (name: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister, error }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      return;
    }
    setLoading(true);
    try {
      await onLogin(name, password);
    } catch (err) {
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img 
            src="/favicon.ico" 
            alt="Ícone de Café" 
            width="50" 
            height="50"
            style={{ imageRendering: 'auto' }}
          />
          <h2>Escala de Café</h2>
          <p className="text-muted">Faça login para continuar</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nome
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome de usuário"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading || !name || !password}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-center text-muted">
            Não tem uma conta?{' '}
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


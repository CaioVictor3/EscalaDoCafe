import React, { useState } from 'react';
import './Login.css';

interface RegisterProps {
  onRegister: (name: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  error?: string;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToRegister, error }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    if (!name || !password) {
      return;
    }

    setLoading(true);
    try {
      await onRegister(name, password);
    } catch (err) {
      console.error('Erro no cadastro:', err);
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
          <p className="text-muted">Crie sua conta</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {password && confirmPassword && password !== confirmPassword && (
          <div className="alert alert-warning" role="alert">
            As senhas não coincidem
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nome de Usuário
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escolha um nome de usuário"
              required
              disabled={loading}
            />
            <small className="form-text text-muted">
              Este será o nome usado para fazer login
            </small>
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
              placeholder="Mínimo 6 caracteres"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Senha
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 mb-3"
            disabled={loading || !name || !password || password !== confirmPassword}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-center text-muted">
            Já tem uma conta?{' '}
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;


import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string>('');
  const { login, register } = useAuth();

  const handleLogin = async (name: string, password: string) => {
    setError('');
    try {
      await login(name, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  const handleRegister = async (name: string, password: string) => {
    setError('');
    try {
      await register(name, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    }
  };

  return (
    <>
      {isLogin ? (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setIsLogin(false);
            setError('');
          }}
          error={error}
        />
      ) : (
        <Register
          onRegister={handleRegister}
          onSwitchToRegister={() => {
            setIsLogin(true);
            setError('');
          }}
          error={error}
        />
      )}
    </>
  );
};

export default AuthScreen;


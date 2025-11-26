import React, { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PersonForm from './PersonForm';
import PersonList from './PersonList';
import CalendarControls from './CalendarControls';
import Calendar from './Calendar';
import { useScheduleGenerator } from './useScheduleGenerator';
import { usePDFExport } from './usePDFExport';
import AuthScreen from './components/AuthScreen';
import { ScheduleService } from './services/api';
import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();
  const { user, loading, logout } = useAuth();
  const { generateSchedule } = useScheduleGenerator();
  const { exportToPDF } = usePDFExport();

  // Carregar escala do banco de dados quando mudar mês/ano
  useEffect(() => {
    if (user) {
      dispatch({ type: 'LOAD_FROM_STORAGE' });
      
      // Carregar escala do banco
      ScheduleService.get(state.selectedYear, state.selectedMonth + 1)
        .then((data) => {
          if (data.schedule_data) {
            dispatch({
              type: 'SET_SCHEDULE_FROM_DB',
              payload: {
                calendar: data.schedule_data,
                lastPersonIndex: data.last_person_index || {},
              },
            });
          } else {
            dispatch({
              type: 'SET_SCHEDULE_FROM_DB',
              payload: {
                calendar: [],
                lastPersonIndex: {},
              },
            });
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar escala:', error);
        });
    }
  }, [state.selectedMonth, state.selectedYear, user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-center mb-0 d-flex align-items-center justify-content-center gap-3">
          <img 
            src="/favicon.ico" 
            alt="Ícone de Café" 
            width="40" 
            height="40"
            style={{ imageRendering: 'auto' }}
          />
          Escala de Café
        </h1>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted">Olá, {user.name}</span>
          <button onClick={logout} className="btn btn-outline-secondary btn-sm">
            Sair
          </button>
        </div>
      </div>
      
      <PersonForm />
      <PersonList />
      <CalendarControls />
      
      <div className="d-grid gap-2 col-6 mx-auto mb-4">
        <button onClick={generateSchedule} className="btn btn-success">
          Criar Escala
        </button>
        <button onClick={exportToPDF} className="btn btn-primary btn-export">
          Exportar para PDF
        </button>
      </div>

      {state.messages.length > 0 && (
        <div className="mb-3">
          {state.messages.map((message, index) => (
            <div key={index} className="alert alert-info" role="alert">
              {message}
            </div>
          ))}
        </div>
      )}

      <Calendar />
      
      <footer className="text-center mt-4 mb-4">Feito por Caio Victor ©</footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
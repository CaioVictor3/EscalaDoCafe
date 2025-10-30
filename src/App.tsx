import React, { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import PersonForm from './PersonForm';
import PersonList from './PersonList';
import CalendarControls from './CalendarControls';
import Calendar from './Calendar';
import { useScheduleGenerator } from './useScheduleGenerator';
import { usePDFExport } from './usePDFExport';
import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();
  const { generateSchedule } = useScheduleGenerator();
  const { exportToPDF } = usePDFExport();

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    dispatch({ type: 'LOAD_FROM_STORAGE' });
  }, [dispatch]);

  // Auto-regenerar próximo mês se já existir escala e última pessoa mudar
  useEffect(() => {
    if (!state.alphaContinuous) return;
    const nextMonth = state.selectedMonth === 11 ? 0 : state.selectedMonth + 1;
    const nextYear = state.selectedMonth === 11 ? state.selectedYear + 1 : state.selectedYear;
    const nextPeriodStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}`;
    const nextMonthKey = `alphaSchedule_${nextPeriodStr}`;
    const nextMonthSchedule = localStorage.getItem(nextMonthKey);
    if (nextMonthSchedule) {
      // ao alterar índice do mês atual, a regeneração será feita ao clicar em Criar Escala;
      // aqui apenas garantimos que a troca de mês esteja pronta se usuário desejar regenerar.
    }
  }, [state.lastPersonIndex, state.alphaContinuous, state.selectedMonth, state.selectedYear]);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 d-flex align-items-center justify-content-center gap-3">
        <img 
          src="/favicon.ico" 
          alt="Ícone de Café" 
          width="40" 
          height="40"
          style={{ imageRendering: 'auto' }}
        />
        Escala de Café
      </h1>
      
      <PersonForm />
      <PersonList />
      <CalendarControls />
      
      <div className="d-grid gap-2 col-6 mx-auto mb-4">
        <button onClick={generateSchedule} className="btn btn-success">
          Criar Escala
        </button>
        <button onClick={exportToPDF} className="btn btn-primary btn-export" disabled={state.hasUnsavedChanges || state.calendar.length === 0}>
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
      
      <footer className="text-center mt-4 mb-4">Feito por Caio Victor</footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
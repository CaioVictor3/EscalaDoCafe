import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction } from './types';
import { STORAGE_KEYS } from './constants';
import { PeopleService, ScheduleService } from './services/api';
import { useAuth } from './contexts/AuthContext';

const initialState: AppState = {
  people: [],
  holidays: [],
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  alphaContinuous: false,
  calendar: [],
  messages: [],
  lastPersonIndex: {},
  hasUnsavedChanges: false,
  canGenerateSchedule: true,
};

function loadLastPersonIndex(): { [key: number]: string } {
  const savedIndex = localStorage.getItem(STORAGE_KEYS.ALPHA_CONTINUOUS_LAST_PERSON);
  return savedIndex ? JSON.parse(savedIndex) : {};
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PERSON':
      // A pessoa será adicionada via API, então apenas retornamos o estado atual
      // O estado será atualizado quando a API retornar sucesso
      return state;

    case 'SET_PEOPLE':
      return {
        ...state,
        people: action.payload,
      };

    case 'REMOVE_PERSON':
      // A pessoa será removida via API, então apenas retornamos o estado atual
      // O estado será atualizado quando a API retornar sucesso
      return state;

    case 'SET_MONTH':
      return {
        ...state,
        selectedMonth: action.payload,
      };

    case 'SET_YEAR':
      return {
        ...state,
        selectedYear: action.payload,
      };

    case 'SET_ALPHA_CONTINUOUS':
      return {
        ...state,
        alphaContinuous: action.payload,
      };

    case 'SET_HOLIDAYS':
      return {
        ...state,
        holidays: action.payload,
      };

    case 'SET_CALENDAR':
      return {
        ...state,
        calendar: action.payload,
        hasUnsavedChanges: false,
        canGenerateSchedule: false,
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };

    case 'UPDATE_DAY': {
      const updatedCalendar = state.calendar.map(day =>
        day.day === action.payload.day
          ? {
              ...day,
              morningPerson: action.payload.morningPerson,
              afternoonPerson: action.payload.afternoonPerson,
            }
          : day
      );

      // Determine the last assigned person for this month after update
      let lastAssignedPerson = '';
      for (let i = updatedCalendar.length - 1; i >= 0; i--) {
        const d = updatedCalendar[i];
        if (d.afternoonPerson) { lastAssignedPerson = d.afternoonPerson; break; }
        if (d.morningPerson) { lastAssignedPerson = d.morningPerson; break; }
      }

      let newLastPersonIndex = state.lastPersonIndex;
      if (lastAssignedPerson) {
        newLastPersonIndex = {
          ...state.lastPersonIndex,
          [state.selectedMonth + 1]: lastAssignedPerson,
        };
        localStorage.setItem(STORAGE_KEYS.ALPHA_CONTINUOUS_LAST_PERSON, JSON.stringify(newLastPersonIndex));
      }

      // Persistir a escala no banco de dados automaticamente ao salvar no modal
      try {
        const lastPersonIndex = newLastPersonIndex;
        ScheduleService.save(
          state.selectedYear,
          state.selectedMonth + 1,
          updatedCalendar,
          lastPersonIndex
        ).catch((e) => {
          console.warn('Falha ao salvar a escala no banco após edição:', e);
        });
      } catch (e) {
        console.warn('Erro ao salvar escala:', e);
      }

      return {
        ...state,
        calendar: updatedCalendar,
        lastPersonIndex: newLastPersonIndex,
        hasUnsavedChanges: false,
        canGenerateSchedule: true,
      };
    }

    case 'SET_LAST_PERSON_INDEX': {
      const newIndex = {
        ...state.lastPersonIndex,
        [action.payload.month]: action.payload.person,
      };
      localStorage.setItem(STORAGE_KEYS.ALPHA_CONTINUOUS_LAST_PERSON, JSON.stringify(newIndex));
      return {
        ...state,
        lastPersonIndex: newIndex,
      };
    }

    case 'SET_HAS_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload };

    case 'SET_CAN_GENERATE_SCHEDULE':
      return { ...state, canGenerateSchedule: action.payload };

    case 'LOAD_SCHEDULE_FROM_STORAGE': {
      // A escala será carregada via API, então apenas retornamos o estado atual
      // O estado será atualizado quando a API retornar
      return state;
    }

    case 'SET_SCHEDULE_FROM_DB': {
      return {
        ...state,
        calendar: action.payload.calendar || [],
        lastPersonIndex: action.payload.lastPersonIndex || {},
        canGenerateSchedule: !action.payload.calendar || action.payload.calendar.length === 0,
      };
    }

    case 'LOAD_FROM_STORAGE':
      // Não faz mais nada, pois pessoas são carregadas do banco
      const lastPersonIndex = loadLastPersonIndex();
      return { ...state, lastPersonIndex };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Carregar pessoas do banco de dados quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      PeopleService.getAll()
        .then((people) => {
          dispatch({ type: 'SET_PEOPLE', payload: people });
        })
        .catch((error) => {
          console.error('Erro ao carregar pessoas:', error);
        });
    } else {
      // Limpar pessoas quando deslogar
      dispatch({ type: 'SET_PEOPLE', payload: [] });
    }
  }, [isAuthenticated]);

  // Interceptar ações para fazer chamadas à API
  const enhancedDispatch = async (action: AppAction) => {
    if (action.type === 'ADD_PERSON' && isAuthenticated) {
      try {
        const newPerson = await PeopleService.add(action.payload);
        dispatch({ type: 'SET_PEOPLE', payload: [...state.people, newPerson] });
      } catch (error: any) {
        alert(error.message || 'Erro ao adicionar pessoa');
      }
    } else if (action.type === 'REMOVE_PERSON' && isAuthenticated) {
      try {
        await PeopleService.remove(action.payload);
        dispatch({ type: 'SET_PEOPLE', payload: state.people.filter(p => p.id !== action.payload) });
      } catch (error: any) {
        alert(error.message || 'Erro ao remover pessoa');
      }
    } else {
      dispatch(action);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch: enhancedDispatch as React.Dispatch<AppAction> }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

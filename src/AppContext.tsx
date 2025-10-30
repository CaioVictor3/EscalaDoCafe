import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction } from './types';

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
  const savedIndex = localStorage.getItem('lastPersonIndex');
  return savedIndex ? JSON.parse(savedIndex) : {};
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PERSON':
      const newPerson = {
        id: Date.now().toString(),
        name: action.payload,
      };
      return {
        ...state,
        people: [...state.people, newPerson],
        hasUnsavedChanges: true,
      };

    case 'REMOVE_PERSON':
      return {
        ...state,
        people: state.people.filter(person => person.id !== action.payload),
        hasUnsavedChanges: true,
      };

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
        hasUnsavedChanges: true,
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
        localStorage.setItem('lastPersonIndex', JSON.stringify(newLastPersonIndex));
      }

      // Persistir a escala do mês e a lista de pessoas automaticamente ao salvar no modal
      try {
        const periodStr = `${state.selectedYear}-${String(state.selectedMonth + 1).padStart(2, '0')}`;
        const monthKey = `alphaSchedule_${periodStr}`;
        const monthPeopleKey = `alphaSchedule_people_${periodStr}`;
        localStorage.setItem(monthKey, JSON.stringify(updatedCalendar));
        localStorage.setItem(monthPeopleKey, JSON.stringify(state.people.map(p => p.name)));
      } catch (e) {
        console.warn('Falha ao salvar a escala no localStorage após edição:', e);
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
      localStorage.setItem('lastPersonIndex', JSON.stringify(newIndex));
      return {
        ...state,
        lastPersonIndex: newIndex,
      };
    }

    case 'SET_HAS_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload };

    case 'SET_CAN_GENERATE_SCHEDULE':
      return { ...state, canGenerateSchedule: action.payload };

    case 'LOAD_FROM_STORAGE':
      const savedPeople = localStorage.getItem('people');
      const lastPersonIndex = loadLastPersonIndex();
      if (savedPeople) {
        const parsedPeople = JSON.parse(savedPeople).map((name: string, index: number) => ({
          id: index.toString(),
          name,
        }));
        return {
          ...state,
          people: parsedPeople,
          lastPersonIndex,
        };
      }
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

  // Salvar pessoas no localStorage sempre que a lista mudar
  React.useEffect(() => {
    if (state.people.length > 0) {
      const peopleNames = state.people.map(person => person.name);
      localStorage.setItem('people', JSON.stringify(peopleNames));
    }
  }, [state.people]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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

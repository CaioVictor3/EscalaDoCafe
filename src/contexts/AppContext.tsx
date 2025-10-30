import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

export interface Person {
  id: string;
  name: string;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface CalendarDay {
  day: number;
  date: Date;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  morningPerson?: string;
  afternoonPerson?: string;
}

export interface LastPersonIndex {
  [key: number]: string; // month number -> last person name
}

export interface AppState {
  people: Person[];
  holidays: Holiday[];
  selectedMonth: number;
  selectedYear: number;
  alphaContinuous: boolean;
  calendar: CalendarDay[];
  messages: string[];
  lastPersonIndex: LastPersonIndex;
  hasUnsavedChanges: boolean;
  canGenerateSchedule: boolean;
}

export type AppAction =
  | { type: 'ADD_PERSON'; payload: string }
  | { type: 'REMOVE_PERSON'; payload: string }
  | { type: 'SET_MONTH'; payload: number }
  | { type: 'SET_YEAR'; payload: number }
  | { type: 'SET_ALPHA_CONTINUOUS'; payload: boolean }
  | { type: 'SET_HOLIDAYS'; payload: Holiday[] }
  | { type: 'SET_CALENDAR'; payload: CalendarDay[] }
  | { type: 'SET_MESSAGES'; payload: string[] }
  | { type: 'UPDATE_DAY'; payload: { day: number; morningPerson: string; afternoonPerson: string } }
  | { type: 'LOAD_FROM_STORAGE' }
  | { type: 'SET_LAST_PERSON_INDEX'; payload: { month: number; person: string } }
  | { type: 'SET_HAS_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_CAN_GENERATE_SCHEDULE'; payload: boolean };

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

function loadLastPersonIndex(): LastPersonIndex {
  const savedIndex = localStorage.getItem('lastPersonIndex');
  return savedIndex ? JSON.parse(savedIndex) : {};
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PERSON':
      const newPerson: Person = {
        id: Date.now().toString(),
        name: action.payload,
      };
      return {
        ...state,
        people: [...state.people, newPerson],
      };

    case 'REMOVE_PERSON':
      return {
        ...state,
        people: state.people.filter(person => person.id !== action.payload),
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
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };

    case 'UPDATE_DAY':
      const updatedCalendar = state.calendar.map(day =>
        day.day === action.payload.day
          ? {
              ...day,
              morningPerson: action.payload.morningPerson,
              afternoonPerson: action.payload.afternoonPerson,
            }
          : day
      );
      
      // Persist the edit to the per-month saved schedule if in alpha continuous mode
      try {
        const periodStr = `${state.selectedYear}-${String(state.selectedMonth + 1).padStart(2, '0')}`;
        const monthKey = `alphaSchedule_${periodStr}`;
        const monthPeopleKey = `alphaSchedule_people_${periodStr}`;

        if (state.alphaContinuous) {
          // Update the saved month schedule so edits are preserved when reloading
          localStorage.setItem(monthKey, JSON.stringify(updatedCalendar));

          // Keep a saved snapshot of the (sorted) people for this month
          const peopleSnapshot = [...state.people.map(p => p.name)].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
          localStorage.setItem(monthPeopleKey, JSON.stringify(peopleSnapshot));
        }

        // Update the lastPersonIndex for this month based on the updated calendar
        const lastDayWith = updatedCalendar.slice().reverse().find(d => d.afternoonPerson || d.morningPerson);
        if (lastDayWith) {
          const newLastPersonIndex = {
            ...state.lastPersonIndex,
            [state.selectedMonth + 1]: lastDayWith.afternoonPerson || lastDayWith.morningPerson || '',
          };
          localStorage.setItem('lastPersonIndex', JSON.stringify(newLastPersonIndex));

          return {
            ...state,
            calendar: updatedCalendar,
            lastPersonIndex: newLastPersonIndex,
            hasUnsavedChanges: true,
          };
        }
      } catch (e) {
        console.warn('Falha ao persistir edição da escala mensal:', e);
      }

      return {
        ...state,
        calendar: updatedCalendar,
        hasUnsavedChanges: true,
      };

    case 'SET_LAST_PERSON_INDEX':
      const newIndex = {
        ...state.lastPersonIndex,
        [action.payload.month]: action.payload.person,
      };
      localStorage.setItem('lastPersonIndex', JSON.stringify(newIndex));
      return {
        ...state,
        lastPersonIndex: newIndex,
      };

    case 'SET_HAS_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      };

    case 'SET_CAN_GENERATE_SCHEDULE':
      return {
        ...state,
        canGenerateSchedule: action.payload,
      };

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
      return {
        ...state,
        lastPersonIndex,
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    lastPersonIndex: loadLastPersonIndex(),
  });

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

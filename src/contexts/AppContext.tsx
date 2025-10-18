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

export interface AppState {
  people: Person[];
  holidays: Holiday[];
  selectedMonth: number;
  selectedYear: number;
  alphaContinuous: boolean;
  calendar: CalendarDay[];
  messages: string[];
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
  | { type: 'LOAD_FROM_STORAGE' };

const initialState: AppState = {
  people: [],
  holidays: [],
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  alphaContinuous: false,
  calendar: [],
  messages: [],
};

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
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };

    case 'UPDATE_DAY':
      return {
        ...state,
        calendar: state.calendar.map(day =>
          day.day === action.payload.day
            ? {
                ...day,
                morningPerson: action.payload.morningPerson,
                afternoonPerson: action.payload.afternoonPerson,
              }
            : day
        ),
      };

    case 'LOAD_FROM_STORAGE':
      const savedPeople = localStorage.getItem('people');
      if (savedPeople) {
        const parsedPeople = JSON.parse(savedPeople).map((name: string, index: number) => ({
          id: index.toString(),
          name,
        }));
        return {
          ...state,
          people: parsedPeople,
        };
      }
      return state;

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

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

export interface EditModalProps {
  day: number;
  morningPerson: string;
  afternoonPerson: string;
  onSave: (day: number, morningPerson: string, afternoonPerson: string) => void;
  onClose: () => void;
}

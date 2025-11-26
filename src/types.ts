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
  lastPersonIndex: { [monthNumber: number]: string };
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
  | { type: 'SET_LAST_PERSON_INDEX'; payload: { month: number; person: string } }
  | { type: 'SET_HAS_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_CAN_GENERATE_SCHEDULE'; payload: boolean }
  | { type: 'LOAD_FROM_STORAGE' }
  | { type: 'LOAD_SCHEDULE_FROM_STORAGE'; payload: { year: number; month: number } };

export interface EditModalProps {
  day: number;
  morningPerson: string;
  afternoonPerson: string;
  onSave: (day: number, morningPerson: string, afternoonPerson: string) => void;
  onClose: () => void;
}

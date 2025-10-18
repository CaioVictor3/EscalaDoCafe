import { MONTH_NAMES } from './constants';

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const formatDate = (day: number, month: number, year: number): string => {
  return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
};

export const getMonthName = (monthIndex: number): string => {
  return MONTH_NAMES[monthIndex] || '';
};

export const isMonthDisabled = (monthIndex: number, selectedYear: number): boolean => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const minGlobal = currentYear * 12 + currentMonth;
  const maxGlobal = minGlobal + 2;
  const optionGlobal = selectedYear * 12 + monthIndex;
  
  return !(optionGlobal >= minGlobal && optionGlobal <= maxGlobal);
};

export const canEditDate = (year: number, month: number, day: number): boolean => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  
  return dayOfWeek !== 0 && dayOfWeek !== 6; // Não é fim de semana
};

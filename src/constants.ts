export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const;

export const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
] as const;

export const STORAGE_KEYS = {
  PEOPLE: 'people',
  ALPHA_CONTINUOUS_LAST_PERSON: 'alphaContinuousLastPerson',
  ALPHA_CONTINUOUS_LAST_PERIOD: 'alphaContinuousLastSavedPeriod',
  ALPHA_SCHEDULE: (period: string) => `alphaSchedule_${period}`,
  ALPHA_SCHEDULE_PEOPLE: (period: string) => `alphaSchedule_people_${period}`,
  INFO_MODAL_SHOWN: 'infoModalShown'
} as const;

export const API_ENDPOINTS = {
  HOLIDAYS: (year: number) => `https://brasilapi.com.br/api/feriados/v1/${year}`
} as const;

import type { Holiday } from './types';
import { API_ENDPOINTS } from './constants';

export class HolidayService {
  static async fetchHolidays(year: number): Promise<Holiday[]> {
    try {
      const response = await fetch(API_ENDPOINTS.HOLIDAYS(year));
      if (!response.ok) {
        throw new Error('Não foi possível buscar os feriados.');
      }
      const data = await response.json();
      return data.map((holiday: any) => {
        const [year, month, day] = holiday.date.split('-');
        return {
          date: `${day}/${month}/${year}`,
          name: holiday.name,
        };
      });
    } catch (error) {
      console.error('Erro ao buscar feriados:', error);
      throw new Error('Não foi possível carregar os feriados nacionais.');
    }
  }
}

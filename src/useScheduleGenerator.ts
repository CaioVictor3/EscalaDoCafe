import { useCallback } from 'react';
import { useApp } from './AppContext';
import type { CalendarDay, Holiday } from './types';
import { HolidayService } from './services';
import { shuffleArray, formatDate } from './utils';
import { STORAGE_KEYS } from './constants';

export const useScheduleGenerator = () => {
  const { state, dispatch } = useApp();

  const generateSchedule = useCallback(async () => {
    
    if (state.people.length < 2) {
      alert('Adicione ao menos 2 pessoas para gerar a escala.');
      return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentMonthIndexGlobal = currentYear * 12 + currentMonth;
    const selectedMonthIndexGlobal = state.selectedYear * 12 + state.selectedMonth;

    if (state.selectedYear < currentYear || (state.selectedYear === currentYear && state.selectedMonth < currentMonth)) {
      alert('Não é possível gerar escalas para meses que já passaram.');
      return;
    }

    if (selectedMonthIndexGlobal - currentMonthIndexGlobal > 2) {
      alert('Você só pode criar escalas até 2 meses à frente do mês atual.');
      return;
    }

    // Buscar feriados
    let holidays: Holiday[] = [];
    try {
      holidays = await HolidayService.fetchHolidays(state.selectedYear);
      dispatch({ type: 'SET_HOLIDAYS', payload: holidays });
    } catch (error) {
      console.error("Falha ao buscar feriados, a escala será gerada sem eles.", error);
      dispatch({ type: 'SET_HOLIDAYS', payload: [] });
    }

    const daysInMonth = new Date(state.selectedYear, state.selectedMonth + 1, 0).getDate();
    const calendar: CalendarDay[] = [];

    // Preparar lista de pessoas conforme modo selecionado
    let assignmentList = state.people.map(p => p.name);
    let personIndex = 0;
    const periodStr = `${state.selectedYear}-${String(state.selectedMonth + 1).padStart(2, '0')}`;
    const monthKey = STORAGE_KEYS.ALPHA_SCHEDULE(periodStr);
    const monthPeopleKey = STORAGE_KEYS.ALPHA_SCHEDULE_PEOPLE(periodStr);

    if (state.alphaContinuous) {
      // Ordena alfabeticamente
      assignmentList.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

      // Continuidade baseada no índice por mês
      const prevMonthNum = state.selectedMonth === 0 ? 12 : state.selectedMonth; // 1..12
      const lastPerson = state.lastPersonIndex[prevMonthNum];
      if (lastPerson) {
        if (assignmentList.includes(lastPerson)) {
          const lastIdx = assignmentList.indexOf(lastPerson);
          const startIdx = (lastIdx + 1) % assignmentList.length;
          assignmentList = assignmentList.slice(startIdx).concat(assignmentList.slice(0, startIdx));
        } else {
          // Se a última pessoa não estiver mais na lista, começa do início
        }
      }
    } else {
      // Modo tradicional: embaralhar
      assignmentList = shuffleArray(assignmentList);
    }

    // Gerar calendário
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(state.selectedYear, state.selectedMonth, day);
      const dayOfWeek = date.getDay();
      const formattedDate = formatDate(day, state.selectedMonth, state.selectedYear);
      
      const holiday = holidays.find(h => h.date === formattedDate);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let morningPerson = '';
      let afternoonPerson = '';
      
      if (!holiday && !isWeekend) {
        morningPerson = assignmentList[personIndex % assignmentList.length];
        personIndex++;
        afternoonPerson = assignmentList[personIndex % assignmentList.length];
        personIndex++;
      }

      calendar.push({
        day,
        date,
        isWeekend,
        isHoliday: !!holiday,
        holidayName: holiday?.name,
        morningPerson,
        afternoonPerson
      });
    }

    dispatch({ type: 'SET_CALENDAR', payload: calendar });

    // Salvar automaticamente no localStorage sempre que a escala for gerada
    try {
      // Salva a escala do mês e as pessoas usadas
      localStorage.setItem(monthKey, JSON.stringify(calendar));
      localStorage.setItem(monthPeopleKey, JSON.stringify(assignmentList));
    } catch (e) {
      console.warn('Falha ao salvar informações no localStorage:', e);
    }

    // Se modo contínuo alfabético estiver ativo, atualizar índice
    if (state.alphaContinuous) {
      // Encontra a última pessoa escalada no mês
      let lastAssignedPerson = '';
      for (let i = calendar.length - 1; i >= 0; i--) {
        const day = calendar[i];
        if (day.afternoonPerson) { lastAssignedPerson = day.afternoonPerson; break; }
        if (day.morningPerson) { lastAssignedPerson = day.morningPerson; break; }
      }

      if (lastAssignedPerson) {
        dispatch({
          type: 'SET_LAST_PERSON_INDEX',
          payload: { month: state.selectedMonth + 1, person: lastAssignedPerson },
        });
      }

      dispatch({ type: 'SET_MESSAGES', payload: ['Escala em ordem alfabética gerada com sucesso!'] });
    }
  }, [state.people, state.selectedMonth, state.selectedYear, state.alphaContinuous, state.messages.length, dispatch]);

  return { generateSchedule };
};

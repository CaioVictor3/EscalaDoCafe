import { useCallback } from 'react';
import { useApp } from './AppContext';
import type { CalendarDay } from './types';
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
    const holidays = await HolidayService.fetchHolidays(state.selectedYear);
    dispatch({ type: 'SET_HOLIDAYS', payload: holidays });

    const daysInMonth = new Date(state.selectedYear, state.selectedMonth + 1, 0).getDate();
    const calendar: CalendarDay[] = [];

    // Preparar lista de pessoas conforme modo selecionado
    let assignmentList = state.people.map(p => p.name);
    let personIndex = 0;
    const periodStr = `${state.selectedYear}-${String(state.selectedMonth + 1).padStart(2, '0')}`;
    const storageKey = STORAGE_KEYS.ALPHA_CONTINUOUS_LAST_PERSON;
    const monthKey = STORAGE_KEYS.ALPHA_SCHEDULE(periodStr);
    const monthPeopleKey = STORAGE_KEYS.ALPHA_SCHEDULE_PEOPLE(periodStr);

    if (state.alphaContinuous) {
      // Ordena alfabeticamente
      assignmentList.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

      // Verifica se já existe escala salva para o mês
      const savedScheduleJson = localStorage.getItem(monthKey);
      const savedPeopleJson = localStorage.getItem(monthPeopleKey);
      const currentPeopleSorted = [...state.people.map(p => p.name)].sort((a, b) => 
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      );
      const savedPeople = savedPeopleJson ? JSON.parse(savedPeopleJson) : null;

      if (savedScheduleJson && savedPeople && Array.isArray(savedPeople)) {
        const savedSorted = [...savedPeople].sort((a, b) => 
          a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
        );
        const sameList = savedSorted.length === currentPeopleSorted.length && 
          savedSorted.every((n, i) => n === currentPeopleSorted[i]);
        
        if (sameList) {
          // Carrega a escala existente
          const savedCalendar = JSON.parse(savedScheduleJson);
          dispatch({ type: 'SET_CALENDAR', payload: savedCalendar });
          dispatch({ type: 'SET_MESSAGES', payload: ['A escala para este mês já foi criada anteriormente em ordem alfabética. Exibindo a escala existente.'] });
          return;
        } else {
          dispatch({ type: 'SET_MESSAGES', payload: ['A lista de participantes foi alterada. Gerando uma nova escala em ordem alfabética para este mês.'] });
        }
      }

      // Lógica de continuidade inteligente
      const lastPerson = localStorage.getItem(storageKey);
      const lastPeriod = localStorage.getItem(STORAGE_KEYS.ALPHA_CONTINUOUS_LAST_PERIOD);
      
      if (lastPerson && lastPeriod) {
        // Verifica se a última pessoa ainda está na lista
        if (assignmentList.includes(lastPerson)) {
          // Encontra a posição da última pessoa e inicia com a próxima
          const lastIdx = assignmentList.indexOf(lastPerson);
          const startIdx = (lastIdx + 1) % assignmentList.length;
          assignmentList = assignmentList.slice(startIdx).concat(assignmentList.slice(0, startIdx));
        } else {
          // Se a pessoa não está mais na lista, inicia do início
          console.log(`Pessoa anterior (${lastPerson}) não está mais na lista. Iniciando do início.`);
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

    // Se modo contínuo alfabético estiver ativo, salvar informações
    if (state.alphaContinuous) {
      // Encontra a última pessoa escalada no mês
      let lastAssignedPerson = '';
      let lastAssignedDay = 0;
      
      // Percorre o calendário para encontrar a última pessoa escalada
      for (let i = calendar.length - 1; i >= 0; i--) {
        const day = calendar[i];
        if (day.afternoonPerson) {
          lastAssignedPerson = day.afternoonPerson;
          lastAssignedDay = day.day;
          break;
        } else if (day.morningPerson) {
          lastAssignedPerson = day.morningPerson;
          lastAssignedDay = day.day;
          break;
        }
      }
      
      const periodKey = STORAGE_KEYS.ALPHA_CONTINUOUS_LAST_PERIOD;
      
      try {
        // Salva a última pessoa escalada para continuidade
        if (lastAssignedPerson) {
          localStorage.setItem(storageKey, lastAssignedPerson);
          localStorage.setItem(periodKey, periodStr);
          console.log(`Salvando última pessoa escalada: ${lastAssignedPerson} (dia ${lastAssignedDay})`);
        }
        
        // Salva a escala do mês
        localStorage.setItem(monthKey, JSON.stringify(calendar));
        localStorage.setItem(monthPeopleKey, JSON.stringify(assignmentList));
        
        if (state.messages.length === 0) {
          const message = lastAssignedPerson 
            ? `Escala em ordem alfabética gerada com sucesso! Última pessoa escalada: ${lastAssignedPerson}`
            : 'Escala em ordem alfabética gerada com sucesso!';
          dispatch({ type: 'SET_MESSAGES', payload: [message] });
        }
      } catch (e) {
        console.warn('Falha ao salvar informações no localStorage:', e);
      }
    }
  }, [state.people, state.selectedMonth, state.selectedYear, state.alphaContinuous, state.messages.length, dispatch]);

  return { generateSchedule };
};

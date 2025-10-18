import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import type { Holiday, CalendarDay } from '../contexts/AppContext';

export const useScheduleGenerator = () => {
  const { state, dispatch } = useApp();

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchHolidays = async (year: number): Promise<Holiday[]> => {
    try {
      const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
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
      alert('Não foi possível carregar os feriados nacionais.');
      return [];
    }
  };

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
    const holidays = await fetchHolidays(state.selectedYear);
    dispatch({ type: 'SET_HOLIDAYS', payload: holidays });

    const daysInMonth = new Date(state.selectedYear, state.selectedMonth + 1, 0).getDate();
    const calendar: CalendarDay[] = [];

    // Preparar lista de pessoas conforme modo selecionado
    let assignmentList = state.people.map(p => p.name);
    let personIndex = 0;
    const periodStr = `${state.selectedYear}-${String(state.selectedMonth + 1).padStart(2, '0')}`;
    const storageKey = 'alphaContinuousLastPerson';
    const monthKey = `alphaSchedule_${periodStr}`;
    const monthPeopleKey = `alphaSchedule_people_${periodStr}`;

    if (state.alphaContinuous) {
      // Verifica se já existe escala salva para o mês
      const savedScheduleHtml = localStorage.getItem(monthKey);
      const savedPeopleJson = localStorage.getItem(monthPeopleKey);
      const currentPeopleSorted = [...state.people.map(p => p.name)].sort((a, b) => 
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      );
      const savedPeople = savedPeopleJson ? JSON.parse(savedPeopleJson) : null;

      if (savedScheduleHtml && savedPeople && Array.isArray(savedPeople)) {
        const savedSorted = [...savedPeople].sort((a, b) => 
          a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
        );
        const sameList = savedSorted.length === currentPeopleSorted.length && 
          savedSorted.every((n, i) => n === currentPeopleSorted[i]);
        
        if (sameList) {
          dispatch({ type: 'SET_MESSAGES', payload: ['A escala para este mês já foi criada anteriormente em ordem alfabética. Exibindo a escala existente.'] });
          return;
        } else {
          dispatch({ type: 'SET_MESSAGES', payload: ['A lista de participantes foi alterada. Gerando uma nova escala em ordem alfabética para este mês.'] });
        }
      }

      // Ordena alfabeticamente
      assignmentList.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

      // Recupera último participante salvo anteriormente
      const lastPerson = localStorage.getItem(storageKey);
      if (lastPerson) {
        if (assignmentList.includes(lastPerson)) {
          const lastIdx = assignmentList.indexOf(lastPerson);
          const startIdx = (lastIdx + 1) % assignmentList.length;
          assignmentList = assignmentList.slice(startIdx).concat(assignmentList.slice(0, startIdx));
        } else {
          const cmp = (a: string, b: string) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
          let startIdx = assignmentList.findIndex(name => cmp(name, lastPerson) > 0);
          if (startIdx === -1) startIdx = 0;
          assignmentList = assignmentList.slice(startIdx).concat(assignmentList.slice(0, startIdx));
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
      const formattedDate = `${String(day).padStart(2, '0')}/${String(state.selectedMonth + 1).padStart(2, '0')}/${state.selectedYear}`;
      
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
      const lastAssignedIndex = (personIndex - 1 + assignmentList.length) % assignmentList.length;
      const lastAssignedPerson = assignmentList[lastAssignedIndex];
      const periodKey = 'alphaContinuousLastSavedPeriod';
      
      try {
        const savedPeriod = localStorage.getItem(periodKey);
        if (savedPeriod !== periodStr) {
          localStorage.setItem(storageKey, lastAssignedPerson);
          localStorage.setItem(periodKey, periodStr);
        }
        localStorage.setItem(monthKey, JSON.stringify(calendar));
        localStorage.setItem(monthPeopleKey, JSON.stringify(assignmentList));
        
        if (state.messages.length === 0) {
          dispatch({ type: 'SET_MESSAGES', payload: ['Escala em ordem alfabética gerada com sucesso!'] });
        }
      } catch (e) {
        console.warn('Falha ao salvar informações no localStorage:', e);
      }
    }
  }, [state.people, state.selectedMonth, state.selectedYear, state.alphaContinuous, state.messages.length, dispatch]);

  return { generateSchedule };
};

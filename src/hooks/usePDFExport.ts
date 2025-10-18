import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

export const usePDFExport = () => {
  const { state } = useApp();

  const exportToPDF = useCallback(async () => {
    if (state.calendar.length === 0) {
      alert('Nenhuma escala gerada para exportar.');
      return;
    }

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const monthName = monthNames[state.selectedMonth];
    const filename = `Escala do café - ${monthName} ${state.selectedYear}.pdf`;

    // Adicionar classe para exportação
    document.body.classList.add('exporting-pdf');

    // Criar elemento temporário para exportação
    const exportElement = document.createElement('div');
    exportElement.innerHTML = `
      <div id="calendar">
        <h2 style="text-align: center; margin-bottom: 20px;">
          ${monthName} ${state.selectedYear}
        </h2>
        <table style="table-layout: fixed; width: 100%; border-collapse: collapse; border: 1px solid #dee2e6;">
          <thead>
            <tr>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 8px;">Domingo</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 8px;">Segunda</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 8px;">Terça</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 8px;">Quarta</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 8px;">Quinta</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 8px;">Sexta</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 8px;">Sábado</th>
            </tr>
          </thead>
          <tbody>
            ${generateCalendarRows()}
          </tbody>
        </table>
      </div>
      <div id="pdf-watermark-container" style="text-align: center; margin-top: 20px; font-size: 16px; color: #242424;">
        Feito por Caio Victor ©<br>
        <span class="pdf-only">Visite meu site em: escaladocafe.netlify.app</span>
      </div>
    `;

    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      html2canvas: {
        scale: 2,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['avoid-all'],
      },
    };

    try {
      // Usar html2pdf do window (carregado via CDN)
      const html2pdf = (window as any).html2pdf;
      
      if (!html2pdf) {
        throw new Error('html2pdf não está disponível');
      }
      
      await html2pdf()
        .set(options)
        .from(exportElement)
        .save();
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('Erro ao exportar PDF: ' + (error as Error).message);
    } finally {
      document.body.classList.remove('exporting-pdf');
    }
  }, [state.calendar, state.selectedMonth, state.selectedYear]);

  const generateCalendarRows = () => {
    const daysInMonth = new Date(state.selectedYear, state.selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(state.selectedYear, state.selectedMonth, 1).getDay();
    
    let rows = '';
    let currentRow = '';
    
    // Adicionar células vazias para os dias antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentRow += '<td style="width: 14.2857142857%; border: 1px solid #dee2e6; height: 120px;"></td>';
    }
    
    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(state.selectedYear, state.selectedMonth, day);
      const dayOfWeek = date.getDay();
      const formattedDate = `${String(day).padStart(2, '0')}/${String(state.selectedMonth + 1).padStart(2, '0')}/${state.selectedYear}`;
      
      const holiday = state.holidays.find(h => h.date === formattedDate);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let cellContent = '';
      
      if (holiday) {
        cellContent = `
          <strong>${day}</strong><br/>
          <span style="display: block; padding: 6px 4px; margin-top: 6px; line-height: 1.2; white-space: normal; word-break: break-word; overflow-wrap: anywhere; text-align: center; font-size: 11px; min-height: 36px; max-height: 50px; overflow: visible;">
            ${holiday.name}
          </span>
        `;
      } else if (!isWeekend) {
        const calendarDay = state.calendar.find(d => d.day === day);
        const morningPerson = calendarDay?.morningPerson || '';
        const afternoonPerson = calendarDay?.afternoonPerson || '';
        
        cellContent = `
          <div style="display: flex; flex-direction: column; align-items: center; height: 100%; padding: 8px;">
            <strong>${day}</strong>
            <span style="word-break: break-word; overflow-wrap: anywhere; text-align: center; font-size: 12px;">
              Manhã: ${morningPerson}
            </span>
            <span style="word-break: break-word; overflow-wrap: anywhere; text-align: center; font-size: 12px;">
              Tarde: ${afternoonPerson}
            </span>
          </div>
        `;
      } else {
        cellContent = `<strong>${day}</strong><br/>--`;
      }
      
      const cellStyle = holiday 
        ? 'background-color: #f8d7da; border: 1px solid #dee2e6; height: 120px; min-height: 120px;'
        : 'border: 1px solid #dee2e6; height: 120px; min-height: 120px;';
      
      currentRow += `<td style="width: 14.2857142857%; ${cellStyle}">${cellContent}</td>`;
      
      // Se é sábado, fechar a linha
      if (dayOfWeek === 6) {
        rows += `<tr>${currentRow}</tr>`;
        currentRow = '';
      }
    }
    
    // Se ainda há células na linha atual, fechar
    if (currentRow) {
      rows += `<tr>${currentRow}</tr>`;
    }
    
    return rows;
  };

  return { exportToPDF };
};

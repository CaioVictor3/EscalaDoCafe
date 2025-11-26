import { useCallback } from 'react';
import { useApp } from './AppContext';
import { MONTH_NAMES } from './constants';

export const usePDFExport = () => {
  const { state } = useApp();

  const exportToPDF = useCallback(async () => {
    if (state.calendar.length === 0) {
      alert('Nenhuma escala gerada para exportar.');
      return;
    }

    const monthName = MONTH_NAMES[state.selectedMonth];
    const filename = `Escala do café - ${monthName} ${state.selectedYear}.pdf`;

    // Adicionar classe para exportação
    document.body.classList.add('exporting-pdf');

    // Criar elemento temporário para exportação
    const exportElement = document.createElement('div');
    exportElement.style.cssText = 'font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff;';
    exportElement.innerHTML = `
      <div id="calendar" style="width: 100%; max-width: 100%;">
        <h2 style="text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold; color: #212529;">
          ${monthName} ${state.selectedYear}
        </h2>
        <table style="table-layout: fixed; width: 100%; border-collapse: collapse; border: 2px solid #dee2e6; margin: 0 auto;">
          <thead>
            <tr>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 10px 5px; background-color: #f8f9fa; font-weight: bold; font-size: 13px; text-align: center; vertical-align: middle;">Domingo</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 10px 5px; background-color: #f8f9fa; font-weight: bold; font-size: 13px; text-align: center; vertical-align: middle;">Segunda</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 10px 5px; background-color: #f8f9fa; font-weight: bold; font-size: 13px; text-align: center; vertical-align: middle;">Terça</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 10px 5px; background-color: #f8f9fa; font-weight: bold; font-size: 13px; text-align: center; vertical-align: middle;">Quarta</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 10px 5px; background-color: #f8f9fa; font-weight: bold; font-size: 13px; text-align: center; vertical-align: middle;">Quinta</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 10px 5px; background-color: #f8f9fa; font-weight: bold; font-size: 13px; text-align: center; vertical-align: middle;">Sexta</th>
              <th style="width: 14.2857142857%; border: 1px solid #dee2e6; padding: 10px 5px; background-color: #f8f9fa; font-weight: bold; font-size: 13px; text-align: center; vertical-align: middle;">Sábado</th>
            </tr>
          </thead>
          <tbody>
            ${generateCalendarRows()}
          </tbody>
        </table>
      </div>
      <div id="pdf-watermark-container" style="text-align: center; margin-top: 30px; font-size: 14px; color: #6c757d; padding: 10px;">
        Feito por Caio Victor ©<br>
        <span style="font-size: 12px;">Visite meu site em: escaladocafe.netlify.app</span>
      </div>
    `;

    const options = {
      margin: [15, 15, 15, 15],
      filename: filename,
      html2canvas: {
        scale: 2,
        scrollY: 0,
        scrollX: 0,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['tr', 'td']
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
      currentRow += '<td style="width: 14.2857142857%; border: 1px solid #dee2e6; height: 100px; min-height: 100px; padding: 5px; vertical-align: top; background-color: #ffffff;"></td>';
    }
    
    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(state.selectedYear, state.selectedMonth, day);
      const dayOfWeek = date.getDay();
      const formattedDate = `${String(day).padStart(2, '0')}/${String(state.selectedMonth + 1).padStart(2, '0')}/${state.selectedYear}`;
      
      const holiday = state.holidays.find(h => h.date === formattedDate);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let cellContent = '';
      let cellStyle = '';
      
      if (holiday) {
        cellContent = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 100%; padding: 8px 4px; box-sizing: border-box;">
            <strong style="font-size: 16px; margin-bottom: 6px; color: #212529;">${day}</strong>
            <span style="display: block; padding: 4px 2px; line-height: 1.3; white-space: normal; word-break: break-word; overflow-wrap: break-word; text-align: center; font-size: 11px; color: #721c24; font-weight: normal; width: 100%;">
              ${holiday.name}
            </span>
          </div>
        `;
        cellStyle = 'background-color: #f8d7da; border: 1px solid #dee2e6; height: 100px; min-height: 100px; padding: 0; vertical-align: top;';
      } else if (!isWeekend) {
        const calendarDay = state.calendar.find(d => d.day === day);
        const morningPerson = calendarDay?.morningPerson || '';
        const afternoonPerson = calendarDay?.afternoonPerson || '';
        
        cellContent = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 8px 4px; box-sizing: border-box; text-align: center;">
            <strong style="font-size: 16px; margin-bottom: 8px; color: #212529;">${day}</strong>
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 4px;">
              <span style="display: block; font-size: 10px; color: #6c757d; margin-bottom: 2px; font-weight: bold; text-align: center;">Manhã:</span>
              <span style="display: block; word-break: break-word; overflow-wrap: break-word; text-align: center; font-size: 11px; color: #212529; line-height: 1.3; width: 100%;">
                ${morningPerson || '--'}
              </span>
            </div>
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="display: block; font-size: 10px; color: #6c757d; margin-bottom: 2px; font-weight: bold; text-align: center;">Tarde:</span>
              <span style="display: block; word-break: break-word; overflow-wrap: break-word; text-align: center; font-size: 11px; color: #212529; line-height: 1.3; width: 100%;">
                ${afternoonPerson || '--'}
              </span>
            </div>
          </div>
        `;
        cellStyle = 'border: 1px solid #dee2e6; height: 100px; min-height: 100px; padding: 0; vertical-align: top; background-color: #ffffff;';
      } else {
        cellContent = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 100%; padding: 8px; box-sizing: border-box;">
            <strong style="font-size: 16px; color: #6c757d;">${day}</strong>
            <span style="font-size: 12px; color: #adb5bd; margin-top: 4px;">--</span>
          </div>
        `;
        cellStyle = 'border: 1px solid #dee2e6; height: 100px; min-height: 100px; padding: 0; vertical-align: top; background-color: #f8f9fa;';
      }
      
      currentRow += `<td style="width: 14.2857142857%; ${cellStyle}">${cellContent}</td>`;
      
      // Se é sábado, fechar a linha
      if (dayOfWeek === 6) {
        rows += `<tr style="page-break-inside: avoid;">${currentRow}</tr>`;
        currentRow = '';
      }
    }
    
    // Se ainda há células na linha atual, fechar
    if (currentRow) {
      rows += `<tr style="page-break-inside: avoid;">${currentRow}</tr>`;
    }
    
    return rows;
  };

  return { exportToPDF };
};

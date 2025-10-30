import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import EditModal from './EditModal';

const Calendar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [editModalData, setEditModalData] = useState<{
    day: number;
    morningPerson: string;
    afternoonPerson: string;
    isLastDayOfMonth: boolean;
  } | null>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const getLastDayWithAssignment = () => {
    const daysWithAssignments = state.calendar
      .filter(day => day.morningPerson || day.afternoonPerson)
      .map(day => day.day);
    return Math.max(...daysWithAssignments);
  };

  const handleEditDay = (day: number, morningPerson: string, afternoonPerson: string) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (state.selectedYear < currentYear || (state.selectedYear === currentYear && state.selectedMonth < currentMonth)) {
      alert('Não é possível editar escalas para meses que já passaram.');
      return;
    }

    const date = new Date(state.selectedYear, state.selectedMonth, day);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      alert('A edição não é permitida nos sábados e domingos.');
      return;
    }

    const lastDay = getLastDayWithAssignment();
    setEditModalData({ 
      day, 
      morningPerson, 
      afternoonPerson,
      isLastDayOfMonth: day === lastDay
    });
  };

  const handleSaveChanges = (day: number, morningPerson: string, afternoonPerson: string) => {
    dispatch({
      type: 'UPDATE_DAY',
      payload: { day, morningPerson, afternoonPerson }
    });
    setEditModalData(null);
  };

  const renderCalendar = () => {
    if (state.calendar.length === 0) return null;

    const daysInMonth = new Date(state.selectedYear, state.selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(state.selectedYear, state.selectedMonth, 1).getDay();
    
    const calendarDays = [];
    
    // Adicionar células vazias para os dias antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<td key={`empty-${i}`}></td>);
    }
    
    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(state.selectedYear, state.selectedMonth, day);
      const dayOfWeek = date.getDay();
      const formattedDate = `${String(day).padStart(2, '0')}/${String(state.selectedMonth + 1).padStart(2, '0')}/${state.selectedYear}`;
      
      const holiday = state.holidays.find(h => h.date === formattedDate);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let cellContent;
      
      if (holiday) {
        cellContent = (
          <>
            <strong>{day}</strong>
            <br />
            <span className="holiday" style={{
              display: 'block',
              maxWidth: '100%',
              padding: '8px 6px',
              marginTop: '8px',
              lineHeight: 1.3,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              boxSizing: 'border-box',
              minHeight: '40px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'normal'
            }}>
              {holiday.name}
            </span>
          </>
        );
      } else if (!isWeekend) {
        const calendarDay = state.calendar.find(d => d.day === day);
        const morningPerson = calendarDay?.morningPerson || '';
        const afternoonPerson = calendarDay?.afternoonPerson || '';
        
        cellContent = (
          <div className="d-flex flex-column align-items-center h-100 p-2">
            <strong>{day}</strong>
            <span className="morning-person small flex-grow-1" style={{
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              textAlign: 'center'
            }}>
              Manhã: {morningPerson}
            </span>
            <span className="afternoon-person small flex-grow-1" style={{
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              textAlign: 'center'
            }}>
              Tarde: {afternoonPerson}
            </span>
            <button
              className="btn btn-sm btn-outline-primary mt-auto edit-button-class d-print-none"
              onClick={() => handleEditDay(day, morningPerson, afternoonPerson)}
              style={{ display: 'none' }} // Será mostrado via CSS quando necessário
            >
              Editar
            </button>
          </div>
        );
      } else {
        cellContent = (
          <>
            <strong>{day}</strong>
            <br />
            --
          </>
        );
      }

      calendarDays.push(
        <td
          key={day}
          id={`day-${day}`}
          className={holiday ? 'table-danger' : ''}
          style={{
            width: '14.2857142857%',
            boxSizing: 'border-box',
            verticalAlign: 'top',
            border: '1px solid #dee2e6',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            height: '120px',
            minHeight: '120px'
          }}
        >
          {cellContent}
        </td>
      );
    }

    // Agrupar em linhas de 7 dias
    const rows = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(
        <tr key={`row-${i}`} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          {calendarDays.slice(i, i + 7)}
        </tr>
      );
    }

    return (
      <div id="calendar">
        <h2 className="text-center mb-3">
          {monthNames[state.selectedMonth]} {state.selectedYear}
        </h2>
        <table className="table table-bordered text-center calendar-table" style={{
          tableLayout: 'fixed',
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #dee2e6'
        }}>
          <thead>
            <tr>
              {daysOfWeek.map(day => (
                <th key={day} style={{
                  width: '14.2857142857%',
                  boxSizing: 'border-box',
                  verticalAlign: 'top',
                  border: '1px solid #dee2e6',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {renderCalendar()}
      {editModalData && (
        <EditModal
          day={editModalData.day}
          morningPerson={editModalData.morningPerson}
          afternoonPerson={editModalData.afternoonPerson}
          onSave={handleSaveChanges}
          onClose={() => setEditModalData(null)}
          isLastDayOfMonth={editModalData.isLastDayOfMonth}
        />
      )}
    </>
  );
};

export default Calendar;

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { MONTH_NAMES, DAYS_OF_WEEK } from './constants';
import { canEditDate } from './utils';
import EditModal from './EditModal';

const Calendar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [editModalData, setEditModalData] = useState<{
    day: number;
    morningPerson: string;
    afternoonPerson: string;
  } | null>(null);

  const handleEditDay = (day: number, morningPerson: string, afternoonPerson: string) => {
    if (!canEditDate(state.selectedYear, state.selectedMonth, day)) {
      alert('Não é possível editar escalas para meses que já passaram ou fins de semana.');
      return;
    }

    setEditModalData({ day, morningPerson, afternoonPerson });
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
          <div className="d-flex flex-column align-items-center justify-content-center h-100 p-2" style={{
            textAlign: 'center'
          }}>
            <strong style={{ marginBottom: '8px' }}>{day}</strong>
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              gap: '4px'
            }}>
              <span className="morning-person small" style={{
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                textAlign: 'center',
                width: '100%'
              }}>
                Manhã: {morningPerson}
              </span>
              <span className="afternoon-person small" style={{
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                textAlign: 'center',
                width: '100%'
              }}>
                Tarde: {afternoonPerson}
              </span>
            </div>
            <button
              className="btn btn-sm btn-outline-primary mt-auto edit-button-class d-print-none"
              onClick={() => handleEditDay(day, morningPerson, afternoonPerson)}
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
          {MONTH_NAMES[state.selectedMonth]} {state.selectedYear}
        </h2>
        <table className="table table-bordered text-center calendar-table" style={{
          tableLayout: 'fixed',
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #dee2e6'
        }}>
          <thead>
            <tr>
              {DAYS_OF_WEEK.map(day => (
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
        />
      )}
    </>
  );
};

export default Calendar;

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
// SaveScheduleButton removido; salvamento agora é automático via modal

const CalendarControls: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Gerar opções de ano (ano atual e próximo)
  const yearOptions = [currentYear, currentYear + 1];

  const handleMonthChange = (month: number) => {
    dispatch({ type: 'SET_MONTH', payload: month });
  };

  const handleYearChange = (year: number) => {
    dispatch({ type: 'SET_YEAR', payload: year });
  };

  const handleAlphaContinuousChange = (checked: boolean) => {
    dispatch({ type: 'SET_ALPHA_CONTINUOUS', payload: checked });
    
    // Mostrar modal informativo apenas na primeira vez
    if (checked && !sessionStorage.getItem('infoModalShown')) {
      setShowInfoModal(true);
      sessionStorage.setItem('infoModalShown', 'true');
    }
  };

  const isMonthDisabled = (monthIndex: number) => {
    const minGlobal = currentYear * 12 + currentMonth;
    const maxGlobal = minGlobal + 2;
    const optionGlobal = state.selectedYear * 12 + monthIndex;
    return !(optionGlobal >= minGlobal && optionGlobal <= maxGlobal);
  };

  return (
    <>
      <div className="row justify-content-center align-items-end mb-4 g-3 center-controls">
        <div className="col-md-3">
          <label htmlFor="month" className="form-label text-center w-100">Mês:</label>
          <select
            id="month"
            value={state.selectedMonth}
            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
            className="form-select"
            style={{ textAlign: 'center', textAlignLast: 'center' }}
          >
            {monthNames.map((month, index) => (
              <option
                key={index}
                value={index}
                disabled={isMonthDisabled(index)}
              >
                {month}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-3">
          <label htmlFor="year" className="form-label text-center w-100">Ano:</label>
          <select
            id="year"
            value={state.selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="form-select"
            style={{ textAlign: 'center', textAlignLast: 'center' }}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-6">
          <div 
            className="form-check form-switch alpha-toggle mt-4 d-flex justify-content-center align-items-center p-3"
            style={{
              border: '1px solid #dee2e6',
              borderRadius: '12px',
              background: '#f8f9fa',
              transition: 'box-shadow .2s ease, background .2s ease'
            }}
          >
            <input
              className="form-check-input"
              type="checkbox"
              id="alphaContinuous"
              checked={state.alphaContinuous}
              onChange={(e) => handleAlphaContinuousChange(e.target.checked)}
              style={{
                width: '2.4rem',
                height: '1.2rem',
                cursor: 'pointer'
              }}
            />
            <label
              className="form-check-label ms-3 fw-semibold"
              htmlFor="alphaContinuous"
              style={{ cursor: 'pointer', userSelect: 'none', color: '#212529' }}
            >
              Escala em ordem alfabética contínua
            </label>
          </div>
        </div>
      </div>

      {/* Área de ações com botão salvar/alerta removida */}

      {/* Modal Informativo */}
      {showInfoModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-info-circle-fill me-2" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                  </svg>
                  Como Funciona a Escala Ordem Alfabética Contínua?
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowInfoModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p>Esta opção cria uma escala mais justa e rotativa ao longo dos meses. Veja como funciona:</p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex align-items-start">
                    <span className="badge bg-primary rounded-pill me-3 mt-1">1</span>
                    <div>
                      <strong>Ordem Alfabética</strong><br/>
                      A lista de pessoas é sempre organizada em ordem alfabética para a distribuição.
                    </div>
                  </li>
                  <li className="list-group-item d-flex align-items-start">
                    <span className="badge bg-primary rounded-pill me-3 mt-1">2</span>
                    <div>
                      <strong>Continuidade Inteligente</strong><br/>
                      O sistema memoriza a <strong>última pessoa</strong> que foi escalada no mês anterior.
                    </div>
                  </li>
                  <li className="list-group-item d-flex align-items-start">
                    <span className="badge bg-primary rounded-pill me-3 mt-1">3</span>
                    <div>
                      <strong>Rotação Justa</strong><br/>
                      A escala do novo mês começará com a <strong>próxima pessoa</strong> da lista, garantindo que o primeiro da escala seja sempre alguém diferente.
                    </div>
                  </li>
                </ul>
                <div className="alert alert-info mt-3" role="alert">
                  <strong>Exemplo:</strong> Se a escala de Janeiro terminou com "Bruno", a de Fevereiro começará com "Carla" (a próxima na ordem alfabética).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showInfoModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default CalendarControls;

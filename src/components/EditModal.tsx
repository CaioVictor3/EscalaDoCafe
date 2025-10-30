import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface EditModalProps {
  day: number;
  morningPerson: string;
  afternoonPerson: string;
  onSave: (day: number, morningPerson: string, afternoonPerson: string) => void;
  onClose: () => void;
  isLastDayOfMonth?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  day,
  morningPerson: initialMorningPerson,
  afternoonPerson: initialAfternoonPerson,
  onSave,
  onClose,
  isLastDayOfMonth = false
}) => {
  const { state } = useApp();
  const [morningPerson, setMorningPerson] = useState(initialMorningPerson);
  const [afternoonPerson, setAfternoonPerson] = useState(initialAfternoonPerson);

  useEffect(() => {
    setMorningPerson(initialMorningPerson);
    setAfternoonPerson(initialAfternoonPerson);
  }, [initialMorningPerson, initialAfternoonPerson]);

  const handleSave = () => {
    onSave(day, morningPerson, afternoonPerson);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="modal fade show" 
      style={{ display: 'block' }} 
      tabIndex={-1}
      onKeyDown={handleKeyPress}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Dia</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {isLastDayOfMonth && state.alphaContinuous && (
              <div className="alert alert-warning mb-3" role="alert">
                <div className="d-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                  </svg>
                  <div>
                    <strong>Atenção!</strong> Esta é a última pessoa do mês.
                    <br />
                    A alteração afetará o início da escala do próximo mês.
                  </div>
                </div>
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="morningPersonInput" className="form-label">
                Manhã
              </label>
              <input
                type="text"
                className="form-control"
                id="morningPersonInput"
                value={morningPerson}
                onChange={(e) => setMorningPerson(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="afternoonPersonInput" className="form-label">
                Tarde
              </label>
              <input
                type="text"
                className="form-control"
                id="afternoonPersonInput"
                value={afternoonPerson}
                onChange={(e) => setAfternoonPerson(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Fechar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

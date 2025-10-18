import React, { useState, useEffect } from 'react';

interface EditModalProps {
  day: number;
  morningPerson: string;
  afternoonPerson: string;
  onSave: (day: number, morningPerson: string, afternoonPerson: string) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  day,
  morningPerson: initialMorningPerson,
  afternoonPerson: initialAfternoonPerson,
  onSave,
  onClose
}) => {
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

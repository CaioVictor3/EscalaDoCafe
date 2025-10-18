import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const PersonForm: React.FC = () => {
  const [personName, setPersonName] = useState('');
  const { state, dispatch } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = personName.trim();

    if (!trimmedName) return;

    // Verificar se o nome já existe
    const nameExists = state.people.some(
      person => person.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      alert('Este nome já foi adicionado');
      return;
    }

    dispatch({ type: 'ADD_PERSON', payload: trimmedName });
    setPersonName('');
  };

  return (
    <div className="row justify-content-center mb-4">
      <div className="col-md-6">
        <form onSubmit={handleSubmit} className="input-group">
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            className="form-control"
            placeholder="Nome da pessoa"
            required
          />
          <button type="submit" className="btn btn-primary">
            Adicionar Pessoa
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonForm;

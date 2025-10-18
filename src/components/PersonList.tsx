import React from 'react';
import { useApp } from '../contexts/AppContext';

const PersonList: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleRemovePerson = (personId: string) => {
    dispatch({ type: 'REMOVE_PERSON', payload: personId });
  };

  return (
    <div>
      <h2 className="text-center mb-3">Pessoas Adicionadas:</h2>
      <ul id="personList" className="mb-4" style={{
        listStyleType: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        padding: 0
      }}>
        {state.people.map((person) => (
          <li
            key={person.id}
            style={{
              backgroundColor: '#fff',
              padding: '10px 15px',
              borderRadius: '5px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>{person.name}</span>
            <button
              onClick={() => handleRemovePerson(person.id)}
              className="remove-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2em',
                color: '#e74c3c',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#c0392b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e74c3c';
              }}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonList;

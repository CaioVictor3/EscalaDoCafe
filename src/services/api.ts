// Serviço para comunicação com a API
const API_BASE = '/.netlify/functions';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const PeopleService = {
  async getAll(): Promise<Array<{ id: string; name: string }>> {
    const response = await fetch(`${API_BASE}/people`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar pessoas');
    return response.json();
  },

  async add(name: string): Promise<{ id: string; name: string }> {
    const response = await fetch(`${API_BASE}/people`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao adicionar pessoa');
    }
    return response.json();
  },

  async remove(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/people`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Erro ao remover pessoa');
  },
};

export const ScheduleService = {
  async get(year: number, month: number): Promise<{
    schedule_data: any;
    last_person_index: any;
  }> {
    const response = await fetch(
      `${API_BASE}/schedules?year=${year}&month=${month}`,
      {
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Erro ao buscar escala');
    return response.json();
  },

  async save(
    year: number,
    month: number,
    schedule_data: any,
    last_person_index?: any
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ year, month, schedule_data, last_person_index }),
    });
    if (!response.ok) throw new Error('Erro ao salvar escala');
  },
};


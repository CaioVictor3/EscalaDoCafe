import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import * as jwt from 'jsonwebtoken';

const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || '');

function getUserIdFromToken(event: any): string | null {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const userId = getUserIdFromToken(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Não autorizado' }),
    };
  }

  try {
    // GET - Buscar escala
    if (event.httpMethod === 'GET') {
      const { year, month } = event.queryStringParameters || {};
      if (!year || !month) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Ano e mês são obrigatórios' }),
        };
      }

      const schedules = await sql`
        SELECT schedule_data, last_person_index FROM schedules
        WHERE user_id = ${userId} AND year = ${parseInt(year)} AND month = ${parseInt(month)}
      `;

      if (schedules.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ schedule_data: null, last_person_index: null }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(schedules[0]),
      };
    }

    // POST/PUT - Salvar escala
    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      const { year, month, schedule_data, last_person_index } = JSON.parse(event.body || '{}');
      
      if (!year || !month || !schedule_data) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Ano, mês e dados da escala são obrigatórios' }),
        };
      }

      const scheduleDataJson = JSON.stringify(schedule_data);
      const lastPersonIndexJson = last_person_index ? JSON.stringify(last_person_index) : null;

      const result = await sql`
        INSERT INTO schedules (user_id, year, month, schedule_data, last_person_index)
        VALUES (${userId}, ${year}, ${month}, ${scheduleDataJson}::jsonb, ${lastPersonIndexJson ? lastPersonIndexJson::jsonb : null})
        ON CONFLICT (user_id, year, month)
        DO UPDATE SET
          schedule_data = EXCLUDED.schedule_data,
          last_person_index = EXCLUDED.last_person_index,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id: result[0].id }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' }),
    };
  }
};


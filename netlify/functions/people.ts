import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import * as jwt from 'jsonwebtoken';

// Obter URL do banco de dados - Netlify DB usa NETLIFY_DATABASE_URL
const getDatabaseUrl = () => {
  const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'NETLIFY_DATABASE_URL não configurada. Execute "npx netlify db init" ou configure a variável de ambiente DATABASE_URL no Netlify.'
    );
  }
  return url;
};

// Inicializar sql de forma lazy para evitar erros no carregamento do módulo
let sqlInstance: ReturnType<typeof neon> | null = null;
const getSql = () => {
  if (!sqlInstance) {
    sqlInstance = neon(getDatabaseUrl());
  }
  return sqlInstance;
};

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
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    const sql = getSql();
    
    // GET - Listar pessoas do usuário
    if (event.httpMethod === 'GET') {
      const people = await sql`
        SELECT id, name FROM people WHERE user_id = ${userId} ORDER BY name
      `;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(people),
      };
    }

    // POST - Adicionar pessoa
    if (event.httpMethod === 'POST') {
      const { name } = JSON.parse(event.body || '{}');
      if (!name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Nome é obrigatório' }),
        };
      }

      const result = await sql`
        INSERT INTO people (user_id, name)
        VALUES (${userId}, ${name})
        ON CONFLICT (user_id, name) DO NOTHING
        RETURNING id, name
      `;

      if (result.length === 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Pessoa já existe' }),
        };
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result[0]),
      };
    }

    // DELETE - Remover pessoa
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body || '{}');
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID é obrigatório' }),
        };
      }

      await sql`
        DELETE FROM people WHERE id = ${id} AND user_id = ${userId}
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Erro em people:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};


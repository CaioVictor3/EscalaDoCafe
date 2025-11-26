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

export const handler: Handler = async (event) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token não fornecido' }),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    // Verificar token
    const decoded = jwt.verify(token, secret) as { userId: string; name: string };

    // Buscar usuário
    const sql = getSql();
    const users = await sql`
      SELECT id, name FROM users WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Usuário não encontrado' }),
      };
    }

    const user = users[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: user.id,
        name: user.name,
      }),
    };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token inválido ou expirado' }),
      };
    }

    console.error('Erro na verificação:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' }),
    };
  }
};


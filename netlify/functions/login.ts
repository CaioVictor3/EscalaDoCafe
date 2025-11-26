import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const sql = neon(process.env.NETLIFY_DATABASE_URL || '');

export const handler: Handler = async (event) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { name, password } = JSON.parse(event.body || '{}');

    if (!name || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nome e senha são obrigatórios' }),
      };
    }

    // Buscar usuário
    const users = await sql`
      SELECT id, name, password_hash FROM users WHERE name = ${name}
    `;

    if (users.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Nome ou senha incorretos' }),
      };
    }

    const user = users[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Nome ou senha incorretos' }),
      };
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: user.id,
          name: user.name,
        },
      }),
    };
  } catch (error: any) {
    console.error('Erro no login:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' }),
    };
  }
};


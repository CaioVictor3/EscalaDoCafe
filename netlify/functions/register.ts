import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
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

const sql = neon(getDatabaseUrl());

// Criar tabela de usuários se não existir
async function ensureUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

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
    await ensureUsersTable();

    const { name, password } = JSON.parse(event.body || '{}');

    if (!name || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nome e senha são obrigatórios' }),
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'A senha deve ter no mínimo 6 caracteres' }),
      };
    }

    // Verificar se o nome já existe
    const existingUser = await sql`
      SELECT id FROM users WHERE name = ${name}
    `;

    if (existingUser.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'Nome de usuário já cadastrado' }),
      };
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Inserir usuário
    const result = await sql`
      INSERT INTO users (name, password_hash)
      VALUES (${name}, ${passwordHash})
      RETURNING id, name, created_at
    `;

    const user = result[0];

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    return {
      statusCode: 201,
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
    console.error('Erro no registro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' }),
    };
  }
};


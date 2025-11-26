# Configuração do Banco de Dados Neon

Este guia explica como configurar o banco de dados Neon para o projeto Escala de Café.

## Passo 1: Inicializar o Banco de Dados no Netlify

Execute o seguinte comando na raiz do projeto:

```bash
npx netlify db init
```

Isso irá:
- Provisionar um banco de dados PostgreSQL no Neon
- Configurar as variáveis de ambiente automaticamente
- Conectar o banco ao seu projeto Netlify

## Passo 2: Configurar Variáveis de Ambiente

Após executar `npx netlify db init`, você precisará adicionar uma variável de ambiente adicional:

### JWT_SECRET

1. Acesse o painel do Netlify
2. Vá em **Site settings** > **Environment variables**
3. Adicione uma nova variável:
   - **Key**: `JWT_SECRET`
   - **Value**: Uma string aleatória segura (ex: gere com `openssl rand -base64 32`)

## Passo 3: Criar as Tabelas

Execute o script SQL em `database/schema.sql` no banco de dados:

1. Acesse o painel do Neon (o link será fornecido após `npx netlify db init`)
2. Ou use o Drizzle Studio: `npx drizzle-kit studio`
3. Execute o conteúdo do arquivo `database/schema.sql`

## Passo 4: Instalar Dependências

Certifique-se de que todas as dependências estão instaladas:

```bash
npm install
```

## Estrutura do Banco de Dados

### Tabela: users
- `id` (UUID): Identificador único do usuário
- `name` (VARCHAR): Nome completo do usuário
- `email` (VARCHAR): Email único do usuário
- `password_hash` (VARCHAR): Hash bcrypt da senha
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data de última atualização

### Tabela: schedules (opcional)
- `id` (UUID): Identificador único da escala
- `user_id` (UUID): Referência ao usuário
- `year` (INTEGER): Ano da escala
- `month` (INTEGER): Mês da escala (1-12)
- `schedule_data` (JSONB): Dados da escala em formato JSON
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data de última atualização

## Funções Serverless

As seguintes funções estão disponíveis:

- `/.netlify/functions/register` - Criar nova conta
- `/.netlify/functions/login` - Fazer login
- `/.netlify/functions/verify-auth` - Verificar token de autenticação

## Testando Localmente

Para testar as funções localmente:

```bash
netlify dev
```

Isso iniciará o servidor de desenvolvimento com suporte a funções serverless.

## Troubleshooting

### Erro: "NETLIFY_DATABASE_URL not found"
- Certifique-se de que executou `npx netlify db init`
- Verifique se a variável está configurada no Netlify

### Erro: "JWT_SECRET not found"
- Adicione a variável de ambiente `JWT_SECRET` no painel do Netlify
- Use uma string segura e aleatória

### Erro: "Table does not exist"
- Execute o script `database/schema.sql` no banco de dados
- Verifique se está conectado ao banco correto


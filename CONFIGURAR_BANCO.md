# Configurar Connection String do Neon no Netlify

## Passo 1: Obter a Connection String do Neon

A connection string do seu banco Neon é:
```
postgresql://neondb_owner:npg_bf6CvNBISg5w@ep-divine-queen-aehlkv5j-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Passo 2: Configurar no Netlify

1. Acesse o painel do Netlify: https://app.netlify.com
2. Selecione seu site
3. Vá em **Site settings** > **Environment variables**
4. Adicione as seguintes variáveis:

### Variável 1: NETLIFY_DATABASE_URL
- **Key**: `NETLIFY_DATABASE_URL`
- **Value**: `postgresql://neondb_owner:npg_bf6CvNBISg5w@ep-divine-queen-aehlkv5j-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require`
- **Scopes**: Production, Deploy previews, Branch deploys (marque todos)

### Variável 2: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: Uma string aleatória segura (ex: gere com `openssl rand -base64 32`)
- **Scopes**: Production, Deploy previews, Branch deploys (marque todos)

## Passo 3: Executar o Schema SQL

1. Acesse o Neon Dashboard: https://console.neon.tech
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute o conteúdo completo do arquivo `database/schema.sql`

Isso criará:
- Tabela `users`
- Tabela `people`
- Tabela `schedules`
- Função `text_to_jsonb` (se necessário)
- Índices e triggers

## Passo 4: Fazer Deploy

Após configurar as variáveis de ambiente:
1. Faça um novo commit e push
2. Ou faça um redeploy no Netlify (Deploys > Trigger deploy)

## Verificar se está funcionando

Após o deploy, teste:
1. Faça login/cadastro na aplicação
2. Tente adicionar uma pessoa
3. Verifique os logs do Netlify em **Functions** > **Logs** se houver erros

## Nota sobre Connection String

A connection string mostrada usa o formato `pooler`. Isso é bom para serverless functions porque:
- Gerencia conexões automaticamente
- É otimizado para muitas conexões curtas
- Funciona bem com Netlify Functions

Se precisar da connection string sem pooler (para ferramentas como Drizzle Studio), você pode obter no Neon Dashboard em **Connection Details**.


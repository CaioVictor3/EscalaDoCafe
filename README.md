# ☕ Escala de Café

Uma aplicação web moderna e intuitiva para gerenciar escalas de café de forma automática e organizada. Desenvolvida com React, TypeScript e Vite.

## 📋 Sobre o Projeto

O **Escala de Café** é uma ferramenta que facilita a criação e gerenciamento de escalas para o café da manhã/tarde. Com ela, você pode:

- Adicionar e gerenciar pessoas na escala
- Gerar escalas automaticamente para qualquer mês
- Editar escalas manualmente quando necessário
- Visualizar feriados automaticamente
- Exportar escalas para PDF
- Salvar automaticamente no navegador (localStorage)

## ✨ Funcionalidades

### 🎯 Principais Recursos

- **Geração Automática de Escalas**: Crie escalas automaticamente distribuindo pessoas de forma justa
- **Modo Alfabético Contínuo**: Mantém a ordem alfabética e continua de onde parou no mês anterior
- **Edição Manual**: Edite qualquer dia da escala após a geração
- **Detecção de Feriados**: Busca automaticamente feriados nacionais via API
- **Exportação para PDF**: Exporte suas escalas em formato PDF com formatação profissional
- **Persistência Automática**: Todas as alterações são salvas automaticamente no navegador
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile

### 🎨 Interface

- Design moderno e limpo
- Bootstrap 5 para componentes responsivos
- Cores intuitivas para identificar feriados e fins de semana
- Calendário visual fácil de entender

## 🚀 Como Usar

### Acessar a Aplicação

A aplicação está disponível em: [escaladocafe.netlify.app](https://escaladocafe.netlify.app)

### Passo a Passo

1. **Adicionar Pessoas**
   - Digite o nome da pessoa no campo de entrada
   - Clique em "Adicionar" ou pressione Enter
   - Repita para adicionar todas as pessoas

2. **Selecionar Mês e Ano**
   - Use os controles no topo para escolher o mês e ano desejado
   - Você pode criar escalas até 2 meses à frente

3. **Gerar Escala**
   - Clique no botão "Criar Escala"
   - A escala será gerada automaticamente
   - Feriados serão destacados em vermelho

4. **Editar Escala (Opcional)**
   - Clique no botão "Editar" em qualquer dia útil
   - Altere as pessoas da manhã ou tarde
   - As alterações são salvas automaticamente

5. **Exportar para PDF**
   - Clique no botão "Exportar para PDF"
   - O arquivo será baixado automaticamente

## 🛠️ Tecnologias Utilizadas

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **Bootstrap 5** - Framework CSS para design responsivo
- **html2pdf.js** - Biblioteca para exportação de PDFs
- **BrasilAPI** - API para busca de feriados nacionais

## 📦 Instalação Local

Se você quiser executar o projeto localmente:

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/escaladocafe.git
cd escaladocafe
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse `http://localhost:5173` no seu navegador

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build de produção localmente
- `npm run lint` - Executa o linter para verificar o código

## 📁 Estrutura do Projeto

```
escaladocafe/
├── src/
│   ├── components/       # Componentes React
│   ├── contexts/         # Context API para gerenciamento de estado
│   ├── hooks/            # Custom hooks
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Ponto de entrada da aplicação
│   └── ...
├── public/               # Arquivos estáticos
├── dist/                 # Build de produção (gerado)
├── index.html            # HTML principal
├── vite.config.ts        # Configuração do Vite
├── tsconfig.json         # Configuração do TypeScript
└── package.json          # Dependências do projeto
```

## 🔧 Configuração

### Variáveis de Ambiente

O projeto detecta automaticamente a branch Git durante o build para exibir no console qual branch foi publicada. Isso funciona tanto localmente quanto no Netlify.

## 📝 Funcionalidades Técnicas

### Persistência de Dados

- **localStorage**: Todas as escalas e pessoas são salvas automaticamente no navegador
- **Chaves de armazenamento**: Organizadas por período (ano-mês) para facilitar o gerenciamento

### Geração de Escalas

- **Modo Tradicional**: Embaralha as pessoas aleatoriamente
- **Modo Alfabético Contínuo**: Mantém ordem alfabética e continua de onde parou

### Exportação PDF

- Formatação profissional
- Tabela responsiva
- Destaque para feriados
- Informações de manhã e tarde claramente separadas

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

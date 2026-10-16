# Comic Tracker

Aplicação web para acompanhamento de mangás, manhwas, manhuas, webtoons e quadrinhos, permitindo cadastrar manualmente os quadrinhos e os sites de leitura, centralizar links e acompanhar o progresso e o histórico de leitura.

## Quick Start

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar o banco em apps/api/.env

# 3. Gerar o Prisma Client
pnpm --filter api exec prisma generate

# 4. Aplicar as migrations
pnpm --filter api exec prisma migrate dev

# 5. Iniciar frontend + backend
pnpm dev
```

Frontend: http://localhost:3001
Backend: http://localhost:3000

## Estrutura do projeto

O projeto utiliza um monorepo baseado em PNPM Workspaces:

```text
comic-tracker/
├── apps/
│   ├── api/        # Backend - NestJS
│   └── web/        # Frontend - Next.js
├── packages/       # Pacotes compartilhados (quando necessário)
├── package.json
└── pnpm-workspace.yaml
```

## Tecnologias

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Jest

### Workspace

- PNPM Workspaces
- Concurrently

## Requisitos

Antes de executar o projeto, tenha instalado:

- Node.js
- PNPM
- PostgreSQL

## Instalação

Como o projeto utiliza PNPM Workspaces, as dependências do frontend e do backend podem ser instaladas a partir da raiz do projeto com um único comando:

```bash
pnpm install
```

O PNPM identifica automaticamente os projetos dentro de `apps/` através do arquivo `pnpm-workspace.yaml`.

## Configuração do ambiente

O backend utiliza PostgreSQL e precisa da variável `DATABASE_URL`.

Crie um arquivo:

```text
apps/api/.env
```

com a configuração do banco:

```bash
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/comic_tracker"
```

O arquivo `.env` não deve ser versionado no Git.

## Banco de dados

Depois de configurar o `DATABASE_URL`, as migrations do Prisma podem ser aplicadas com:

```bash
pnpm --filter api exec prisma migrate dev
```

Para gerar o Prisma Client:

```bash
pnpm --filter api exec prisma generate
```

## Desenvolvimento

O projeto possui um comando único para iniciar frontend e backend simultaneamente:

```bash
pnpm dev
```

Esse comando inicia:

- API: http://localhost:3000
- Web: http://localhost:3001

Também é possível executar cada aplicação individualmente.

Apenas API:

```bash
pnpm dev:api
```

Apenas Web:

```bash
pnpm dev:web
```

## Scripts principais

| Comando                                          | Descrição                                              |
| ------------------------------------------------ | ------------------------------------------------------ |
| `pnpm install`                                   | Instala as dependências de todos os projetos do workspace |
| `pnpm dev`                                       | Inicia frontend e backend simultaneamente              |
| `pnpm dev:api`                                   | Inicia somente o backend                               |
| `pnpm dev:web`                                   | Inicia somente o frontend                              |
| `pnpm --filter api exec prisma generate`         | Gera o Prisma Client                                   |
| `pnpm --filter api exec prisma migrate dev`      | Executa as migrations do banco                         |

## Arquitetura

O frontend e o backend são aplicações independentes dentro do mesmo monorepo.

```text
┌─────────────────────┐
│      Next.js        │
│       Web           │
│    :3001            │
└──────────┬──────────┘
           │ HTTP/JSON
           ▼
┌─────────────────────┐
│       NestJS        │
│        API          │
│      :3000          │
└──────────┬──────────┘
           │ Prisma
           ▼
┌─────────────────────┐
│     PostgreSQL      │
│     comic_tracker   │
└─────────────────────┘
```

O frontend não acessa o banco de dados diretamente. Toda comunicação com os dados deve passar pela API.

## Desenvolvimento

As aplicações possuem seus próprios `AGENTS.md` com orientações específicas para desenvolvimento:

- `AGENTS.md`
- `apps/api/AGENTS.md`
- `apps/web/AGENTS.md`

Esses arquivos documentam as decisões e convenções utilizadas no projeto e devem ser consultados antes de realizar alterações significativas.

## Git

Arquivos gerados, dependências, variáveis de ambiente e configurações locais não devem ser versionados.

Entre os principais itens ignorados estão:

```text
node_modules/
.next/
dist/
.env
.agents/
.claude/
.windsurf/
```

## Ligar e desligar localmente (Windows)

Para não precisar digitar `pnpm dev` toda vez, o projeto inclui dois
executáveis de duplo clique na raiz:

- `iniciar-comic-tracker.bat` — sobe o PostgreSQL e os servidores (API e
  Web) em **uma única janela de comando** e abre o navegador em
  `http://comic.local:3001`. Se os servidores já estiverem rodando, apenas
  abre o navegador.
- `parar-comic-tracker.bat` — fecha a API e a Web e para o PostgreSQL.

Há também um atalho **"Comic Tracker"** na área de trabalho apontando para
o `iniciar-comic-tracker.bat`, e o cabeçalho do app tem um botão **"Sair"**
que encerra o projeto (API, Web e PostgreSQL) direto da interface.

Na primeira execução, o Windows pede permissão de administrador
(necessária para editar o arquivo `hosts` e controlar o serviço do
PostgreSQL). O script adiciona `127.0.0.1 comic.local` ao arquivo
`hosts` automaticamente, tornando a URL amigável sem servidor externo.
Todo o acesso é local ao seu PC.

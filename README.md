# Comic Tracker

Aplicação web para acompanhamento de mangás, manhwas, manhuas, webtoons e quadrinhos, permitindo centralizar links de diferentes sites, acompanhar o progresso de leitura e identificar novos capítulos e disponibilidade dos sites.

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

# AGENTS.md

## 1. Visão geral do projeto

Este é o **Comic Tracker**, uma aplicação web para organizar e acompanhar a leitura de
mangás, manhwas, manhuas, webtoons, comics e outros tipos de quadrinhos.

O sistema tem como objetivo permitir que o usuário:

- cadastre e acompanhe obras que está lendo;
- registre a **última leitura**: capítulo numérico atual e URL do capítulo por
  site (não há histórico de leitura — ver decisão `docs/decisions/0001`);
- avalie cada obra com uma nota pessoal de 1 a 5;
- cadastre os sites onde lê e mantenha os links de leitura;
- centralize informações de diferentes fontes;
- visualize o dashboard (acervo) organizando seus quadrinhos e o progresso de leitura;
- filtre, busque e ordene o acervo pela URL, com visão padrão aplicada
  automaticamente (ver decisão `docs/decisions/0003`).

O cadastro de quadrinhos e de sites é feito **manualmente** pelo usuário.

O projeto **não** realiza scraping nem acesso automatizado aos sites de
leitura. Não usar Playwright, Puppeteer, Cheerio, requisições automatizadas,
bypass de Cloudflare ou qualquer mecanismo para acessar e extrair dados dos
sites. Os dados de quadrinhos, capítulos e progresso vêm do cadastro do
usuário.

Futuramente, uma extensão Firefox identificará a URL da página atualmente
aberta e permitirá atualizar o progresso de leitura. A identificação de
quadrinho/capítulo pela URL será implementada em uma etapa posterior.

O projeto é um monorepo utilizando PNPM Workspaces.

---

# 2. Estrutura do monorepo

A estrutura principal é:

```text
comic-tracker/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│
├── docs/
│
├── AGENTS.md
├── README.md
├── package.json
└── pnpm-workspace.yaml
```

## 3. Estrutura do Projeto

### `apps/web`
* **Descrição:** Frontend da aplicação.
* **Tecnologias Principais:** Next.js 16 (App Router), React 19, TypeScript (estrito), Tailwind CSS 4.
* **Responsabilidades:**
  * Interface do usuário
  * Navegação
  * Estado da interface
  * Comunicação com a API
  * Componentes visuais
  * Experiência do usuário (UX)
* **Estado atual (convenções em uso):**
  * Rotas: `/` (acervo/dashboard), `/comics/new`, `/comics/[id]`, `/comics/[id]/edit`, `/sites`, `/sites/new`, `/sites/[id]`, `/sites/[id]/edit`.
  * Componentes organizados por domínio em `components/`: `dashboard/`, `comic-detail/`, `comic-form/`, `sites/`, `rating/`.
  * Consultas via `services/*.service.ts`, executadas só no servidor (Server Components e Server Actions); cliente HTTP centralizado em `services/api-client.ts` (erros tipados como `ApiError`).
  * Escritas (criar/editar/excluir) via **Server Actions** (`app/*/actions.ts`), que validam o formulário, chamam o service e encerram com `revalidatePath`/`redirect`.
  * Busca, filtros e ordenação do acervo vivem na **URL** (ver decisão `docs/decisions/0003`).

### `apps/api`
* **Descrição:** Backend da aplicação.
* **Tecnologias Principais:** NestJS 12, TypeScript (estrito), Prisma 7 + PostgreSQL, Jest, oxlint.
* **Responsabilidades:**
  * Regras de negócio
  * Persistência de dados
  * APIs
  * Integrações externas
  * Processamento
  * Tarefas assíncronas e Jobs
* **Estado atual:**
  * Módulos diretamente em `src/` (não há pasta `modules`): `comics`, `sites`, `comic-sites`, `reading-progress`, `prisma`, `common`.
  * Endpoints:
    * `/comics` — CRUD + filtros (`search`, `status`, `order`, `rating`, `site`, `siteStatus`, `inactive`);
    * `/sites` — CRUD;
    * `/comic-sites` — CRUD dos vínculos obra↔site (+ `?siteId=`);
    * `/reading-progress` — CRUD + `PUT /reading-progress/:comicId` (upsert idempotente usado para registrar a última leitura — decisão `docs/decisions/0001`).
  * Prisma: schema em `prisma/schema.prisma`; client gerado em `src/generated`; migrations em `prisma/migrations`; seed em `prisma/seed.ts` (`pnpm --filter api db:seed`).

### Modelo de dados (resumo)

* `Comic` (obra): título, títulos alternativos, tipo (`MANGA`, `MANHWA`, `MANHUA`, `WEBTOON`, `COMIC`, `OTHER`), status de publicação, capa, nota pessoal 1–5.
* `Site`: nome (único), `baseUrl`, ativo/inativo.
* `ComicSite` (vínculo obra↔site): `url` + `currentChapterUrl` — a última URL lida **naquele site** (decisão `docs/decisions/0002`).
* `ReadingProgress`: apenas a **última leitura** — capítulo (`Decimal`), site da leitura (`comicSiteId`), `lastReadAt` e status (`READING`, `COMPLETED`, `PAUSED`, `DROPPED`, `PLAN_TO_READ`). Sem histórico (decisão `docs/decisions/0001`).

### `packages`
* Contém código que realmente precisa ser compartilhado entre diferentes aplicações.
* **Regra:** Não criar packages sem necessidade real de compartilhamento.
* **Estado atual:** vazio (nada precisa ser compartilhado até o momento).

### `docs`
* Contém documentação de arquitetura, funcionalidades e decisões importantes do projeto.
* Decisões registradas em `docs/decisions/` (ADRs 0001–0003) — consultar antes de alterar o comportamento do domínio.

### Variáveis de ambiente

* API (`apps/api/.env.example`): `DATABASE_URL`, `PORT`, `CORS_ORIGINS`.
* Web (`apps/web/.env.example`): `API_URL` (URL base da API usada pelo servidor Next.js).

### Comandos principais

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Sobe o PostgreSQL (serviço Windows), a API e o Web |
| `pnpm dev:api` / `pnpm dev:web` | Sobe apenas a API (porta 3000) ou o Web (porta 3001) |
| `pnpm db:generate` / `pnpm db:migrate` | Gera o Prisma Client / aplica migrations do banco |
| `pnpm --filter api db:seed` | Seed com sites de exemplo |
| `pnpm --filter api test` | Testes unitários (Jest) |
| `pnpm --filter api lint` | Lint da API (oxlint) |
| `pnpm --filter web lint` / `pnpm --filter web build` | Lint (ESLint) / build do Web |

---

## 4. Regra de Prioridade

Em caso de conflito entre instruções ou regras, siga estritamente esta ordem de prioridade:

1. Requisitos explícitos do usuário.
2. Segurança e integridade dos dados.
3. Comportamento existente do sistema.
4. Regras deste `AGENTS.md`.
5. Padrões e convenções do framework.
6. Preferências arquiteturais.

---

## 5. Princípios Gerais & Arquitetura

* **Simplicidade:** Preferir soluções simples, explícitas, fáceis de entender, testar e manter.
* **Abstrações:** Evitar abstrações prematuras. Não criar *factories*, *adapters*, *repositories*, *interfaces*, *use cases* ou *providers* apenas para seguir um padrão. Crie abstrações apenas quando houver necessidade concreta.
* **Evolução Contínua:** A arquitetura deve evoluir conforme o projeto cresce. Evitar *overengineering*.
* **Objetivo Final:** O Comic Tracker deve permanecer simples, organizado, previsível, testável, manutenível e compreensível para humanos e IAs.

---

## 6. Fluxo de Trabalho do Agente de IA

### Antes de modificar qualquer código:
1. Entender a estrutura existente e analisar o código.
2. Localizar arquivos relacionados e procurar implementações semelhantes.
3. Consultar a documentação relevante.
4. Verificar dependências e identificar impactos.
5. Implementar a **menor solução adequada**.

### Diretrizes de Comportamento:
* A IA deve trabalhar sobre a arquitetura e o código existentes, e **não** assumir que deve recriar ou reorganizar o projeto.
* **Não inventar requisitos de negócio.** Se uma decisão alterar significativamente o comportamento do produto, **pergunte ao usuário**.
* **Não modificar arquivos sem necessidade** nem realizar refatorações não relacionadas à tarefa atual.
* Informar claramente o que foi alterado ao finalizar a tarefa.

---

## 7. Reutilização e Não Duplicação

Antes de criar código novo, procure por implementações reutilizáveis existentes.
Evite duplicar:
* Regras de negócio
* Chamadas HTTP
* Validações
* Componentes
* Tipos e interfaces
* Utilitários

---

## 8. Integridade do Código e Refatoração

* **Não apagar trabalho existente:** Nunca remova, substitua ou reescreva código sem entender sua finalidade. Verifique referências, uso, documentação e impacto antes. Em caso de dúvida, pergunte ao usuário.
* **Refatorações:** Não faça grandes refatorações junto com a entrega de uma funcionalidade. Se necessária, mantenha a refatoração com escopo mínimo, preserve o comportamento existente, teste e explique a necessidade.
* **Comandos Git:** Não execute comandos destrutivos que possam causar perda de trabalho (ex: `git reset --hard`, `git clean`) sem confirmação explícita do usuário. Não misture mudanças não relacionadas no mesmo fluxo.

---

## 9. Padrões de Código e TypeScript

* Utilizar TypeScript em **modo estrito**.
* **Proibido o uso de `any`:** Não utilize `any` para contornar erros de tipagem.
* Preferir:
  * Tipos explícitos
  * Generics
  * `unknown`
  * Type guards
  * Narrowing
* Não duplicar tipos que representam a mesma entidade.

---

## 10. Separação de Responsabilidades e Domínio

* **Separação Frontend/Backend:** Não mova regras de negócio importantes para o frontend apenas por conveniência.
* **Organização por Domínio:** Funcionalidades devem ser organizadas por domínio quando isso melhorar a organização (ex: `comics`, `sites`, `comic-sites`, `reading-progress`).
* Não crie todos os módulos ou diretórios antecipadamente; crie conforme a necessidade real.

---

## 11. Dependências

Antes de adicionar qualquer biblioteca externa:
1. Verifique se o projeto já possui uma solução.
2. Avalie se a funcionalidade pode ser implementada sem uma nova dependência.
3. Avalie o custo de manutenção, complexidade e compatibilidade.
4. Não substitua tecnologias existentes sem um motivo técnico claro.

---

## 12. Segurança e Credenciais

* **Nunca inclua no código:** senhas, tokens, API keys, credenciais ou secrets.
* Utilize sempre **variáveis de ambiente**.
* Nunca commit credenciais reais.
* Documente novas variáveis de ambiente no arquivo `.env.example` utilizando apenas valores fictícios ou explicativos.

---

## 13. Backend, Integrações Externas e Assincronismo

* **Integrações Externas:** O projeto não realiza scraping nem acesso automatizado aos sites de leitura. Caso existam integrações externas no futuro, isole-as: fontes externas podem alterar URLs, alterar APIs, bloquear requisições ou ficar indisponíveis, e o sistema deve tratar essas falhas de forma controlada.
* **Processamento Assíncrono:** Não execute tarefas pesadas (ex: processamento de grandes volumes de dados) durante uma requisição HTTP.
* Introduzir tecnologias como Redis e BullMQ apenas quando houver necessidade real (não adicionar antecipadamente).

---

## 14. Estado, Dados e Performance

* **Gerenciamento de Estado (Frontend):** Não utilize estado global automaticamente. Avalie primeiro: estado local, estado derivado, URL, estado do servidor ou contexto local.
* **Performance:** Não faça otimizações prematuras. Identifique o gargalo real, meça (se possível), corrija a causa e verifique o impacto.

---

## 15. Nomenclatura

Utilize nomes claros e expressivos que reflitam o domínio da aplicação.

* **EVITE nomes genéricos ou ambíguos:** `data`, `helper`, `manager`, `temp`, `utils2`, `test2`.
* **PREFIRA nomes declarativos:** `chapter-numbering`, `site-url`, `comic-search.service`, `reading-progress`.

---

## 16. Documentação e Testes

* **Decisões Arquiteturais:** Decisões importantes devem ser registradas em `docs/decisions/` contendo: contexto, problema, decisão, alternativas consideradas e consequências.
* **Testes:**
  * Testes devem validar comportamento real (foco em regras de negócio, casos de erro, transformações de dados e integrações críticas).
  * Não crie testes apenas para inflar a cobertura de código.

---

## 17. Validação Antes de Finalizar

Antes de considerar qualquer tarefa concluída, o agente **deve verificar obrigatoriamente**:
- [ ] Checagem de tipos com TypeScript (sem erros).
- [ ] Execução do Linter (quando aplicável).
- [ ] Execução dos testes relacionados.
- [ ] Remoção de arquivos temporários ou desnecessários.
- [ ] Ausência de credenciais/secrets no código.
- [ ] Atualização de documentação ou `.env.example`, se necessário.

> *Nota: Se alguma verificação acima não puder ser executada, informe o usuário explicitamente com o motivo.*
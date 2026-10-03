# 0001 — Remover a entidade Chapter e registrar apenas a última leitura

- **Status:** Aceito
- **Data:** 2026-09-30

## Contexto

O projeto deixou de fazer scraping de sites de quadrinhos. O usuário cadastra
quadrinhos e sites manualmente. O progresso de leitura será atualizado no
futuro por uma extensão de navegador que identifica site, quadrinho e capítulo
pela URL da página aberta.

O requisito de produto é guardar **apenas o último capítulo lido** por
quadrinho: não haverá contador de capítulos lidos, histórico de leitura ou
descoberta automática de capítulos pelo backend.

## Problema

A entidade `Chapter` pertencia ao mundo da descoberta automática: catálogo de
capítulos por `ComicSite`, com número único, data de publicação e URL por
site. Sem scraping e sem histórico, o único consumidor de `Chapter` era o
ponteiro `ReadingProgress.currentChapterId`.

Além disso, `currentChapterId` era uma coluna `String` **sem foreign key**,
com validação apenas na aplicação: podia apontar para capítulo inexistente
(órfão) e até para capítulo de outro quadrinho.

## Decisão

1. **Remover a entidade `Chapter`** (tabela, módulo `ChaptersModule` e endpoints `/chapters`).
2. **Guardar a última leitura direto em `ReadingProgress`:**
   - `currentChapterNumber` (`Decimal(10,3)?`) — último capítulo lido;
   - `currentChapterUrl` (`String?`) — URL do capítulo;
   - `comicSiteId` (`String?`, FK → `ComicSite`, `ON DELETE SET NULL`, única) —
     de qual site veio a última leitura;
   - `lastReadAt` (`DateTime?`) — quando ocorreu a última leitura.

   > **Atualização (2026-10-03):** `currentChapterUrl` passou para `ComicSite`
   > em [0002](0002-url-do-capitulo-por-vinculo.md) — a URL de capítulo é
   > específica do site e agora acompanha a troca do vínculo.
3. **Substituir `currentChapterId` por esses campos**, eliminando o apontador
   sem integridade referencial.
4. **Adicionar `PUT /reading-progress/:comicId`** (upsert idempotente): uma
   única requisição para a futura extensão criar ou atualizar o progresso.
   Implementado com o `upsert` nativo do Prisma (`INSERT ... ON CONFLICT`
   atômico), sem corrida entre chamadas simultâneas.
5. Validar no service que, quando informado, o `comicSiteId` **pertence ao
   quadrinho** recebido.

## Alternativas consideradas

| Alternativa | Resultado |
|---|---|
| **A) Manter `Chapter`** e corrigir a FK do ponteiro | Atendia ao requisito, mas a tabela existiria apenas como suporte do ponteiro — abraço sem necessidade. Exigiria endpoint de upsert de capítulo e 2 chamadas da extensão. |
| **B) Remover `Chapter`** (adotada) | Menos tabelas, menos endpoints, gravação em 1 chamada, "continuar lendo" sem join. |
| **C) Chapter canônico no `Comic` + URLs por site** | Correta para comparar o mesmo capítulo entre sites, mas complexidade antecipada sem requisito atual. |
| **D) Tabela de eventos/histórico (`ReadingEvent`)** | Fica para o futuro, se histórico vir a ser requisito — migração aditiva, sem retrabalho. |

## Consequências

- **Positivas:** esquema e API menores; extensão grava com uma requisição;
  dashboard "continuar lendo" lê `ReadingProgress` diretamente; eliminação do
  apontador órfão; 60 testes e um módulo inteiros removidos junto com o
  código morto.
- **Neutras/negativas:** não há histórico de capítulos lidos (requisito
  excluído — se voltar, será uma tabela nova, aditiva); a URL por site só é
  mantida para o último capítulo lido; múltiplos sites por quadrinho guardam
  apenas o site da última leitura. *(Em [0002](0002-url-do-capitulo-por-vinculo.md)
  a URL deixou o progresso e passou a ser guardada por vínculo.)*
- `ComicSite.isAvailable` e `ComicSite.lastCheckedAt`, legado da era de
  verificação de disponibilidade, foram **removidos** em 2026-09-30 (migration
  `remove_comic_site_availability_legacy`): a API aceitava os campos, mas nada
  no sistema os atualizava — dado morto que só enganava quem lesse o código.

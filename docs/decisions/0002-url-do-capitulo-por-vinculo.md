# 0002 — A URL do capítulo pertence ao vínculo (ComicSite)

- **Status:** Aceito
- **Data:** 2026-10-03
- **Relacionado:** [0001](0001-remover-chapter-apenas-ultima-leitura.md)

## Contexto

O ADR 0001 definiu que a última leitura fica em `ReadingProgress`:
`currentChapterNumber`, `currentChapterUrl`, `comicSiteId` e `lastReadAt`.

Na tela do quadrinho, "Site Provedor" e "URL do Capítulo Consultado" são
campos independentes: trocar o site não alterava a URL. Como o acervo abre
"Continuar lendo" em `currentChapterUrl ?? url da obra`, quem trocava o site
provedor continuava abrindo o capítulo no **domínio do site anterior**.

A URL de capítulo é específica do site (cada site tem seu padrão de rota),
mas estava gravada no progresso, que é único por quadrinho.

## Problema

`ReadingProgress` guarda uma URL por quadrinho, enquanto existem vários
vínculos (`ComicSite`) por quadrinho. A URL não acompanhava a troca do site
provedor e o sistema não lembrava qual capítulo foi lido em cada site.

## Decisão

1. **Mover `currentChapterUrl` de `ReadingProgress` para `ComicSite`**: cada
   vínculo guarda a última URL lida **naquele site**.
2. `ReadingProgress` mantém `currentChapterNumber`, `comicSiteId` (site da
   última leitura) e `lastReadAt` — o capítulo continua sendo um valor global
   por quadrinho (o número não depende do site).
3. O contrato de `PUT /reading-progress/:comicId` **não muda**: o campo
   `currentChapterUrl` continua sendo aceito, mas a API o grava no vínculo de
   destino. A futura extensão do navegador continua usando uma única
   requisição.
4. **Destino da URL**: o `comicSiteId` enviado ou — quando o PATCH não envia
   site — o site já apontado pelo progresso. Sem vínculo de destino:
   informar uma URL responde `400`; limpar (`null`) é ignorado (não existe
   vínculo alvo).
5. Progresso e vínculo são gravados **na mesma transação** quando há URL a
   salvar, para não divergirem.
6. Migração `20261003000000_move_current_chapter_url_to_comic_site` move a URL
   existente para o vínculo apontado por `comicSiteId`.

## Alternativas consideradas

| Alternativa | Resultado |
|---|---|
| **A) Mover para o vínculo** (adotada) | Trocar o site troca a URL que o acervo abre; cada site lembra seu capítulo. Exige migração e o campo passa a poder ficar defasado em relação ao capítulo global. |
| **B) Limpar a URL ao trocar de site** | Sem migração, mas não lembra a URL por site: obrigava a redigitar a cada troca. |
| **C) Manter como está + aviso** | Não resolve a URL do domínio errado no acervo. |
| **D) Guardar capítulo+URL por site (comparáveis entre sites)** | Equivaleria a restaurar entidades de capítulo (ADR 0001, alternativa C) — complexidade sem requisito atual. |

## Consequências

- **Positivas:** "Continuar lendo" e "Leituras recentes" abrem sempre o site
  selecionado; a tela do quadrinho mostra, por vínculo, a última URL lida;
  o formulário troca o valor do campo junto com o site, mostrando o que será
  salvo.
- **Neutras/negativas:** ao trocar de site, texto digitado e não salvo é
  substituído pela URL salva do novo vínculo; um vínculo pode guardar a URL de
  um capítulo antigo em relação ao global (ex.: leu no site A e voltou ao site
  B) — o campo exibe o valor antes de salvar, e é preferível a abrir o domínio
  errado.
- **Cascatas:** excluir um vínculo apaga a URL dele junto (`onDelete: Cascade`
  do `ComicSite`); o progresso mantém apenas o capítulo e o ponteiro de site
  (`ON DELETE SET NULL`, já existente).

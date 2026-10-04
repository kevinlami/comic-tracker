# 0003 — A URL vazia do acervo (`/`) abre a visão padrão

- **Status:** Aceito
- **Data:** 2026-10-04
- **Relacionado:** [0002](0002-url-do-capitulo-por-vinculo.md)

## Contexto

No acervo (rota `/`), busca, filtros e ordenação vivem na URL
(`?search=`, `?status=`, `?order=`, `?rating=`, `?site=`, `?siteStatus=`,
`?inactive=`), então a lista é compartilhável e sobrevive ao reload.

A decisão de produto foi abrir o acervo já com uma visão padrão — nota
`5`, em leitura (`READING`), parado há `1w` e sites ativos — em vez de
mostrar a lista inteira. Os filtros padrão são aplicados no frontend:
a API continua recebendo parâmetros explícitos e não muda.

Existem, porém, dois estados a distinguir: a **visão padrão** (com os
filtros aplicados) e o acervo **sem filtro algum** — o que o "Limpar"
deve mostrar.

## Problema

Se "sem filtros" e "visão padrão" fossem a mesma URL (`/`), o "Limpar
filtros" voltaria para a visão padrão em vez de mostrar tudo; e, quando
a visão padrão não tem resultados, o próprio botão de limpar devolveria
a mesma tela vazia, sem saída.

Aplicar os filtros padrão **só nos parâmetros ausentes** (param a param)
também não resolve: remover um filtro individualmente o apaga da URL e o
próximo render o repreenche com o padrão — o filtro ficaria impossível de
limpar — e uma URL parcial compartilhada (`?site=x`) receberia filtros
extras, deixando de reproduzir a tela de quem a enviou.

## Decisão

1. **Fonte única dos padrões**: `DASHBOARD_DEFAULT_QUERY` em
   `apps/web/lib/dashboard-url.ts`
   (`status=READING`, `rating=5`, `siteStatus=active`, `inactive=1w`).
2. **Regra**: *URL sem nenhum parâmetro = visão padrão; URL com
   parâmetros = valores literais.* `DashboardPage` aguarda `searchParams`
   antes de renderizar o `Suspense` e, se a URL não tem parâmetro algum,
   faz `redirect(buildDashboardHref(DASHBOARD_DEFAULT_QUERY))`. O
   redirect **materializa** os filtros na URL (o endereço passa a refletir
   a tela, seguindo a regra de filtros vivem na URL) e acontece antes de
   qualquer `fetch`, sem depender de redirect durante o streaming.
3. **`buildDashboardHref({})` nunca devolve `/`**: sem filtro algum, a
   função grava os parâmetros que têm padrão explicitamente vazios
   (`/?status=&rating=&siteStatus=&inactive=`) — a "URL sem filtros". Os
   parâmetros vazios já significam "sem filtro" para a API, e a URL
   continua não vazia, portanto não recai na regra da visão padrão.
4. **Saídas da visão padrão**: "Limpar" (ExtraFilters), "Limpar filtros"
   do estado vazio e "Limpar filtros" do erro 400 usam
   `buildDashboardHref({})`. Os links internos para `/` (logo, "Ir para
   o Acervo", "Voltar") seguem abrindo a visão padrão. `SearchBar` não
   muda: ele preserva os parâmetros que já estão na URL, que é sempre o
   estado real.
5. **Métricas, contagem e "Retomar leitura"** derivam da lista já
   filtrada — sem requisição extra.

## Alternativas consideradas

| Alternativa | Resultado |
|---|---|
| **A) Redirect na URL vazia + "sem filtros" explícito** (adotada) | Regra única e literal: só a URL vazia tem significado especial. Custo: um salto de redirect a cada visita a `/` e quatro parâmetros no endereço. |
| **B) Preencher só os parâmetros ausentes** | Um filtro removido voltaria na hora (sem como distinção entre "ausente" e "limpo"); URLs parciais ganhariam filtros extras e deixariam de reproduzir a tela. |
| **C) Aplicar os padrões sem mudar a URL** | O endereço não mostraria o estado real e a `SearchBar` (que lê `window.location.search`) apagaria os quatro filtros no primeiro caractere digitado. |
| **D) Marcador `?all=1` para "sem filtros"`** | Valor mágico a documentar e a ignorar no servidor; os parâmetros vazios já expressam o mesmo com os nomes existentes. |

## Consequências

- **Positivas:** abrir o acervo mostra de cara o que importa; a URL
  sempre reflete os filtros aplicados (compartilhável e reproduzível);
  "Limpar" é uma saída real, inclusive quando a visão padrão não tem
  resultados.
- **Neutras/negativas:** toda visita a `/` dá um salto de redirect e o
  endereço da visão padrão carrega quatro parâmetros; ver o acervo inteiro
  agora passa por "Limpar" em vez de pelo link direto.
- **Cascatas:** a regra vale para qualquer URL sem parâmetro, não só
  `/`; `buildDashboardHref` não produz mais a rota raiz — um link novo
  que queira a visão padrão deve continuar usando `href="/"`; adicionar
  um filtro padrão novo significa acrescentar uma chave a
  `DASHBOARD_DEFAULT_QUERY` (a "URL sem filtros" acompanha automaticamente).

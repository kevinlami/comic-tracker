# Comic Tracker Web — AI Development Guidelines

## 1. Visão geral

Este diretório contém o frontend do Comic Tracker.

Tecnologias principais:

- Next.js
- React
- TypeScript
- Tailwind CSS

O frontend é responsável por:

- interface do usuário;
- navegação;
- interação;
- apresentação dos dados;
- gerenciamento de estado da interface;
- comunicação com a API;
- experiência do usuário.

As regras deste arquivo complementam as regras do `AGENTS.md` da raiz
do projeto.

As regras da raiz continuam sendo aplicáveis.

---

## 2. Estrutura

A estrutura atual do frontend deve ser respeitada.

Estruturas adicionais devem ser criadas somente quando houver
necessidade real.

Estrutura esperada:

```text
apps/web/
├── app/             # App Router, páginas e Server Actions (actions.ts)
├── components/      # Componentes organizados por domínio (dashboard/, comic-detail/, comic-form/, sites/, rating/)
├── lib/             # Configurações e utilitários técnicos (dashboard-url, form-action, rating, datas)
├── services/        # Comunicação com a API (api-client + services por domínio)
├── types/           # Tipos compartilhados do frontend
└── public/          # Arquivos estáticos
```

A estrutura acima é a organização atual do projeto.
Ela não deve ser criada completamente de forma antecipada.

Criar diretórios somente quando forem necessários.

## 3. Next.js

O projeto utiliza o App Router do Next.js.

Preferir os recursos nativos do Next.js antes de adicionar soluções
externas.

Utilizar Server Components por padrão quando não houver necessidade
de interatividade no cliente.

Utilizar Client Components somente quando necessário, por exemplo
quando houver:

- `useState`;
- `useEffect`;
- eventos de interação;
- APIs específicas do navegador;
- hooks que dependem do cliente;
- bibliotecas que exigem execução no browser.

Não adicionar `"use client"` indiscriminadamente.

Manter o maior número possível de componentes como Server Components
quando isso fizer sentido para a funcionalidade.

---

## 4. React

Utilizar React de forma idiomática.

Preferir:

- componentes pequenos;
- composição;
- props explícitas;
- hooks apropriados;
- estado local quando suficiente.

Evitar componentes gigantes que concentrem:

- apresentação;
- chamadas de API;
- regras de negócio;
- transformação de dados;
- gerenciamento de múltiplos estados;
- navegação.

Quando um componente crescer excessivamente, avaliar uma separação
por responsabilidade.

Não dividir componentes apenas por quantidade de linhas.

---

## 5. Componentes

Componentes devem ter responsabilidades claras.

Antes de criar um novo componente:

1. procurar componentes existentes;
2. verificar se algum pode ser reutilizado;
3. verificar componentes semelhantes;
4. avaliar se a diferença pode ser resolvida através de props.

Evitar duplicação de componentes visualmente semelhantes.

Componentes genéricos devem ser realmente genéricos.

Não transformar componentes específicos em abstrações genéricas
apenas por antecipação.

---

## 6. Organização por funcionalidade

O padrão atual do projeto organiza funcionalidades em `components/<domínio>/`:

```text
components/
├── dashboard/
├── comic-detail/
├── comic-form/
├── sites/
└── rating/
```

Componentes do mesmo domínio ficam juntos nesses diretórios.

Não criar essas estruturas automaticamente para todas as features.

Para funcionalidades pequenas, uma estrutura mais simples pode ser
preferível.

Criar `features/`, `hooks/` ou outra estrutura nova somente quando
houver necessidade real.

---

## 7. Estado

Não utilizar gerenciamento global de estado automaticamente.

Antes de criar estado global, avaliar se o problema pode ser resolvido
com:

- `useState`;
- `useReducer`;
- props;
- estado derivado;
- URL/search params;
- contexto local;
- estado do servidor.

Estado global deve ser utilizado somente quando existir uma necessidade
real de compartilhamento entre partes independentes da aplicação.

Não criar Redux, Zustand ou outra solução global apenas por padrão.

---

## 8. URL e filtros

Quando um estado representar algo que deve ser:

- compartilhável;
- persistido ao recarregar a página;
- utilizado em navegação;
- reproduzível;

avaliar a utilização de URL/search params.

Exemplos:

- `/comics?search=one-piece`
- `/comics?status=reading`
- `/sites?active=true`

Não duplicar desnecessariamente o mesmo estado na URL e em um estado
global.

---

## 9. Comunicação com a API

A comunicação com o backend deve ser centralizada quando isso
melhorar a organização.

Evitar espalhar chamadas HTTP diretamente por diversos componentes.

Preferir uma camada de serviço quando houver múltiplas chamadas
ou regras relacionadas.

Exemplo de organização:

`services/comics.service.ts`

`services/reading-progress.service.ts`

`services/sites.service.ts`

Os componentes devem se preocupar principalmente com apresentação
e interação, e não com detalhes de implementação das requisições.

---

### 9.1 Escritas: Server Actions

Criar, editar e excluir registros é feito através de **Server Actions**
em arquivos `app/*/actions.ts` (com `"use server"`).

Padrão a seguir:

1. validar o formulário na action, gerando mensagens amigáveis em pt-BR
   (ver `lib/form-action.ts` e `services/comics.service.ts`);
2. chamar o service do domínio (`services/*.service.ts`);
3. em caso de erro, retornar `{ ok: false, message }` para o formulário
   exibir a mensagem (também tratar `ApiError`);
4. em caso de sucesso, chamar `revalidatePath` nas rotas afetadas e
   `redirect` para o destino (ou `revalidatePath` quando permanecer
   na mesma rota).

Não chamar a API diretamente a partir de componentes do cliente:
Componentes devem disparar as actions de formulário, não montar
requisições próprias.

---

## 10. Tratamento de requisições

Requisições devem considerar:

- loading;
- sucesso;
- erro;
- ausência de dados;
- cancelamento quando apropriado.

Não assumir que uma requisição sempre terá sucesso.

Mensagens de erro exibidas ao usuário devem ser compreensíveis.

Não exibir stack traces, erros internos ou informações sensíveis
na interface.

---

## 11. Requisições concorrentes

Quando uma nova requisição tornar uma anterior desnecessária,
considerar seu cancelamento.

Casos comuns:

- busca enquanto o usuário digita;
- filtros;
- autocomplete;
- mudança rápida de página;
- navegação entre registros.

Quando apropriado, utilizar `AbortController`.

Evitar respostas antigas sobrescrevendo dados mais recentes.

---

## 12. Performance

Não realizar otimizações prematuras.

Quando houver problema real de performance:

1. identificar o gargalo;
2. medir quando possível;
3. corrigir a causa;
4. verificar o resultado.

Considerar quando apropriado:

- lazy loading;
- code splitting;
- carregamento sob demanda;
- paginação;
- virtualização;
- memoização;
- cache;
- redução de requisições;
- Server Components.

Não utilizar `useMemo`, `useCallback` ou `React.memo` automaticamente.

Essas ferramentas devem ser utilizadas quando houver uma razão
técnica clara.

---

## 13. Renderização e dados

Evitar buscar dados no cliente quando o problema puder ser resolvido
de forma mais simples através de Server Components ou recursos
nativos do Next.js.

Ao escolher entre Server Component e Client Component, considerar:

- interatividade necessária;
- origem dos dados;
- frequência de atualização;
- experiência de carregamento;
- custo de JavaScript enviado ao navegador.

Não transformar uma página inteira em Client Component apenas porque
um pequeno componente precisa de interatividade.

---

## 14. Formulários

Formulários devem possuir:

- validação adequada;
- feedback de erro;
- estado de carregamento;
- prevenção de múltiplos envios quando necessário;
- acessibilidade adequada.

Não confiar somente na validação do frontend.

Validações importantes também devem existir no backend.

---

## 15. UI e Tailwind CSS

Utilizar Tailwind CSS conforme os padrões existentes no projeto.

Evitar estilos inline quando Tailwind ou estilos existentes forem
suficientes.

Evitar criar classes ou abstrações de estilo sem necessidade.

Priorizar:

- consistência visual;
- reutilização;
- responsividade;
- acessibilidade.

Não introduzir outra biblioteca de UI sem necessidade real.

---

## 16. Responsividade

A interface deve funcionar adequadamente em:

- desktop;
- tablet;
- mobile.

Não criar layouts pensando somente em desktop.

Ao implementar uma nova tela, considerar:

- largura reduzida;
- navegação;
- tabelas;
- listas;
- formulários;
- modais;
- botões;
- textos longos.

---

## 17. Acessibilidade

Componentes interativos devem ser acessíveis.

Preferir elementos HTML semânticos:

- `button`;
- `a`;
- `nav`;
- `main`;
- `header`;
- `section`;
- `form`;
- `label`.

Evitar utilizar `div` como substituto de elementos interativos
quando um elemento semântico apropriado existir.

Imagens devem possuir `alt` apropriado quando necessário.

Formulários devem possuir labels associados aos campos.

Não depender somente de cor para transmitir informação.

---

## 18. Tipagem

Utilizar TypeScript em modo estrito.

Proibido o uso de `any` para contornar erros de tipagem.

Preferir:

- tipos explícitos;
- `unknown`;
- type guards;
- narrowing;
- generics quando apropriado.

Não duplicar tipos que representam a mesma entidade.

Tipos compartilhados do frontend devem ficar em `types/` quando
houver necessidade real de compartilhamento.

---

## 19. Objetivo final

O frontend deve permanecer:

- simples;
- rápido;
- acessível;
- responsivo;
- previsível;
- tipado;
- fácil de manter.

Priorizar soluções idiomáticas de React e Next.js.

Não adicionar complexidade arquitetural sem necessidade real.

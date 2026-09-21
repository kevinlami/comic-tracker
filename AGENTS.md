# AGENTS.md

## 1. Visão geral do projeto

Este é o **Comic Tracker**, uma aplicação web para organizar e acompanhar a leitura de
mangás, manhwas, manhuas, webtoons, comics e outros tipos de quadrinhos.

O sistema tem como objetivo permitir que o usuário:

- cadastre e acompanhe obras que está lendo;
- registre o capítulo atual;
- mantenha links para diferentes sites de leitura;
- identifique quando um site de leitura está indisponível;
- detecte novos capítulos;
- acompanhe o histórico de leitura;
- centralize informações de diferentes fontes;
- futuramente automatize verificações periódicas de disponibilidade e novos capítulos.

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
* **Tecnologias Principais:** Next.js, React, TypeScript, Tailwind CSS.
* **Responsabilidades:**
  * Interface do usuário
  * Navegação
  * Estado da interface
  * Comunicação com a API
  * Componentes visuais
  * Experiência do usuário (UX)

### `apps/api`
* **Descrição:** Backend da aplicação.
* **Tecnologias Principais:** NestJS, TypeScript, Jest.
* **Responsabilidades:**
  * Regras de negócio
  * Persistência de dados
  * APIs
  * Integrações externas
  * Processamento
  * Tarefas assíncronas e Jobs

### `packages`
* Contém código que realmente precisa ser compartilhado entre diferentes aplicações.
* **Regra:** Não criar packages sem necessidade real de compartilhamento.

### `docs`
* Contém documentação de arquitetura, funcionalidades e decisões importantes do projeto.

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
* **Organização por Domínio:** Funcionalidades devem ser organizadas por domínio quando isso melhorar a organização (ex: `comics`, `chapters`, `reading`, `sites`).
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

* **Integrações Externas:** Isolar integrações com sites externos. Fontes externas podem alterar URLs, alterar APIs, bloquear requisições ou ficar indisponíveis. O sistema deve tratar essas falhas de forma controlada.
* **Processamento Assíncrono:** Não execute tarefas pesadas (ex: verificar novos capítulos, sincronizar fontes) durante uma requisição HTTP.
* Introduzir tecnologias como Redis e BullMQ apenas quando houver necessidade real (não adicionar antecipadamente).

---

## 14. Estado, Dados e Performance

* **Gerenciamento de Estado (Frontend):** Não utilize estado global automaticamente. Avalie primeiro: estado local, estado derivado, URL, estado do servidor ou contexto local.
* **Performance:** Não faça otimizações prematuras. Identifique o gargalo real, meça (se possível), corrija a causa e verifique o impacto.

---

## 15. Nomenclatura

Utilize nomes claros e expressivos que reflitam o domínio da aplicação.

* **EVITE nomes genéricos ou ambíguos:** `data`, `helper`, `manager`, `temp`, `utils2`, `test2`.
* **PREFIRA nomes declarativos:** `chapter-parser`, `site-availability.service`, `comic-search.service`, `reading-progress`.

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
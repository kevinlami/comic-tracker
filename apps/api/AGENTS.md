# Comic Tracker API — AI Development Guidelines

## 1. Visão geral

Este diretório contém o backend/API do Comic Tracker.

Tecnologias principais:

- NestJS;
- TypeScript;
- Jest.

A API é responsável por:

- regras de negócio;
- persistência de dados;
- APIs HTTP;
- validação;
- integrações externas;
- processamento;
- tarefas assíncronas;
- autenticação e autorização quando implementadas.

As regras deste arquivo complementam as regras do `AGENTS.md` da raiz
do projeto.

As regras da raiz continuam sendo aplicáveis.

---

## 2. Estrutura

O backend utiliza a arquitetura modular do NestJS.

A estrutura deve evoluir conforme as funcionalidades forem criadas.

Uma possível organização é:

`src/modules/comics/`

`src/modules/chapters/`

`src/modules/reading/`

`src/modules/sites/`

`src/common/`

`src/config/`

Não criar todos esses módulos ou diretórios antecipadamente.

Criar estruturas somente quando existir uma necessidade real.

---

## 3. NestJS

Utilizar os recursos nativos do NestJS sempre que forem suficientes.

Preferir:

- Modules;
- Controllers;
- Services;
- Guards;
- Pipes;
- Interceptors;
- Filters;
- Dependency Injection.

Não criar abstrações adicionais apenas para seguir padrões
arquiteturais.

---

## 4. Modules

Organizar funcionalidades maiores em módulos de domínio.

Exemplos:

- `ComicsModule`;
- `ChaptersModule`;
- `ReadingModule`;
- `SitesModule`.

Um módulo deve agrupar funcionalidades relacionadas.

Evitar criar módulos excessivamente pequenos sem uma necessidade
clara.

Evitar um módulo gigante contendo funcionalidades de vários domínios.

---

## 5. Controllers

Controllers devem ser responsáveis principalmente por:

- receber requisições;
- validar parâmetros através dos mecanismos apropriados;
- chamar serviços;
- retornar respostas.

Evitar colocar regras de negócio complexas diretamente em controllers.

Exemplo conceitual:

Controller:

`GET /comics/:id`

↓

Service:

buscar e processar o comic

↓

Controller:

retornar resposta

Controllers devem permanecer simples.

---

## 6. Services

Services devem concentrar lógica relacionada ao domínio quando
essa lógica precisar ser reutilizada ou estiver relacionada ao
processamento da funcionalidade.

Evitar services gigantes que concentrem responsabilidades de
múltiplos domínios.

Quando um service crescer excessivamente, avaliar a separação
por responsabilidade.

Não dividir services artificialmente apenas pelo tamanho do arquivo.

---

## 7. Regras de negócio

Regras de negócio importantes devem permanecer no backend.

O frontend não deve ser considerado uma camada confiável para
aplicar regras de negócio.

O backend deve validar:

- regras de negócio;
- permissões;
- consistência dos dados;
- valores recebidos;
- operações permitidas.

Nunca confiar exclusivamente em validações realizadas pelo frontend.

---

## 8. Controllers e regras de negócio

Não colocar lógica complexa diretamente no controller.

Evitar controllers contendo:

- consultas complexas;
- regras de negócio;
- transformações extensas;
- integração com múltiplos serviços;
- processamento complexo.

Quando uma operação possuir lógica significativa, essa lógica deve
ser delegada para um service ou outra abstração apropriada.

---

## 9. DTOs

Utilizar DTOs para representar dados recebidos pelas APIs quando
isso melhorar validação, tipagem e clareza.

Exemplo:

```ts
export class CreateComicDto {
  title: string;
  url: string;
}
```

DTOs devem representar dados de entrada da API.

Não reutilizar automaticamente entidades ou modelos de persistência
como DTOs.

Separar responsabilidades quando necessário.

---

## 10. Validação

Dados recebidos pela API devem ser validados no backend.

Considerar:

- tipos;
- campos obrigatórios;
- formatos;
- limites;
- valores permitidos;
- regras de negócio.

Não confiar nos dados enviados pelo cliente.

Quando apropriado, utilizar os mecanismos de validação do NestJS.

---

## 11. Respostas da API

As respostas devem possuir formatos consistentes.

Evitar retornar estruturas diferentes para situações equivalentes.

Erros devem possuir informações suficientes para o frontend tratar
o problema corretamente.

Não retornar informações internas desnecessárias.

Não retornar:

- stack traces;
- credenciais;
- tokens secretos;
- informações internas de infraestrutura.

---

## 12. Tratamento de erros

Erros esperados devem ser tratados de forma controlada.

Utilizar os mecanismos de exceção do NestJS quando apropriado.

Diferenciar:

- erros de validação;
- recursos inexistentes;
- operações não permitidas;
- erros de autenticação;
- erros de autorização;
- falhas de serviços externos;
- erros internos.

Não esconder erros inesperados silenciosamente.

Logs devem ajudar na investigação sem expor informações sensíveis.

---

## 13. HTTP Status Codes

Utilizar códigos HTTP apropriados.

Exemplos:

- 200 para operações bem-sucedidas;
- 201 para criação;
- 204 quando não houver conteúdo a retornar;
- 400 para requisições inválidas;
- 401 para ausência ou invalidade de autenticação;
- 403 para operação não autorizada;
- 404 para recurso inexistente;
- 409 para conflitos;
- 500 para erros internos inesperados.

Não utilizar sempre 200 para representar qualquer resultado.

---

## 14. Persistência

A camada de persistência deve ser separada das regras de apresentação
da API.

Controllers não devem acessar diretamente o banco de dados.

Acesso a dados deve ficar em uma camada apropriada.

Não introduzir Repository Pattern, Unit of Work ou outras abstrações
sem necessidade real.

A arquitetura deve acompanhar a complexidade real do projeto.

---

## 15. Banco de dados

Operações de banco devem considerar:

- consistência;
- integridade;
- índices;
- relacionamentos;
- concorrência;
- performance;
- tratamento de erros.

Não executar consultas desnecessariamente pesadas.

Evitar buscar dados que não serão utilizados.

Quando houver grandes volumes de dados, considerar:

- paginação;
- filtros;
- ordenação;
- índices;
- consultas específicas.

---

## 16. Paginação

Endpoints que possam retornar grandes quantidades de dados devem
considerar paginação.

Evitar retornar grandes coleções sem limite.

Exemplo:

`GET /comics?page=1&limit=20`

Quando apropriado, a API deve retornar informações suficientes para
o frontend controlar a paginação.

---

## 17. Integrações externas

Integrações com sites de leitura devem ser tratadas como fontes
externas não confiáveis.

Um site pode:

- ficar indisponível;
- alterar sua estrutura;
- alterar URLs;
- alterar respostas;
- bloquear requisições;
- retornar dados inválidos;
- apresentar timeout.

O backend deve tratar essas situações de forma controlada.

Não assumir que uma integração externa sempre estará disponível.

---

## 18. Integrações com sites

Quando a complexidade justificar, manter a lógica específica de
cada site isolada.

Evitar espalhar verificações específicas de um site por vários
módulos da aplicação.

Exemplo conceitual:

Site A

↓

parser específico

↓

dados normalizados

A aplicação deve trabalhar preferencialmente com um formato interno
consistente.

Não permitir que detalhes específicos de um site contaminem todo
o domínio da aplicação.

---

## 19. Timeouts

Chamadas para serviços externos devem possuir limites de tempo
quando apropriado.

Nunca permitir que uma integração externa indisponível mantenha
uma requisição da API aguardando indefinidamente.

Falhas externas devem ser tratadas de maneira previsível.

---

## 20. Retry

Não repetir automaticamente todas as requisições que falharem.

Retries devem ser utilizados somente quando fizerem sentido para
o tipo de erro.

Considerar especialmente:

- timeout;
- falhas temporárias;
- indisponibilidade momentânea.

Evitar retries para erros definitivos, como:

- dados inválidos;
- autenticação inválida;
- recurso inexistente.

---

## 21. Processamento assíncrono

Tarefas demoradas ou periódicas não devem bloquear requisições HTTP
quando puderem ser executadas em background.

Possíveis tarefas:

- verificar novos capítulos;
- verificar disponibilidade de sites;
- atualizar informações;
- sincronizar fontes;
- processar grandes volumes de dados.

Redis e BullMQ podem ser utilizados quando existir necessidade real.

Não adicionar Redis ou BullMQ antecipadamente apenas porque o projeto
poderá utilizá-los no futuro.

---

## 22. Jobs

Quando jobs forem implementados, eles devem possuir:

- responsabilidade clara;
- tratamento de erros;
- logs apropriados;
- controle de tentativas;
- comportamento previsível;
- idempotência quando possível.

Um job que seja executado duas vezes não deve causar inconsistências
quando isso puder ser evitado.

---

## 23. Concorrência

Considerar concorrência em operações que possam ser executadas
simultaneamente.

Exemplos:

- atualização do progresso de leitura;
- sincronização de capítulos;
- atualização de informações;
- jobs executados em paralelo.

Não assumir que apenas uma execução ocorrerá por vez.

---

## 24. Cache

Não adicionar cache automaticamente.

Antes de utilizar cache:

- identificar o problema;
- verificar se existe gargalo real;
- determinar o que pode ser armazenado;
- definir validade;
- definir estratégia de invalidação.

Cache incorreto pode produzir dados desatualizados.

A simplicidade deve ser priorizada quando cache não for necessário.

---

## 25. Configuração

Configurações devem utilizar variáveis de ambiente quando forem
dependentes do ambiente.

Exemplos:

- URL do banco;
- URL de serviços externos;
- credenciais;
- portas;
- configurações de jobs;
- chaves secretas.

Nunca colocar secrets diretamente no código.

---

## 26. Secrets

Nunca colocar no código:

- senhas;
- tokens;
- API keys;
- credenciais;
- chaves privadas.

Não commitar arquivos contendo secrets reais.

Quando necessário, atualizar o `.env.example` com os nomes das
variáveis, mas nunca com valores secretos reais.

---

## 27. Autenticação e autorização

Autenticação e autorização são responsabilidades do backend.

Nunca confiar em informações fornecidas pelo frontend para decidir
se uma operação pode ser executada.

Quando autenticação for implementada:

- validar credenciais no backend;
- validar tokens no backend;
- verificar permissões no backend;
- proteger endpoints adequadamente.

Não considerar esconder um botão no frontend como mecanismo de
segurança.

---

## 28. Segurança

Considerar segurança desde o início da implementação.

Verificar especialmente:

- validação de entrada;
- autenticação;
- autorização;
- exposição de dados;
- injeção;
- SSRF;
- rate limiting quando necessário;
- secrets;
- logs.

Não confiar em dados recebidos de usuários ou serviços externos.

---

## 29. Logs

Logs devem ser úteis para diagnosticar problemas.

Evitar logs excessivos.

Nunca registrar informações sensíveis como:

- senhas;
- tokens;
- API keys;
- credenciais;
- dados pessoais desnecessários.

Logs de integrações externas devem ajudar a identificar:

- qual operação falhou;
- qual fonte estava sendo consultada;
- tipo do erro;
- contexto suficiente para investigação.

---

## 30. Testes

Testes devem validar comportamento real.

Priorizar testes para:

- regras de negócio;
- services;
- controllers importantes;
- validações;
- integrações críticas;
- tratamento de erros;
- parsers;
- processamento de capítulos;
- jobs.

Não criar testes artificiais apenas para aumentar cobertura.

---

## 31. Testes de integrações externas

Integrações externas não devem depender exclusivamente de serviços
reais durante os testes automatizados.

Quando apropriado:

- mockar respostas;
- utilizar fixtures;
- testar diferentes respostas;
- testar timeout;
- testar erros;
- testar dados inválidos.

Os testes devem verificar como a aplicação reage às diferentes
situações da integração.

---

## 32. Banco de dados nos testes

Testes não devem depender de dados reais de produção.

Utilizar ambientes de teste apropriados.

Não executar testes destrutivos contra bancos reais.

Quando necessário, utilizar:

- banco de teste;
- dados temporários;
- mocks;
- fixtures.

---

## 33. Performance

Não realizar otimizações prematuras.

Quando existir um problema de performance:

- identificar o gargalo;
- medir quando possível;
- corrigir a causa;
- verificar o resultado.

Considerar:

- consultas ao banco;
- quantidade de dados retornados;
- chamadas externas;
- processamento;
- jobs;
- concorrência.

Não adicionar cache, filas ou infraestrutura adicional sem uma
necessidade comprovada.

---

## 34. API pública

Endpoints devem possuir contratos claros.

Considerar:

- método HTTP;
- URL;
- parâmetros;
- body;
- resposta;
- códigos de erro;
- validações.

Alterações incompatíveis na API devem ser avaliadas antes de serem
implementadas.

Não alterar silenciosamente o formato de respostas utilizadas pelo
frontend.

---

## 35. Compatibilidade com o frontend

Quando alterar um endpoint:

- procurar seus consumidores;
- verificar o frontend;
- verificar outros módulos;
- atualizar tipos e contratos relacionados;
- testar o fluxo completo.

Não assumir que uma alteração na API afeta apenas o backend.

---

## 36. Dependências

Antes de adicionar uma dependência:

- verificar se o NestJS já possui uma solução;
- verificar se o projeto já possui uma solução;
- avaliar manutenção;
- avaliar tamanho e impacto;
- verificar compatibilidade.

Não adicionar bibliotecas apenas por conveniência.

---

## 37. Refatorações

Não realizar grandes refatorações junto com funcionalidades sem
necessidade.

Se uma refatoração for necessária:

- manter o escopo mínimo;
- preservar comportamento;
- testar a alteração;
- explicar a necessidade quando relevante.

Não reestruturar todo o backend apenas porque uma pequena alteração
foi solicitada.

---

## 38. Arquitetura

Não aplicar automaticamente:

- Clean Architecture;
- Hexagonal Architecture;
- DDD;
- CQRS;
- Event Sourcing;
- Repository Pattern;
- Unit of Work;
- Microservices.

Esses padrões podem ser utilizados quando houver uma necessidade
concreta que justifique sua complexidade.

O projeto deve começar simples e evoluir conforme suas necessidades.

---

## 39. Antes de criar uma nova abstração

Perguntar:

- Existe código semelhante?
- Existe um service que pode ser reutilizado?
- Essa abstração será utilizada mais de uma vez?
- Ela reduz complexidade?
- Ela melhora a separação de responsabilidades?
- Ela realmente resolve um problema existente?

Se não houver uma necessidade clara, preferir uma implementação
simples.

---

## 40. Antes de finalizar uma tarefa

Verificar:

- TypeScript;
- lint;
- testes relacionados;
- tratamento de erros;
- validações;
- logs;
- queries;
- chamadas externas;
- possíveis problemas de concorrência;
- secrets;
- variáveis de ambiente;
- impacto no frontend;
- arquivos não utilizados.

Se alguma verificação não puder ser executada, informar isso
explicitamente.

---

## 41. Regra principal

A API deve permanecer:

- simples;
- segura;
- previsível;
- testável;
- tipada;
- modular;
- fácil de manter.

Priorizar soluções idiomáticas de NestJS e TypeScript.

Não adicionar complexidade arquitetural ou infraestrutura sem
necessidade real.

# FLUX — DEPLOYMENT AND ENVIRONMENT ARCHITECTURE

## 1. Objetivo

Definir como o FLUX roda localmente, em preview e em produção sem misturar configuração de desenvolvimento com credenciais ou infraestrutura real.

## 2. Ambientes

```text
LOCAL
  desenvolvimento individual

PREVIEW
  validação de branch / pull request

STAGING
  ambiente próximo de produção para integração

PRODUCTION
  ambiente público
```

Cada ambiente possui configuração própria e nunca deve reutilizar secrets de outro ambiente.

## 3. Runtime inicial

A aplicação web usa:

- Next.js + React + TypeScript
- Node.js
- PostgreSQL como persistência principal
- object storage + CDN para mídia
- adapter realtime compatível com WebSocket

Redis, filas e serviços especializados somente entram quando houver requisito mensurável.

## 4. Configuração

Toda variável de ambiente deve possuir:

```text
nome
finalidade
ambiente
obrigatoriedade
valor seguro de exemplo
classificação secret/non-secret
```

Nenhum secret deve existir no código, documentação de exemplo ou bundle do cliente.

## 5. Fluxo de deploy

```text
commit
→ lint
→ typecheck
→ unit/component tests
→ integration tests
→ build
→ artifact
→ preview/staging
→ smoke tests
→ production
```

Uma etapa falha significa que o deploy não deve avançar automaticamente.

## 6. Banco

Migrations são versionadas no repositório.

Nunca depender de alterações manuais no banco para que uma release funcione.

```text
migration N
→ validation
→ migration N+1
```

Alterações destrutivas exigem estratégia de compatibilidade e rollback.

## 7. Media

Bytes grandes não passam pelo fluxo normal do banco.

```text
cliente
→ upload controlado
→ object storage
→ processamento
→ validação
→ publicação
→ CDN
```

PostgreSQL armazena metadados, propriedade, relações e estado do processamento.

## 8. Health checks

Serviços devem expor verificações equivalentes a:

```text
liveness
readiness
startup
```

Health checks não devem revelar secrets ou dados internos sensíveis.

## 9. Rollback

Toda release deve permitir retornar à última versão conhecida como saudável.

Aplicações e migrations devem ser desenhadas para que rollback de aplicação não quebre imediatamente dados persistidos compatíveis.

## 10. Regra operacional

A infraestrutura deve crescer conforme a necessidade real do FLUX, evitando complexidade distribuída prematura.

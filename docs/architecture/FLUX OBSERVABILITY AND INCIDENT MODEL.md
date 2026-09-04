# FLUX — OBSERVABILITY AND INCIDENT MODEL

## Objetivo

Permitir descobrir, diagnosticar e explicar falhas sem depender de logs improvisados.

## Sinais principais

```text
Logs
Metrics
Traces
Events
```

## Structured logs

Logs de aplicação devem possuir contexto estruturado, por exemplo:

```text
timestamp
level
service
environment
requestId
userId (quando apropriado)
operation
result
errorCode
latency
```

Segredos, tokens e conteúdo privado não devem ser registrados.

## Métricas iniciais

```text
request latency
request error rate
API throughput
database latency
job failures
upload failures
realtime connection failures
search latency
media processing latency
```

## Correlation

Uma requisição deve possuir um identificador de correlação que possa acompanhar:

```text
request
→ application use case
→ event
→ worker
→ persistence
```

## Error model

Erros de domínio e infraestrutura devem possuir códigos estáveis.

Exemplo:

```text
AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
VALIDATION_FAILED
CONFLICT
RATE_LIMITED
DEPENDENCY_UNAVAILABLE
INTERNAL_ERROR
```

A mensagem pública não deve expor detalhes internos.

## Incidentes

Classificar por impacto:

```text
P0 — indisponibilidade ou risco grave
P1 — função crítica degradada
P2 — impacto limitado
P3 — falha não crítica
```

## Diagnóstico

Ordem recomendada:

```text
impacto
→ início
→ versão/release
→ logs correlacionados
→ métricas
→ traces
→ causa provável
→ mitigação
→ correção
→ teste de regressão
```

## Regra

Observabilidade é parte do produto técnico. Uma funcionalidade crítica sem maneira de diagnosticar falhas não está completa.

# FLUX — API AND APPLICATION CONTRACT

## Objetivo

Definir o contrato entre interface web, casos de uso, domínio e infraestrutura.

## Fluxo padrão

```text
HTTP / UI action
 ↓
transport validation
 ↓
authentication
 ↓
authorization
 ↓
application use case
 ↓
domain
 ↓
port
 ↓
adapter
 ↓
Result
 ↓
response / UI state
```

## Application layer

Use cases orquestram operações. Não devem conter regras profundas de apresentação.

Exemplos:

```text
CreateProfile
PublishVideo
CreateCommunity
CreatePost
CommentOnContent
FollowUser
SearchContent
GetHomeFeed
```

## API versioning

Rotas públicas devem possuir contrato versionável.

Inicialmente, uma versão pode ser implícita; mudanças incompatíveis futuras exigem versão explícita.

## Validation

Toda entrada externa deve ser validada antes de alcançar o domínio.

```text
URL params
query
body
headers
uploads
websocket messages
```

## Errors

Usar vocabulário de erros de domínio/aplicação estável.

```text
validation_error
unauthorized
forbidden
not_found
conflict
rate_limited
internal_error
```

Não expor stack traces nem detalhes internos em produção.

## Pagination

Toda coleção potencialmente grande usa cursor pagination.

```text
items
nextCursor
hasMore
```

Não oferecer endpoints sem limite para feeds, comentários, membros ou busca.

## Idempotency

Operações sensíveis devem aceitar idempotency keys quando repetição puder causar efeitos duplicados.

Particularmente:

```text
orders
payments (future)
uploads
reactions
membership changes
webhook processing
```

## Authorization

Cada use case define sua capability requerida.

```text
canRead
canCreate
canUpdate
canDelete
canModerate
canManage
```

## Events

Após uma mudança confirmada, eventos de domínio podem ser publicados.

```text
state commit
 ↓
domain event
 ↓
async handlers
```

Handlers devem ser idempotentes quando executados novamente.

## API boundaries

Domínios públicos:

```text
/auth
/users
/profiles
/creators
/videos
/shorts
/communities
/posts
/comments
/music
/live
/shop
/search
/notifications
```

## WebSocket boundary

Realtime não deve virar um segundo sistema de domínio. Ele transporta mudanças e presença através de contratos definidos.

## Acceptance

Cada endpoint importante deve possuir:

```text
request schema
response schema
authorization rule
error mapping
pagination policy
test
observability
```

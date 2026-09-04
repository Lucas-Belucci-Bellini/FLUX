# FLUX — TESTING STRATEGY

## Objetivo

Garantir que os contratos do FLUX sejam verificáveis antes de escalar funcionalidades.

## Pirâmide

```text
Unit
  ↓
Component
  ↓
Integration
  ↓
API
  ↓
End-to-End / Smoke
```

## Unit

Cobrir principalmente:

- regras de domínio
- autorização
- validação
- paginação
- ids
- eventos
- scoring de descoberta
- invariantes

## Component

Validar comportamento da UI sem acoplamento a infraestrutura real.

Exemplos:

```text
navigation
video card
comment thread
community card
search results
player controls
notification item
```

## Integration

Validar adapters e fronteiras:

```text
application
→ port
→ adapter
→ persistence
```

Também testar publicação e consumo de eventos.

## API

Cada endpoint deve validar:

```text
input
→ authentication
→ authorization
→ use case
→ response contract
→ error contract
```

## E2E

Os fluxos críticos do site devem ser verificáveis:

```text
sign in
→ profile
→ home
→ feed
→ video
→ comment
→ community
→ post
→ search
```

## Testes de segurança

Cobrir pelo menos:

- acesso sem autenticação
- acesso com papel insuficiente
- tentativa de acessar recurso de outro usuário
- payload inválido
- conteúdo não sanitizado
- rate limit aplicável
- upload inválido

## Testes de regressão

Cada bug corrigido que represente risco de retorno deve gerar um teste de regressão.

## Definition of done

Uma feature só é considerada pronta quando código, testes, documentação e build estão coerentes.

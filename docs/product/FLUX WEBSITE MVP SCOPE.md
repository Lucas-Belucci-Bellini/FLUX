# FLUX — WEBSITE MVP SCOPE

## Objetivo

Definir o primeiro produto web real do FLUX. O MVP deve provar a experiência central da plataforma sem tentar implementar toda a visão de vídeo, comunidades, música, live e marketplace de uma vez.

## Princípio

O primeiro site deve ser **pequeno em superfície e grande em fundação**.

```text
AUTH
 ↓
PROFILE
 ↓
HOME / FEED
 ↓
CONTENT
 ↓
COMMUNITY
```

Os demais domínios entram por contratos preparados, não por telas falsas.

## Escopo obrigatório do primeiro site

```text
Landing / Home
Authentication
User Profile
Creator Profile
Home Feed
Explore
Search
Video Detail
Comments
Community Detail
Post Detail
Notifications shell
Settings shell
```

## Escopo posterior

```text
Shorts full experience
Music hub
Persistent global music player
Live
Messages
Marketplace
Creator Studio
Advanced recommendation
Voice channels
Advanced moderation console
```

## Experiência mínima

Um usuário deve conseguir:

```text
criar conta
→ completar perfil
→ entrar na Home
→ descobrir conteúdo
→ abrir vídeo
→ interagir
→ abrir comunidade relacionada
→ participar da discussão
→ voltar ao conteúdo
```

## Regra contra mock permanente

Durante o MVP, dados de demonstração podem popular ambientes locais. As páginas, porém, devem consumir interfaces de domínio reais desde o princípio.

## Critérios de aceitação

- navegação principal consistente;
- estados loading/empty/error definidos;
- autenticação real ou adapter substituível;
- dados de domínio tipados;
- links entre conteúdo e comunidade funcionando pelo Content Graph;
- layout responsivo;
- acessibilidade básica;
- testes dos fluxos críticos;
- build de produção reproduzível.

## Primeira fatia vertical

```text
Login
→ Session
→ Home
→ Feed item
→ Video
→ Like / Comment
→ Community
→ Post
```

Essa fatia é o primeiro objetivo de produto antes da expansão para Music, Live e Shop.

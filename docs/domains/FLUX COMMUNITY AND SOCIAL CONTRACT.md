# FLUX — COMMUNITY AND SOCIAL CONTRACT

## Objetivo

Definir comunidades, posts, comentários, membros, cargos e relações sociais como um domínio integrado.

## Community

```text
id
name
slug
description
avatar
banner
visibility
ownerId
parentCommunityId
createdAt
status
```

## Community hierarchy

Comunidades podem formar árvores de interesse:

```text
Gaming
└── War Thunder
    └── Germany
        └── Aviation
```

A profundidade deve possuir limite configurável para evitar estruturas impossíveis de navegar.

## Membership

```text
requested
active
muted
banned
left
```

Membresia possui contexto por comunidade e não altera a identidade global da conta.

## Roles

Permissões são atribuídas por roles de comunidade.

```text
member
moderator
manager
owner
```

Papéis adicionais podem ser criados por administradores conforme capacidade permitida pelo modelo de autorização.

## Channels

Tipos iniciais:

```text
text
announcement
media
voice
```

Cada canal possui sua própria política de visibilidade e permissões.

## Posts

Tipos:

```text
text
image
video
poll
link
question
guide
announcement
```

Post deve apontar para um autor e, normalmente, para um contexto de comunidade.

## Comments / threads

Comentários formam uma árvore limitada por regras de profundidade e paginação.

```text
Comment
└── Reply
    └── Reply
```

## Reactions

Reações são registradas de forma idempotente e podem ser reconfiguradas por recurso/contexto sem duplicar identidade do usuário.

## Moderation

Cada comunidade possui ferramentas para:

```text
report
warning
mute
remove
ban
lock
pin
role change
```

A plataforma mantém uma camada global de segurança além da moderação de comunidade.

## Events

```text
CommunityCreated
MemberJoined
MemberRemoved
PostCreated
PostModerated
ChannelCreated
CommunityEventScheduled
```

## Content Graph

Comunidades participam do grafo e podem se relacionar com:

```text
Video
Creator
Post
Track
Playlist
Live
Product
Event
```

## First website slice

```text
Community list
Community detail
Membership state
Channel list
Post feed
Post detail
Comment thread
Community moderation surface
```

# FLUX — DATABASE AND DOMAIN MODEL

## Objetivo

Definir a separação entre entidades de negócio, relações, eventos, projeções e armazenamento persistente.

## Domínios principais

```text
Identity
Profile
Creator
Video
Short
Community
Post
Comment
Message
Music
Live
Marketplace
Notification
Search
Recommendation
Moderation
```

## Entidades fundamentais

### Identity

```text
User
Account
Session
CredentialReference
```

### Social

```text
Follow
Reaction
Comment
Post
Message
Notification
```

### Community

```text
Community
CommunityMember
CommunityRole
Channel
CommunityRule
CommunityEvent
```

### Media

```text
Video
Short
MediaAsset
Thumbnail
Transcript
```

### Music

```text
Artist
Track
Album
Playlist
PlaylistItem
```

### Commerce

```text
Store
Product
ProductVariant
Cart
CartItem
Order
OrderItem
Review
```

## IDs

Todos os objetos persistentes devem possuir identificadores estáveis e globalmente únicos dentro do domínio correspondente.

IDs não devem codificar informação de negócio mutável.

## Ownership

Cada dado possui um único owner de domínio.

Exemplo:

```text
User.identity
Creator.profile
Video.video
Community.community
Product.marketplace
Track.music
```

Outros domínios referenciam, mas não duplicam o estado autoritativo.

## Content Graph

Relações entre domínios são representadas por edges tipadas quando fazem parte do grafo de conteúdo.

```text
Video --created_by--> Creator
Video --belongs_to--> Community
Video --contains--> Track
Video --features--> Product
Post --discusses--> Video
```

A lista de relações legais é fechada e validada no core do grafo.

## Separação entre estado e contadores

Contadores como views, likes e followers são derivados/projetados quando possível. Não criar múltiplas fontes autoritativas para o mesmo contador.

## Events

Eventos de domínio registram fatos ocorridos:

```text
VideoPublished
CommentCreated
UserFollowed
CommunityCreated
OrderCreated
LiveStarted
```

Eventos não são o banco primário. Eles alimentam reações, projeções, notificações e jobs.

## Read models

Interfaces podem usar projeções específicas para leitura sem alterar o modelo de domínio.

Exemplo:

```text
HomeFeedProjection
CreatorOverviewProjection
CommunityOverviewProjection
SearchDocument
```

## Transactions

Operações que alteram múltiplos agregados precisam definir sua fronteira transacional.

Não assumir que toda ação cross-domain exige uma única transação de banco.

Quando necessário, usar eventos e processamento idempotente.

## Soft deletion

Entidades que exigem histórico ou auditoria não devem ser apagadas fisicamente sem política explícita.

```text
active
hidden
archived
deleted
```

## Multi-tenancy

Comunidades e lojas são contextos próprios, mas usam a identidade global da conta.

## Migrations

Mudanças persistentes exigem migrations versionadas. Nunca alterar schema de produção manualmente como regra de operação.

## Regra

O banco deve refletir o modelo de negócio. Não desenhar tabelas apenas para reproduzir a estrutura das telas.

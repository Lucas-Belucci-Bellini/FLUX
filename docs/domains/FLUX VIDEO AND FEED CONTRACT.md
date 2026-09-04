# FLUX — VIDEO AND FEED CONTRACT

## Objetivo

Definir a primeira experiência de conteúdo do FLUX: vídeos, feed, interação e relações com outros domínios.

## Video entity

```text
id
creatorId
title
description
mediaAssetId
thumbnailAssetId
duration
visibility
category
tags
createdAt
updatedAt
status
```

## Lifecycle

```text
draft
→ processing
→ ready
→ published
→ hidden
→ archived
```

Upload físico e processamento de mídia não pertencem ao domínio de vídeo; o domínio acompanha o estado através de ports/events.

## Publication

Publicação deve validar:

```text
creator authorization
metadata
media readiness
visibility policy
community relationship when applicable
```

## Feed

O feed é uma projeção de conteúdo, não uma tabela universal de verdade.

Fontes iniciais:

```text
following
communities
history
likes
search
trending
editorial signals
```

## Feed item

Cada item precisa de contexto suficiente para renderização:

```text
content reference
creator summary
community summary when relevant
media preview
engagement summary
reason / source signal when available
```

## Recommendation boundary

Feed e Recommendation não são o mesmo sistema.

```text
Feed
→ combina fontes e regras de apresentação

Recommendation
→ produz candidatos / scores
```

## Views

Visualização deve registrar evento de consumo de forma controlada. Não incrementar contadores diretamente no componente de UI.

## Likes / reactions

Reação deve ser idempotente por usuário e conteúdo.

## Comments

Comentários pertencem ao domínio social/discussão, mesmo quando exibidos em vídeo.

## Video relations

Vídeo pode se relacionar com:

```text
Creator
Community
Playlist
Track
Product
Live
Post
Event
```

Essas relações devem usar o Content Graph quando forem relações públicas de conteúdo.

## Visibility

```text
public
unlisted
private
community
followers
```

## Delete / moderation

Remoção pode significar:

```text
hidden by owner
moderated
archived
deleted
```

Preservar evidência/auditoria conforme política de retenção.

## First website slice

O MVP precisa suportar:

```text
video listing
video detail
creator link
community link
like
comment
share link
history registration
```

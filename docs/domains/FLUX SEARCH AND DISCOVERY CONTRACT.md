# FLUX — SEARCH AND DISCOVERY CONTRACT

## Objetivo

Permitir que o usuário encontre conteúdo e depois atravesse o Content Graph para descobrir relações.

## Search sources

```text
Videos
Shorts
Creators
Communities
Posts
Music
Artists
Albums
Playlists
Lives
Products
```

## Search architecture

```text
Query
 ↓
Normalize
 ↓
Search Port
 ↓
Provider / PostgreSQL adapter
 ↓
Rank
 ↓
Filter
 ↓
Cursor Page
```

## Query model

```text
query
filters
sort
cursor
limit
```

`limit` possui teto server-side.

## Result model

Cada resultado deve carregar:

```text
kind
id
title / display label
summary
thumbnail when applicable
context
relevance
```

## Discovery

Discovery é mais amplo que busca textual.

```text
Explore
Trending
Popular
New
Categories
Following
Community activity
```

## Recommendation boundary

Discovery pode usar Recommendation, mas não depende exclusivamente dela.

## Relevance

Começar com sinais transparentes:

```text
text match
freshness
engagement
community context
creator affinity
user history
```

Não construir um modelo de ML obrigatório no MVP.

## Graph navigation

Resultados podem apresentar relações:

```text
Video
→ Creator
→ Community
→ Track
→ Product
```

## Privacy

Conteúdo privado, restrito ou moderado não pode aparecer para usuários sem autorização.

## Indexing lifecycle

```text
Entity created/changed
 ↓
Domain event
 ↓
Index job
 ↓
Search projection
```

Index falho não deve corromper a fonte de verdade.

## First site slice

```text
Search bar
Search results page
Domain filters
Basic Explore
```

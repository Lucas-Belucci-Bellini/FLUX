# FLUX — INFORMATION ARCHITECTURE

## Objetivo

Definir como as áreas do site são organizadas e como o usuário navega entre experiências sem sentir que está trocando de aplicativo.

## Navegação global

```text
FLUX
├── Home
├── Explore
├── Shorts
├── Communities
├── Music
├── Live
└── Shop
```

Área pessoal:

```text
Library
├── History
├── Watch Later
├── Liked
├── Playlists
└── Following
```

Área de conta:

```text
Profile
Notifications
Messages
Settings
Creator Studio
```

## Regra de navegação

Todo conteúdo importante deve possuir uma rota canônica e um identificador estável.

```text
/video/:videoId
/community/:communityId
/post/:postId
/creator/:creatorId
/music/:trackId
/album/:albumId
/live/:liveId
/product/:productId
```

## Content Graph

A navegação deve poder atravessar relações sem criar URLs artificiais.

```text
Video
 ↓
Creator
 ↓
Community
 ↓
Post
 ↓
Track
 ↓
Product
```

## Breadcrumb / contexto

Interfaces profundas devem manter contexto suficiente para o usuário entender onde está.

## Busca

Busca universal aponta para uma página própria e permite filtros por domínio.

## Responsividade

A arquitetura da informação é a mesma em desktop e mobile, mas a prioridade visual pode mudar.

## Deep linking

Toda página pública deve ser acessível diretamente por URL. A navegação interna nunca pode depender exclusivamente de estado temporário do navegador.

## Estados

Cada rota deve possuir:

```text
loading
success
empty
error
forbidden
not-found
```

## Primeira navegação do MVP

```text
/
/login
/signup
/home
/explore
/search
/video/:id
/community/:id
/post/:id
/creator/:id
/profile
/settings
```

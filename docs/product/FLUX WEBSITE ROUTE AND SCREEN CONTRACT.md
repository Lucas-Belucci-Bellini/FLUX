# FLUX — WEBSITE ROUTE AND SCREEN CONTRACT

## Objetivo

Definir o primeiro conjunto de rotas reais do site antes da criação de dezenas de telas.

## Navegação pública inicial

```text
/
/explore
/search
/shorts
/communities
/music
/live
/shop
```

## Conta e perfil

```text
/sign-in
/sign-up
/profile/:username
/settings
```

## Conteúdo

```text
/video/:videoId
/playlist/:playlistId
/community/:communityId
/community/:communityId/post/:postId
/creator/:username
```

## Feed

```text
/home
/library
/history
/watch-later
/liked
```

## Studio

A área de criação deve ficar separada da navegação pública:

```text
/studio
/studio/content
/studio/analytics
/studio/comments
/studio/live
/studio/store
/studio/community
/studio/settings
```

## Regra de carregamento

Cada rota deve ter:

```text
loading
error
empty
success
```

Rotas críticas não devem depender de um único componente monolítico.

## Shell compartilhado

O site terá um shell comum contendo:

```text
navigation
main content
optional contextual rail
global player
notifications
account controls
```

A existência do global player permite navegar entre vídeo, comunidade, música e shop sem desmontar a experiência de reprodução quando aplicável.

## Contrato de URL

IDs e slugs devem ser estáveis.

URLs devem ser compartilháveis e não depender do estado temporário de uma sessão.

## SEO e compartilhamento

Conteúdo público indexável deve produzir metadados apropriados para título, descrição e preview quando suportado pela plataforma.

## Regra de MVP

A primeira implementação deve priorizar:

```text
sign-in
→ home
→ feed
→ video
→ comments
→ community
→ post
→ search
→ profile
```

Music, Live e Shop podem entrar no shell e nas rotas iniciais sem exigir que todo o backend avançado esteja pronto no primeiro corte.

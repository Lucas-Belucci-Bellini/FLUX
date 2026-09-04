# FLUX — WEB APPLICATION ARCHITECTURE

## Objetivo

Definir como o primeiro site FLUX será organizado em Next.js/React sem misturar UI, domínio, dados e infraestrutura.

## Camadas

```text
apps/web
├── app/                 route layer
├── components/          presentation
├── features/            feature orchestration
├── lib/                 application utilities
└── server/              server-side integration

packages/
├── core/                shared primitives and contracts
├── auth/                identity domain
├── video/               video domain
├── community/           community domain
├── social/              social domain
├── music/               music domain
├── marketplace/         commerce domain
└── ui/                  design system
```

## Regra

`apps/web` pode coordenar casos de uso, mas não deve se tornar o owner das regras de negócio.

## Rendering

Preferir server rendering para conteúdo e navegação que não exige estado local. Client components entram somente quando interatividade local justifica.

## Page architecture

Cada rota deve seguir:

```text
Route
 ↓
Page Model / Query
 ↓
Application Use Case
 ↓
Domain Port
 ↓
Adapter
```

## Feature boundary

Uma feature deve agrupar o que muda junto, mas não copiar a mesma regra em páginas diferentes.

## Data fetching

Queries devem ser tipadas e possuir estados explícitos.

```text
loading
success
empty
error
forbidden
not-found
```

## Mutations

Mutations passam por use cases e validação server-side. A UI nunca é fonte de autorização.

## Navigation

Links internos devem usar rotas canônicas. URLs públicas devem ser estáveis e compartilháveis.

## Component composition

```text
Page
 ↓
Section
 ↓
Feature Component
 ↓
UI Primitive
```

Primitives não conhecem banco, domínio ou autenticação.

## Global layout

```text
RootLayout
├── TopBar
├── Sidebar / MobileNav
├── MainContent
└── Global overlays
    ├── Dialogs
    ├── Toasts
    └── Player
```

## Global media player

O player global é uma preocupação de aplicação, não de uma única página. Seu estado deve sobreviver à navegação quando o fluxo da experiência permitir.

## Error handling

Erros esperados de domínio viram estados de interface. Erros inesperados são reportados e não expõem detalhes internos.

## Performance

Priorizar:

```text
streaming SSR
code splitting
lazy loading
image optimization
virtualization
cursor pagination
```

## First implementation target

```text
/login
/home
/explore
/search
/video/[id]
/community/[id]
/post/[id]
/creator/[id]
/profile
/settings
```

## Regra final

A arquitetura web deve poder evoluir para mobile e desktop sem duplicar o domínio. O domínio vive fora de `apps/web`.

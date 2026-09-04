# FLUX — AUTH AND PROFILE SYSTEM

## Objetivo

Definir identidade, sessão, perfil e entrada da plataforma.

## Identity vs Profile

```text
Identity
→ quem a conta é para segurança e autorização

Profile
→ como a conta aparece socialmente
```

Uma pessoa pode possuir um perfil público sem expor credenciais ou dados privados.

## Account lifecycle

```text
created
→ verified
→ active
→ suspended
→ disabled
→ deleted / archived
```

## Session lifecycle

```text
issued
→ active
→ rotated
→ expired
→ revoked
```

Sessões devem possuir expiração e revogação server-side.

## Authentication

A autenticação deve suportar inicialmente conta baseada em credencial segura e poderá incorporar provedores externos futuramente sem alterar o domínio de identidade.

## Authorization

Autorização é independente da autenticação.

```text
authenticated
≠
authorized
```

Cada operação verifica a capacidade necessária.

## Roles

Papéis podem existir globalmente e em contextos específicos:

```text
User
Creator
Moderator
CommunityAdmin
StoreOwner
Artist
PlatformModerator
Admin
```

## Username

O username público deve possuir regra de unicidade, normalização e política de alteração.

Não usar username como chave primária interna.

## Profile

```text
avatar
banner
name
username
bio
links
followers
following
createdAt
```

Contadores públicos devem ser tratados como projeções consistentes, não múltiplas fontes autoritativas.

## Creator

Creator é uma capacidade/estado de publicação dentro da identidade, não uma conta completamente separada.

```text
User
 ↓
Creator Profile
 ↓
Content
```

## Privacy

Definir visibilidade por campo e por recurso quando necessário.

```text
public
followers
community
private
```

## Security rules

- não confiar no cliente para autenticação ou autorização;
- não armazenar segredos em código;
- validar dados na borda;
- limitar tentativas de autenticação;
- registrar eventos de segurança relevantes.

## First site flow

```text
Signup
→ Verify
→ Login
→ Session
→ Profile setup
→ Home
```

## Acceptance

A fundação de autenticação deve permitir que todas as áreas do FLUX referenciem a mesma identidade sem criar sistemas paralelos de usuário.

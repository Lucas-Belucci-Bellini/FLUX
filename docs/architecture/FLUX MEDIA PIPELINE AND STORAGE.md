# FLUX — MEDIA PIPELINE AND STORAGE

## Objetivo

Definir o ciclo de arquivos de vídeo, áudio, imagens e thumbnails sem misturar bytes de mídia com dados relacionais.

## Pipeline

```text
Upload
 ↓
Boundary validation
 ↓
Quarantine
 ↓
Metadata extraction
 ↓
Processing / transcoding
 ↓
Validation
 ↓
Object storage
 ↓
CDN delivery
```

## Ownership

```text
Media Asset
→ Media domain

Video metadata
→ Video domain

Track metadata
→ Music domain

Product image
→ Marketplace domain
```

## Object storage

Arquivos binários não devem ser armazenados diretamente no PostgreSQL.

Banco guarda referências:

```text
assetId
storageKey
mimeType
size
checksum
status
createdAt
```

## Asset lifecycle

```text
uploaded
→ quarantined
→ processing
→ ready
→ published
→ archived
→ deleted
```

## Upload security

Validar:

```text
size
MIME
extension
content signature
filename
ownership
authorization
```

Nunca confiar apenas na extensão fornecida pelo navegador.

## Processing

Transcodificação é assíncrona.

```text
Upload request
→ asset created
→ job queued
→ worker processes
→ asset status updated
```

## Variants

Um asset original pode gerar múltiplas variantes:

```text
thumbnail
preview
low
medium
high
mobile
audio-only
```

## CDN

URLs públicas devem ser obtidas por adapter. O domínio não deve conhecer provedor específico.

## Integrity

Assets importantes devem possuir checksum e estado de processamento verificável.

## Failure

Falha de transcoding não deve apagar automaticamente o upload original antes de uma política explícita de retenção.

## First website slice

O MVP precisa conseguir:

```text
referenciar thumbnail
exibir vídeo pronto
mostrar estado processing
mostrar estado unavailable
```

Upload completo pode entrar logo depois da vertical slice web inicial.

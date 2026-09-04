# FLUX — MEDIA PIPELINE AND STORAGE

## Purpose

Define how user media travels from upload to playback without coupling large binary payloads to domain tables.

## Pipeline

```text
Create Upload Intent
→ Authorize
→ Upload Object
→ Validate File
→ Probe Metadata
→ Queue Processing
→ Transcode
→ Generate Thumbnail / Preview
→ Persist Media Metadata
→ Publish Availability Event
→ CDN Delivery
```

## Media classes

```text
Video
Short
Live recording
Audio / Track
Image
Avatar
Banner
Attachment
Thumbnail
```

## Storage separation

```text
PostgreSQL
→ ownership, metadata, state, relationships

Object Storage
→ media bytes / original / derivatives

CDN
→ public or authorized delivery

Queue / Worker
→ transcoding, thumbnails, media analysis
```

## Upload rules

Uploads require:

- authenticated owner or delegated actor;
- declared media intent;
- size/type limits;
- server-side validation;
- safe filename handling;
- processing state tracking;
- cleanup of abandoned temporary objects.

## Processing states

```text
CREATED
UPLOADING
UPLOADED
VALIDATING
QUEUED
PROCESSING
READY
BLOCKED
FAILED
DELETED
```

## Original and derived assets

The original upload is never confused with a transcoded derivative.

```text
MediaAsset
├── original
├── source metadata
├── derivatives
│   ├── resolution
│   ├── codec
│   └── bitrate
└── thumbnails / previews
```

## Playback

The player consumes a stable playback contract. Storage implementation details must not leak into UI components.

## Security

Never trust client-declared MIME type, duration, dimensions or extension. Verify at processing boundaries. Signed URLs or equivalent authorization are required for private media.

## Deletion

Logical deletion happens in domain state first. Physical object cleanup is asynchronous and retryable.

## Observability

Track upload failure, processing duration, queue latency, storage errors, playback errors and derivative generation success.

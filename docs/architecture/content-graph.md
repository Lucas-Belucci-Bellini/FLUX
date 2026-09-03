# The content graph

The one idea the rest of FLUX is arranged around.

---

## The problem

A video on a normal platform is a leaf. It has a creator and some comments, and
everything else about it - the community that argues about it, the track playing
under it, the gear the creator used, the live it was cut from - lives on a
different site, or nowhere.

FLUX's premise is that those connections *are* the product. Which means they
cannot be an afterthought stapled to each feature; they have to be the shape of
the data from the first commit.

---

## The model

Content is **nodes** joined by typed, directed **edges**.

```ts
interface NodeRef {
  kind: NodeKind; // 'video' | 'community' | 'track' | 'product' | …
  id: string;
}

interface GraphEdge {
  from: NodeRef;
  kind: EdgeKind; // 'belongs_to' | 'features' | 'promotes' | …
  to: NodeRef;
  createdAt: string;
  position?: number; // ordering inside a playlist or album
}
```

A node reference is always a kind *and* an id, never a bare id. Two things named
`"01J..."` are not interchangeable just because both are strings, and
`Id<'video'>` refuses to be passed where `Id<'community'>` belongs.

### Node kinds (17)

`user` · `creator` · `video` · `short` · `live` · `post` · `comment` ·
`community` · `channel` · `playlist` · `track` · `album` · `artist` · `store` ·
`product` · `event` · `tag`

### Edge kinds (12)

| Edge            | Means                                                       |
| --------------- | ----------------------------------------------------------- |
| `authored_by`   | who made it                                                 |
| `belongs_to`    | where it lives (a community, an album, a store)             |
| `contains`      | ordered membership (a playlist holding videos or tracks)    |
| `features`      | creative credit (a video featuring a track)                 |
| `about`         | discussion aimed at a piece of content                      |
| `replies_to`    | a comment answering another comment                         |
| `sells`         | a store offering a product                                  |
| `promotes`      | the product shelf under a video, short or live              |
| `tagged`        | topic labelling                                             |
| `scheduled_as`  | a live planned as a calendar event                          |
| `derived_from`  | provenance: a short cut from a video, a video from a live   |
| `performed_by`  | a track or album by an artist                               |

---

## The relation contract

Node kinds and edge kinds alone would still allow nonsense - a product replying
to an album. So the legal combinations are declared, exhaustively, in one table:

```ts
// packages/core/src/graph/relations.ts
rule('video', 'belongs_to', 'community', 'one', 'posted in', 'videos');
rule('video', 'promotes', 'product', 'many', 'featured products', 'seen in videos');
rule('comment', 'replies_to', 'comment', 'one', 'replying to', 'replies');
```

Each rule carries:

- the **triple** it permits: from-kind, edge, to-kind
- its **cardinality** - `one` means at most one such edge may leave a node (a
  video sits in a single community; a comment answers a single parent)
- **both readings** - `label` forwards ("posted in"), `inverseLabel` backwards
  ("videos"), so any edge can be rendered from either end without the UI knowing
  what it is looking at

`connect()` consults this table on every write. An edge that is not declared
does not fail in review or in production - it cannot be created.

**This is the single place FLUX declares what may relate to what.** Adding a
capability means adding a row here, not scattering a linking scheme through a
feature.

### What that buys

Because relations are data rather than code:

- `/diagnostics` renders the whole contract without a hardcoded list
- a "link this to…" picker asks `relationsFrom('video')` and gets its options
- a relations panel renders any node's connections generically
- the promise "everything connects" is a **test**, not a claim:

```ts
it('expresses every link the product promises around a video', () => {
  expect(isRelationAllowed('video', 'belongs_to', 'community')).toBe(true);
  expect(isRelationAllowed('post', 'about', 'video')).toBe(true);
  expect(isRelationAllowed('playlist', 'contains', 'video')).toBe(true);
  expect(isRelationAllowed('video', 'features', 'track')).toBe(true);
  expect(isRelationAllowed('video', 'promotes', 'product')).toBe(true);
  // …and what must stay impossible:
  expect(isRelationAllowed('product', 'replies_to', 'album')).toBe(false);
});
```

---

## Querying

### `neighbors(ref, query)`

One node's edges, filtered and paged.

```ts
// The product shelf under a video.
await graph.neighbors(video, { edge: 'promotes', kind: 'product' });

// Everything this creator has published — walking edges backwards.
await graph.neighbors(creator, { direction: 'in', edge: 'authored_by' });

// A playlist in its own order, not by recency.
await graph.neighbors(playlist, { edge: 'contains', order: 'position' });
```

Results are cursor-paged like every other list in FLUX.

### `context(ref)`

Everything attached to a node, grouped by the kind on the far side. This is the
call behind the "connected" panel - open a video and the community, the
discussion, the playlist, the track, the products and the creator arrive
together:

```ts
const context = await graph.context(video);
context.byKind.community; // [ { kind: 'community', id: '…' } ]
context.byKind.product;   // [ … ]
context.total;            // 8
```

The home page renders exactly this, computed live rather than illustrated.

### `parent(ref, edge)`

The single edge of a `one`-cardinality relation - which community a video is in,
which comment a reply answers.

---

## Rules the adapter enforces

| Rule                    | Behaviour                                                                 |
| ----------------------- | ------------------------------------------------------------------------- |
| Undeclared relation     | `invalid` - refused, naming the triple                                     |
| Self-link               | `invalid` - a node cannot link to itself                                   |
| Duplicate edge          | idempotent - retries and double clicks do not create a second edge         |
| Second `one` edge       | `conflict`, unless `replace: true` - moving is explicit, drifting is not   |
| Deleting a node         | `detach()` removes every edge in both directions; no dangling references   |
| Unknown paging cursor   | restart from the beginning rather than fail a feed the reader can see      |

---

## Persistence

The in-memory adapter keeps three structures: the edges, an outgoing index and
an incoming index, so both directions are answered without a scan.

The PostgreSQL adapter implements the same port over one table:

```sql
CREATE TABLE edges (
  from_kind  text NOT NULL,
  from_id    text NOT NULL,
  edge_kind  text NOT NULL,
  to_kind    text NOT NULL,
  to_id      text NOT NULL,
  position   integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (from_kind, from_id, edge_kind, to_kind, to_id)
);

CREATE INDEX edges_out ON edges (from_kind, from_id, edge_kind, created_at DESC);
CREATE INDEX edges_in  ON edges (to_kind,   to_id,   edge_kind, created_at DESC);
```

The primary key gives idempotent writes for free. The two indexes are the two
directions. Both adapters run against the same test suite, so they are held to
one definition of correct rather than drifting apart.

---

## What this is not

It is not a general-purpose graph database, and it should not become one. There
is no traversal language, no arbitrary-depth pathfinding, no query planner. It
answers a small, fixed set of questions - *what is attached to this, and how* -
which is what the product needs and what a relational database answers well with
two indexes.

If a future feature genuinely needs multi-hop traversal, that is a decision to
record in an ADR, with the measurement that motivated it.

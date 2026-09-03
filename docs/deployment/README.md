# Deployment

## The shape of the problem

FLUX is an npm-workspaces monorepo: the deployable app is `apps/web`, but the
install and the build have to happen at the repository root, because the app
imports `@flux/core`, `@flux/identity` and `@flux/ui` as workspace packages.

A host pointed at the repository root will build successfully and then find no
output there, because the build output is `apps/web/.next`.

## Vercel

`vercel.json` at the repository root says all of it:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "apps/web/.next"
}
```

`npm run build` type-checks every workspace before building the app, so a type
error fails the deployment rather than shipping.

**Alternative:** set the project's **Root Directory** to `apps/web` in the
Vercel dashboard, with "include files outside the root directory" enabled.
That is a project setting rather than a file in the repository, so it is
invisible to anyone reading the code - which is why the committed `vercel.json`
is the default here.

### Required environment

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `FLUX_SESSION_SECRET` | **yes, in production** | 32+ bytes. The server refuses to sign a session cookie without it - see ADR-0007. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. |
| `FLUX_APP_URL` | recommended | The public origin. Used for absolute URLs and metadata. |
| `DATABASE_URL` | not yet | Unset means the in-memory adapter. Introduced in phase 2. |

`FLUX_SESSION_SECRET` is checked when a session is actually signed, not at
build time - so a deployment builds without it and then fails loudly on the
first request that needs a session. That is deliberate: a build should not
need production secrets, and a running server should not quietly fall back to
a development key.

**A preview deployment without `FLUX_SESSION_SECRET` will build and then error
on any page that reads the session** - which, since the header is
personalised, is every page. Set it on the Vercel project for all
environments, including previews.

### Known issue: preview comments block the deploy step

As of 2026-09-03 a deployment **builds successfully and then fails while
uploading outputs**, with:

```
Cannot patch preview comments when immutable static file upload is enabled.
Upgrade to next@v16.3.0-canary.32 or newer to resolve this.
```

This is not something the repository can fix:

- the version it asks for is already satisfied - the build runs Next 16.3.4,
  and `16.3.4` is newer than `16.3.0-canary.32`;
- it happens after `Build Completed`, in Vercel's own upload step, and names
  Vercel's preview-comments feature, which no code here touches.

The workaround is a project setting: **turn off preview comments / the Vercel
Toolbar for this project**, or wait for the platform-side fix. If a deployment
fails with only this line after a clean build, nothing in the codebase has
regressed.

### What is not configured yet

- **Persistence.** With no `DATABASE_URL`, each serverless instance keeps its
  own in-memory store, so accounts do not survive a cold start and are not
  shared between instances. Fine for a preview of the UI; phase 2 brings the
  PostgreSQL adapter, and until then a deployment is a demonstration, not an
  environment.
- **Regions, caching, CDN.** Phase 12.

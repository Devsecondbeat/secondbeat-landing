# Early access waitlist — setup and export

Domain terms: see [`CONTEXT.md`](../CONTEXT.md). Storage decision: [`docs/adr/0001-self-hosted-waitlist-storage.md`](adr/0001-self-hosted-waitlist-storage.md).

## Prerequisites

- Cloudflare account with Pages project for this repo
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm i -g wrangler` or `npx wrangler`)

## 1. Create D1 database

```bash
wrangler d1 create secondbeat-waitlist
```

Copy the `database_id` from the output into [`wrangler.toml`](../wrangler.toml):

```toml
database_id = "YOUR_DATABASE_ID"
```

## 2. Apply schema

```bash
wrangler d1 execute secondbeat-waitlist --remote --file=./migrations/0001_waitlist.sql
```

For local Pages dev:

```bash
wrangler d1 execute secondbeat-waitlist --local --file=./migrations/0001_waitlist.sql
```

## 3. Bind D1 to Cloudflare Pages

In **Cloudflare Dashboard → Workers & Pages → your project → Settings → Functions**:

1. Add a **D1 database binding**
   - Variable name: `DB`
   - Database: `secondbeat-waitlist`

Or ensure [`wrangler.toml`](../wrangler.toml) is picked up by the Pages project (same binding name `DB`).

## 4. Turnstile (recommended for production)

1. **Cloudflare Dashboard → Turnstile** → create a widget for `secondbeat.in`
2. Set **Pages environment variable** (Production):
   - `TURNSTILE_SECRET_KEY` = secret key
3. Set the **site key** on the landing page root element in [`index.html`](../index.html):

```html
<html ... data-turnstile-site-key="YOUR_SITE_KEY">
```

If `TURNSTILE_SECRET_KEY` is unset, the API skips Turnstile verification (local dev only). Production should always set both keys.

## 5. Deploy

Push the branch to GitHub; Cloudflare Pages builds and deploys static assets + `functions/`.

After deploy, purge cache for `/` and `/styles.min.css` if needed.

## 6. Test signup

```bash
curl -s -X POST "https://secondbeat.in/api/waitlist" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","consent":true,"instrument_interest":"Acoustic","source":"cli-test"}'
```

Expected: `201` with `"ok": true`.

## 7. Export waitlist (Wrangler CLI)

All rows as JSON:

```bash
wrangler d1 execute secondbeat-waitlist --remote --command \
  "SELECT email, instrument_interest, consent_at, source, created_at, updated_at FROM waitlist ORDER BY created_at"
```

Export-friendly CSV (copy from JSON output) or:

```bash
wrangler d1 execute secondbeat-waitlist --remote --command \
  "SELECT email, instrument_interest, created_at FROM waitlist ORDER BY created_at" --json
```

## 8. Local development

```bash
npx wrangler pages dev . --d1=DB --local
```

Then open the URL shown (usually `http://localhost:8788`). POST `/api/waitlist` hits the local function and local D1.

## Data collected

| Column | Description |
|--------|-------------|
| `email` | Visitor email (unique) |
| `instrument_interest` | Optional: Acoustic, Electric, Drums, Piano, Classical, Not sure |
| `consent_at` | ISO timestamp when consent checkbox was submitted |
| `source` | Default `landing-cta` |
| `created_at` / `updated_at` | First join / last update (duplicate emails update `instrument_interest`) |

Duplicate emails: silent update per [`CONTEXT.md`](../CONTEXT.md) — same success message shown to the Visitor.

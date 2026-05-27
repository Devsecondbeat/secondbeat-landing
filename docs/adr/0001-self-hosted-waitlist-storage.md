# Self-hosted early access waitlist in Cloudflare D1

SecondBeat will store early access waitlist data in Cloudflare D1 via Pages Functions, not a third-party form SaaS (Formspree, Tally, etc.). The product owner rejected vendor-held email lists; Visitor emails and optional instrument interest must stay under the Cloudflare account. Formspree was considered for speed (~2h) but rejected due to data custody concerns. Trade-off: ~3–5 days manual implementation vs ~2 hours, $0 at waitlist scale on Cloudflare free tiers.

**Considered options:** Formspree (fastest), Cloudflare D1 + Pages Functions (chosen), Formspree-now-migrate-later (rejected — still puts emails with vendor initially).

**Consequences:** Requires `functions/`, D1 schema, Wrangler setup, Turnstile integration, and CLI-based export. Launch email to waitlist Visitors will use a separate mail sender (e.g. Resend) but the list itself remains in D1.

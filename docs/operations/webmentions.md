# Webmentions Workflow

Webmentions are fetched at build time, filtered for spam, and rendered alongside backlinks on individual posts. The process involves a Node script, a cached JSON payload, and the `Webmentions` Astro component.

## Data Fetching

- `npm run fetch-webmentions` executes `scripts/fetch-webmentions.js`, which pulls the latest mentions from `https://webmention.io/api/mentions.jf2` for `sajalchoudhary.net` and writes the response to `src/data/webmentions.json`.【F:scripts/fetch-webmentions.js†L1-L48】
- The script maintains an extensive domain blocklist to filter known spam sources before persisting the data. The list mirrors the one enforced at render time inside the component.【F:scripts/fetch-webmentions.js†L14-L148】
- Run the command manually to refresh mentions locally, or rely on `npm run build`, which invokes the fetch step before building the Astro site.【F:package.json†L11-L21】

## Rendering Mentions

`src/components/Webmentions.astro` reads the cached JSON file and filters mentions at render time:

1. Normalizes the current page URL to catch variations (with or without trailing slash or `.md` suffix).【F:src/components/Webmentions.astro†L1-L31】
2. Splits results into likes/reposts versus replies/mentions with content, sorting conversational entries by received date descending.【F:src/components/Webmentions.astro†L33-L68】
3. Applies the same blocklist check used in the fetch script to hide spam that slips through the API response.【F:src/components/Webmentions.astro†L70-L154】

The component can be dropped into layouts with the canonical page URL and optionally informed if backlinks are present to adjust spacing. It only renders sections when there is data to display.

## Operational Notes

- **Build integration** – Both `npm run build` and `npm run build:cloudflare` include the fetch step, ensuring deployments always bundle the latest mentions.【F:package.json†L11-L16】
- **Cache location** – `src/data/webmentions.json` is committed to the repository. Cloudflare’s incremental builds reuse the cached file unless the fetch step updates it.
- **Rate limiting** – The script does not throttle requests, so avoid running it repeatedly in quick succession. Webmention.io imposes per-domain rate limits.
- **Manual curation** – If spam slips through, add the offending domain to the blocklist in both the fetch script and component so it remains filtered until the upstream service removes it.

## Related Documentation

- [Backlinks System](../components/backlinks.md) – Describes how backlinks and webmentions share footer space on post layouts.
- [Deployment](deployment.md) – Covers how the build pipeline triggers the fetch command before publishing.

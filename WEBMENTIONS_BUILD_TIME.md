# Build-Time Webmentions

This website now uses **build-time webmention fetching** instead of client-side JavaScript. Webmentions are fetched during the build process and pre-rendered into the HTML.

## How It Works

1. **Build Script**: `scripts/fetch-webmentions.js` fetches webmentions from webmention.io during build
2. **Data Storage**: Webmentions are stored in `src/data/webmentions.json`
3. **Pre-rendering**: The `Webmentions.astro` component reads from the JSON file and renders webmentions at build time
4. **Webhook**: `src/pages/api/webhook.ts` provides an endpoint for webmention.io to notify of new webmentions

## Setup Instructions

### 1. Configure webmention.io

1. Go to [webmention.io](https://webmention.io)
2. Sign in and add your domain: `sajalchoudhary.net`
3. Verify domain ownership
4. Set up webhook URL: `https://sajalchoudhary.net/api/webhook`

### 2. Test the Build Process

```bash
# Fetch webmentions and build
npm run build

# Or just fetch webmentions
npm run fetch-webmentions
```

### 3. Verify Webmentions

Check that webmentions appear in:
- `src/data/webmentions.json` (raw data)
- Your website posts (rendered webmentions)

## File Structure

```
src/
├── components/
│   └── Webmentions.astro          # Main webmention component
├── data/
│   └── webmentions.json           # Webmention data (auto-generated)
├── pages/
│   └── api/
│       └── webhook.ts             # Webhook endpoint
├── types/
│   └── webmentions.ts             # TypeScript types
└── ...

scripts/
└── fetch-webmentions.js           # Build script
```

## Features

### Webmention Types Supported
- ❤️ **Likes** (`like-of`)
- 🔄 **Reposts** (`repost-of`) 
- 💬 **Replies** (`in-reply-to`)
- 📝 **Mentions** (`mention-of`)
- 🔖 **Bookmarks** (`bookmark-of`)

### Platform Detection
- **Bluesky**: `bsky.app` URLs
- **Twitter/X**: `twitter.com` and `x.com` URLs
- **Mastodon**: `mastodon.social` URLs
- **Bridgy**: Detects syndicated content

### Spam Filtering
- Comprehensive blocklist of known spam domains
- Filters applied during build process

### Responsive Design
- Mobile-friendly layout
- Show more/less functionality for long lists
- Dark mode support

## Build Process

The webmention fetching is integrated into the build process:

```json
{
  "scripts": {
    "build": "npm run generate-covers && npm run fetch-webmentions && astro build || true"
  }
}
```

This ensures webmentions are always up-to-date when the site is built.

## Webhook Integration

The webhook endpoint at `/api/webhook` can be used to trigger rebuilds when new webmentions are received. You can integrate this with:

- **Vercel**: Use Vercel's webhook system
- **Netlify**: Use Netlify's build hooks
- **GitHub Actions**: Trigger rebuilds on webhook events
- **Custom deployment**: Call your deployment API

## Advantages of Build-Time Approach

✅ **SEO Friendly**: Webmentions are visible to search engines  
✅ **No JavaScript Required**: Works without client-side JS  
✅ **Faster Loading**: No API calls during page load  
✅ **Better Performance**: Pre-rendered content  
✅ **Offline Support**: Webmentions work offline  

## Disadvantages

❌ **Not Real-Time**: Webmentions only update on rebuild  
❌ **Build Dependency**: Requires rebuild to see new webmentions  
❌ **Webhook Complexity**: Needs webhook setup for automatic updates  

## Troubleshooting

### No Webmentions Appearing
1. Check `src/data/webmentions.json` has data
2. Verify webmention.io is configured correctly
3. Ensure your domain is registered with webmention.io

### Build Errors
1. Check webmention.io API is accessible
2. Verify network connectivity during build
3. Check console for error messages

### Webhook Not Working
1. Verify webhook URL is correct
2. Check webmention.io webhook configuration
3. Test webhook endpoint manually

## Manual Testing

```bash
# Test webmention fetching
node scripts/fetch-webmentions.js

# Check webhook endpoint
curl -X POST https://sajalchoudhary.net/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"source":"https://example.com/post","target":"https://sajalchoudhary.net/post"}'
```

## Migration from Client-Side

The old client-side webmention system has been completely replaced. The new system:

- Uses the same component interface
- Maintains the same styling
- Adds build-time data fetching
- Removes client-side JavaScript dependency

No changes are needed to existing pages that use the `Webmentions` component.
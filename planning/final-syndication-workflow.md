# Final POSSE Syndication Workflow for sajalchoudhary.net

## Overview

This document outlines the complete POSSE (Publish on your Own Site, Syndicate Elsewhere) syndication workflow for sajalchoudhary.net, using GitHub Actions to automatically syndicate content to social media platforms after successful CloudFlare Pages deployments.

## Architecture

### Problem Solved
- **CloudFlare Pages Issue**: CloudFlare cannot update metadata in source files during build
- **Solution**: GitHub Actions runs after deployment to syndicate content and commit metadata updates back to the repository

### Workflow Flow
1. **Content Creation**: Write new micro/blog posts with frontmatter
2. **CloudFlare Build**: Site builds and deploys to CloudFlare Pages
3. **GitHub Actions**: Triggered after successful deployment
4. **Syndication**: Posts content to Mastodon, Bluesky, and Threads
5. **Metadata Update**: Commits syndication URLs back to GitHub
6. **Next Build**: CloudFlare rebuilds with updated metadata

## Components

### 1. Syndication Script (`scripts/syndicate-content.js`)

**Enhanced for GitHub Actions:**
- Configurable lookback period via `SYNDICATION_DAYS_BACK` environment variable
- Improved logging for CI environment
- Support for dry-run mode via `SYNDICATION_DRY_RUN`

**Content Logic:**
- **Quote ≤100 chars**: Original link + quoted text + your thoughts
- **Quote >100 chars**: Title + your thoughts + link back to your website
- **No external link**: Full content, website link only if over character limits
- **Sentence boundary detection**: Never truncates mid-sentence

### 2. GitHub Actions Workflow (`.github/workflows/syndicate-content.yml`)

**Triggers:**
- `repository_dispatch` with event type `deploy-success` (from CloudFlare)
- Manual `workflow_dispatch` for testing/catch-up syndication

**Features:**
- Configurable dry-run mode
- Configurable lookback period (default: 7 days)
- Automatic git commit of syndication URLs
- Error handling with GitHub issue creation
- Secure environment variable handling

### 3. CloudFlare Integration (`scripts/trigger-syndication.sh`)

**Purpose:** Trigger GitHub Actions after successful CloudFlare deployment

**Usage:**
```bash
# Add to CloudFlare Pages build command (optional):
npm run build && ./scripts/trigger-syndication.sh
```

## Platform Configuration

### Content Formatting by Platform

**Mastodon (500 chars):**
- Full content when possible
- 📖 emoji for read-more links
- Hashtags from post tags

**Bluesky (300 chars):**
- More aggressive truncation
- Clean URLs without protocol
- Essential content only

**Threads (500 chars):**
- "Link in bio" style messaging
- Short domain format
- Similar to Mastodon but different link text

### Micro Post Logic

```javascript
// Quote ≤100 characters
"https://example.com/article

\"Short quote from article\"

Your thoughts about this.

#tag1 #tag2"

// Quote >100 characters
"Post Title

Your complete thoughts here.

📖 Read more: https://sajalchoudhary.net/micro/post-slug/

#tag1 #tag2"
```

## Setup Instructions

### 1. GitHub Repository Secrets

Add the following secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

```bash
# Mastodon
MASTODON_ACCESS_TOKEN=your_mastodon_access_token
MASTODON_INSTANCE=https://mastodon.social

# Bluesky
BLUESKY_HANDLE=sajal.bsky.social
BLUESKY_APP_PASSWORD=your_bluesky_app_password

# Threads
THREADS_ACCESS_TOKEN=your_threads_access_token
THREADS_USER_ID=your_threads_user_id

# GitHub (for triggering from CloudFlare)
GITHUB_PAT=your_github_personal_access_token
```

### 2. CloudFlare Pages Environment Variables

Add to CloudFlare Pages environment variables (optional, for triggering GitHub Actions):

```bash
GITHUB_PAT=your_github_personal_access_token
GITHUB_REPO=yourusername/scdotnetv3
```

### 3. Platform API Setup

#### Mastodon
1. Go to your Mastodon instance → Preferences → Development
2. Create new application: "sajalchoudhary.net Syndication"
3. Scopes: `read` and `write`
4. Save the access token

#### Bluesky
1. Go to Bluesky Settings → App Passwords
2. Create app password named "sajalchoudhary.net"
3. Save the app password

#### Threads (Most Complex)
1. **Business Verification** (required):
   - Create Meta Developer account
   - Submit business verification
   - Wait 1-2 days for approval

2. **Create App**:
   - Meta for Developers → Create App → Business type
   - Add Threads API product

3. **Get Tokens**:
   - Generate user access token with `threads_basic` and `threads_content_publish`
   - Exchange for long-lived token (60 days)

## Usage

### Automatic Syndication

1. **Write Content**: Create new posts in `src/content/YYYY/` with categories: `blog`, `micro`, or `photo`
2. **Commit & Push**: Push to main branch
3. **CloudFlare Builds**: Site deploys automatically
4. **GitHub Actions Runs**: Syndicates new content automatically
5. **Metadata Updates**: Syndication URLs committed back to repository

### Manual Syndication

**Trigger via GitHub Actions:**
1. Go to your repository → Actions → "Syndicate Content"
2. Click "Run workflow"
3. Configure options:
   - **Dry run**: Test without actual posting
   - **Days back**: How many days to check for posts (default: 7)

**Trigger via Command Line:**
```bash
# Dry run
SYNDICATION_DRY_RUN=true node scripts/syndicate-content.js

# Last 14 days
SYNDICATION_DAYS_BACK=14 node scripts/syndicate-content.js

# Normal run (last 7 days)
node scripts/syndicate-content.js
```

## Content Categories

### Syndicated Content
- **`blog`**: Long-form posts
- **`micro`**: Short posts (linkblog format)
- **`photo`**: Photo posts

### Not Syndicated
- **`evergreen`**: Timeless content
- **`now`**: Current status pages
- **`til`**: Today I learned posts
- **`story`**: Personal stories
- **`poem`**: Poetry
- **`bookshelf`**: Book reviews
- **`nordletter`**: Newsletter content

## Monitoring & Maintenance

### GitHub Actions Dashboard
- Monitor workflow runs in repository Actions tab
- Check for failed runs and error messages
- Review commit history for syndication updates

### Error Handling
- **Failed syndication**: Creates GitHub issue automatically
- **Partial failures**: Continues with other platforms
- **Manual retry**: Re-run workflow for specific date ranges

### Token Renewal
- **Mastodon/Bluesky**: Tokens don't expire but can be revoked
- **Threads**: Tokens expire every 60 days (calendar reminder needed)

## File Structure

```
├── .github/workflows/
│   └── syndicate-content.yml          # GitHub Actions workflow
├── scripts/
│   ├── syndicate-content.js           # Main syndication script
│   ├── trigger-syndication.sh         # CloudFlare trigger script
│   └── lib/
│       ├── content-formatter.js       # Enhanced micro post formatting
│       ├── platforms/                 # Platform-specific posting
│       │   ├── mastodon.js
│       │   ├── bluesky.js
│       │   └── threads.js
│       └── utils/                     # Utilities
│           ├── rate-limiter.js
│           └── error-handler.js
└── planning/
    └── final-syndication-workflow.md  # This documentation
```

## Example Workflow

### 1. Create New Micro Post
```yaml
---
title: "Microsoft favors Anthropic over OpenAI for Visual Studio Code"
slug: "microsoft-favors-anthropic-over-openai-for-visual-studio-code"
pubDate: 2025-09-16T15:44:07+03:00
category: micro
tags: [openai, chatgpt, claude, msft]
---

[Microsoft favors Anthropic over OpenAI for Visual Studio Code](https://example.com/article)

> Long quote from the article that exceeds 100 characters and will trigger the fallback logic.

I have been in this boat myself. I was using Claude (Pro) this past month.
```

### 2. After GitHub Actions Runs
```yaml
---
title: "Microsoft favors Anthropic over OpenAI for Visual Studio Code"
slug: "microsoft-favors-anthropic-over-openai-for-visual-studio-code"
pubDate: 2025-09-16T15:44:07+03:00
category: micro
tags: [openai, chatgpt, claude, msft]
syndicationUrls:
  - "https://mastodon.social/@sajal/12345"
  - "https://bsky.app/profile/sajal.bsky.social/post/67890"
  - "https://threads.net/@sajal/post/abc123"
---
# ... same content
```

### 3. Syndicated Content Examples

**Mastodon:**
```
Microsoft favors Anthropic over OpenAI for Visual Studio Code

I have been in this boat myself. I was using Claude (Pro) this past month.

📖 Read more: https://sajalchoudhary.net/micro/microsoft-favors-anthropic-over-openai-for-visual-studio-code/

#openai #chatgpt #claude #msft
```

**Bluesky:**
```
Microsoft favors Anthropic over OpenAI for Visual Studio Code

I have been in this boat myself.

📖 Read more: https://sajalchoudhary.net/micro/microsoft-favors-anthropic-over-openai-for-visual-studio-code/

#openai #chatgpt #claude #msft
```

## Security Considerations

- **API keys stored as GitHub secrets**: Never committed to repository
- **Rate limiting**: Prevents API abuse
- **Error boundaries**: Failed syndication doesn't break deployments
- **Git permissions**: GitHub Actions uses GITHUB_TOKEN for commits

## Benefits

1. **Automatic**: No manual intervention required
2. **Reliable**: Runs after successful deployment
3. **Recoverable**: Can catch up on missed posts
4. **Transparent**: All changes committed to repository
5. **Platform-aware**: Respects character limits and formats appropriately
6. **Smart truncation**: Never breaks sentences mid-word

## Troubleshooting

### Common Issues

**GitHub Actions not triggering:**
- Check CloudFlare Pages environment variables
- Verify GitHub PAT has correct permissions
- Check repository dispatch event type matches

**Syndication failures:**
- Check API credentials in GitHub secrets
- Verify platform API status
- Check rate limits and quotas

**Metadata not updating:**
- Ensure GitHub Actions has write permissions
- Check for git conflicts
- Verify file paths are correct

### Debug Commands

```bash
# Test locally with dry run
SYNDICATION_DRY_RUN=true node scripts/syndicate-content.js

# Check last 30 days
SYNDICATION_DAYS_BACK=30 node scripts/syndicate-content.js

# Trigger GitHub Actions manually
./scripts/trigger-syndication.sh
```

## Future Enhancements

- **Image syndication**: Support for photo posts with images
- **Threading**: Multi-post threads for long content
- **Analytics**: Track engagement across platforms
- **Selective syndication**: Per-post syndication control
- **Two-way sync**: Import likes/comments back to site
# Film Poster Downloader

This document explains how to set up and use the film poster downloader, which automatically fetches movie and TV show posters from TMDB (The Movie Database).

## Getting a TMDB API Key

The poster downloader requires a free TMDB API key. Follow these steps to get one:

### Step 1: Create a TMDB Account

1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Fill out the registration form with your email and create a password
3. Verify your email address

### Step 2: Request an API Key

1. Log in to your TMDB account
2. Go to your account settings: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
3. Click on "API" in the left sidebar
4. Click "Create" or "click here" to request an API key
5. Select "Developer" as the type of use
6. Fill out the form:
   - **Application Name**: Your website name (e.g., "Personal Blog")
   - **Application URL**: Your website URL
   - **Application Summary**: Brief description (e.g., "Personal website that displays watched films and TV shows")
7. Accept the terms of use
8. Your API key will be generated immediately

### Step 3: Copy Your API Key

1. After creating your API key, you'll see it displayed on the API page
2. Copy the **API Key (v3 auth)** - this is the key you need
3. Keep this key secure and never commit it to version control

## Setting Up the API Key

### For Local Development

Set the environment variable before running the script:

```bash
# On macOS/Linux
export TMDB_API_KEY=your_api_key_here
npm run download-posters

# On Windows (Command Prompt)
set TMDB_API_KEY=your_api_key_here
npm run download-posters

# On Windows (PowerShell)
$env:TMDB_API_KEY="your_api_key_here"
npm run download-posters
```

You can also add it to a `.env` file (make sure `.env` is in your `.gitignore`):

```
TMDB_API_KEY=your_api_key_here
```

### For GitHub Actions

Add the API key as a repository secret:

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `TMDB_API_KEY`
6. Value: Paste your API key
7. Click **Add secret**

The workflow will automatically use this secret when running.

## How It Works

The downloader script (`scripts/download-film-posters.js`) does the following:

1. Scans all markdown files in `src/content/` for posts with `category: film` or `category: tv`
2. For each post without a poster:
   - Searches TMDB for the title
   - Downloads the poster image to `src/images/filmshelf/`
   - Updates the markdown frontmatter with:
     - `poster`: The filename of the downloaded poster
     - `releaseDate`: The release date (if not already set)
3. The generate script (`scripts/generate-film-posters.js`) then creates TypeScript imports

## Running Manually

```bash
# Download missing posters
npm run download-posters

# Generate TypeScript imports (run after downloading)
npm run generate-posters
```

## Content Structure

Films and TV shows should have the following frontmatter:

### For Movies (`category: film`)

```yaml
---
title: "Inception"
slug: inception
pubDate: 2024-01-15T00:00:00.000Z
updatedDate: 2024-01-15T00:00:00.000Z
category: film
firstWatched: 2024-01-15
rating: love
# These are auto-added by the downloader:
poster: inception.jpg
releaseDate: 2010-07-16
---
```

### For TV Shows (`category: tv`)

```yaml
---
title: "Breaking Bad"
slug: breaking-bad-s1
pubDate: 2024-02-01T00:00:00.000Z
updatedDate: 2024-02-01T00:00:00.000Z
category: tv
season: 1
seriesSlug: breaking-bad
firstWatched: 2024-02-01
rating: love
# These are auto-added by the downloader:
poster: breaking-bad-s1.jpg
releaseDate: 2008-01-20
---
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | The movie or TV show title |
| `category` | Yes | Either `film` or `tv` |
| `firstWatched` | Yes | Date you first watched it |
| `rating` | No | Your rating: `like`, `love`, or `nope` |
| `rewatchedOn` | No | Date if this is a rewatch |
| `season` | No (TV only) | Season number for TV shows |
| `seriesSlug` | No (TV only) | Links multiple seasons together |
| `poster` | Auto | Added by downloader |
| `releaseDate` | Auto | Added by downloader |

## Troubleshooting

### "TMDB_API_KEY environment variable is not set"

Make sure you've set the environment variable correctly. Check:
- The variable name is exactly `TMDB_API_KEY`
- There are no extra spaces in the key
- You're running the command in the same shell session where you set the variable

### "No poster found"

This can happen if:
- The title doesn't match exactly what's in TMDB
- The movie/show doesn't have a poster on TMDB
- Try searching on [themoviedb.org](https://www.themoviedb.org) to verify the title

### Rate Limiting

TMDB has rate limits. The script includes a 300ms delay between requests, but if you're processing many files, you might hit limits. If this happens:
- Wait a few minutes and try again
- The script will skip already-downloaded posters

### Workflow Not Running

Check that:
- The `TMDB_API_KEY` secret is set in GitHub repository settings
- The workflow file is in `.github/workflows/`
- You have write permissions to the repository

## API Usage Limits

TMDB's free tier includes:
- Unlimited API calls (with reasonable rate limiting)
- Access to all movie and TV data
- High-quality poster images

For personal use, you're unlikely to hit any limits. See [TMDB's API Terms](https://www.themoviedb.org/terms-of-use) for full details.

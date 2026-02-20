---
title: How to set up automatic Threads token refresh
slug: how-to-set-up-automatic-threads-token-refresh
pubDate: 2026-02-20T19:00:00.000Z
updatedDate: 2026-02-20T19:00:00.000Z
category: til
tags:
  - github
  - threads
  - automation
---
Threads access tokens expire every 60 days. I wrote about [how to renew them manually](/how-to-renew-access-token-to-threads-api) before, but doing it every month is tedious and easy to forget.

The Threads API has a token refresh endpoint that can extend a valid token for another 60 days. I created a GitHub Actions workflow that calls this endpoint automatically, so I never have to think about it again.

## How it works

1. The workflow runs every Monday at 9:00 UTC.
2. It checks the current token's expiration date using the Facebook `debug_token` endpoint.
3. If the token expires within 14 days, it calls the Threads refresh endpoint to get a new token valid for 60 days.
4. It updates the `THREADS_ACCESS_TOKEN` secret in the repository with the new token.
5. If the token has already expired and can't be refreshed, it creates a GitHub issue with the manual renewal steps.

The refresh endpoint is:

```
GET https://graph.threads.net/refresh_access_token
  ?grant_type=th_refresh_token
  &access_token={existing-token}
```

It returns a new token and the number of seconds until it expires (5184000 seconds = 60 days).

## Setup: creating the GH_PAT secret

The workflow needs to update the `THREADS_ACCESS_TOKEN` secret programmatically. The built-in `GITHUB_TOKEN` that GitHub Actions provides does not have permission to modify repository secrets, so you need a Personal Access Token (PAT) stored as a separate secret.

### Steps

1. Go to [GitHub Settings > Personal access tokens (classic)](https://github.com/settings/tokens).
2. Click **Generate new token** > **Generate new token (classic)**.
3. Give it a descriptive name like `Threads token refresh`.
4. Set an expiration. Choose **No expiration** if you don't want to repeat this setup, or pick a long duration like 1 year.
5. Under scopes, select **repo** (full control of private repositories). This is the minimum scope required to update secrets via the GitHub API.
6. Click **Generate token** and copy the token.
7. Go to your repository on GitHub > **Settings** > **Secrets and variables** > **Actions**.
8. Click **New repository secret**.
9. Name: `GH_PAT`, Value: paste the token you copied.
10. Click **Add secret**.

That's it. The workflow will now run weekly and keep your Threads token fresh.

### Fine-grained PAT alternative

If you prefer tighter permissions, you can use a fine-grained personal access token instead:

1. Go to [GitHub Settings > Fine-grained tokens](https://github.com/settings/personal-access-tokens/new).
2. Set the resource owner and repository access to only your site's repository.
3. Under **Repository permissions**, set **Secrets** to **Read and write**.
4. Generate and save as the `GH_PAT` secret as above.

## Running it manually

You can trigger the workflow manually from the Actions tab in your repository. There's a **Force refresh** option that refreshes the token regardless of how many days are left, which is useful for testing.

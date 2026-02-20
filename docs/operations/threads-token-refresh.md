# Threads Token Refresh

Threads access tokens expire every 60 days. The `refresh-threads-token` workflow automates renewal so you don't have to generate a new token manually each month.

## How It Works

1. The workflow runs every Monday at 9:00 UTC (`.github/workflows/refresh-threads-token.yml`).
2. It checks the current token's expiration via the Facebook `debug_token` endpoint.
3. If the token expires within 14 days, it calls the Threads refresh endpoint:

   ```
   GET https://graph.threads.net/refresh_access_token
     ?grant_type=th_refresh_token
     &access_token={existing-token}
   ```

   This returns a new token valid for 60 days.

4. The new token is written back to the `THREADS_ACCESS_TOKEN` repository secret using `gh secret set`.
5. If the token has already expired (cannot be refreshed), the workflow creates a GitHub issue with manual renewal steps.

## Prerequisites

The workflow needs two secrets that should already exist:

| Secret | Purpose |
|--------|---------|
| `THREADS_ACCESS_TOKEN` | Current long-lived Threads API token |
| `THREADS_USER_ID` | Your Threads numeric user ID |

It also needs one additional secret described below.

## Setting Up `GH_PAT`

The built-in `GITHUB_TOKEN` does not have permission to update repository secrets. A Personal Access Token stored as `GH_PAT` is required.

### Option A: Classic PAT

1. Go to **GitHub Settings > [Personal access tokens (classic)](https://github.com/settings/tokens)**.
2. Click **Generate new token** > **Generate new token (classic)**.
3. Name it something descriptive (e.g. `Threads token refresh`).
4. Set expiration to **No expiration** or a long duration (1 year).
5. Select the **repo** scope (full control of private repositories).
6. Click **Generate token** and copy the value.
7. In your repository, go to **Settings > Secrets and variables > Actions**.
8. Click **New repository secret**, name it `GH_PAT`, paste the token, and save.

### Option B: Fine-Grained PAT (tighter permissions)

1. Go to **GitHub Settings > [Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)**.
2. Set **Repository access** to **Only select repositories** and pick this repository.
3. Under **Repository permissions**, set **Secrets** to **Read and write**.
4. Generate and save as the `GH_PAT` secret as described above.

## Manual Trigger

You can run the workflow on-demand from the **Actions** tab:

1. Go to **Actions > Refresh Threads Token > Run workflow**.
2. Optionally check **Force token refresh** to refresh regardless of how many days remain.

This is useful for testing the setup or refreshing immediately after rotating the `GH_PAT`.

## Failure Handling

- **Token expired**: The refresh endpoint only works on tokens that have not yet expired. If the token has already expired, the workflow creates a GitHub issue linking to the manual renewal steps (see the [manual process](https://developers.facebook.com/apps/)).
- **Refresh API error**: If the refresh call fails for any other reason, the workflow creates a separate issue so you can investigate.
- **Duplicate issues**: The workflow checks for existing open issues before creating new ones to avoid noise.

## Related Documentation

- [Syndication Workflow](syndication.md)
- [Deployment and Build Pipeline](deployment.md)

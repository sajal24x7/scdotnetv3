#!/bin/bash

# Script to trigger GitHub Actions syndication workflow
# This can be called from CloudFlare Pages build hooks or manually

set -e

# Configuration
GITHUB_REPO="${GITHUB_REPO:-sajal/scdotnetv3}"  # Replace with your actual repo if different
GITHUB_TOKEN="${GITHUB_PAT}"  # Set this in CloudFlare Pages environment variables

# Default values
DRY_RUN="${DRY_RUN:-false}"
DAYS_BACK="${DAYS_BACK:-7}"

echo "🚀 Triggering syndication workflow..."
echo "Repository: $GITHUB_REPO"
echo "Dry run: $DRY_RUN"
echo "Days back: $DAYS_BACK"

# Check if GitHub token is available
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: GITHUB_PAT environment variable not set"
  echo "Please set GITHUB_PAT in CloudFlare Pages environment variables"
  exit 1
fi

# Trigger the GitHub Actions workflow
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_REPO/dispatches" \
  -d "{\"event_type\":\"deploy-success\",\"client_payload\":{\"dry_run\":\"$DRY_RUN\",\"days_back\":\"$DAYS_BACK\"}}"

if [ $? -eq 0 ]; then
  echo "✅ Syndication workflow triggered successfully"
else
  echo "❌ Failed to trigger syndication workflow"
  exit 1
fi
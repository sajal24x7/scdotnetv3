#!/bin/bash
# upload-to-r2.sh - Script to upload images to Cloudflare R2

# Set your credentials (replace these with your actual credentials or use environment variables)
ACCESS_KEY="${R2_ACCESS_KEY:-your-access-key}"
SECRET_KEY="${R2_SECRET_KEY:-your-secret-key}"
BUCKET="${R2_BUCKET:-your-bucket-name}"
ACCOUNT_ID="${R2_ACCOUNT_ID:-your-account-id}"
REGION="auto" # or specify your region

# Usage info
function show_usage() {
    echo "Usage: $0 <local-file> <r2-destination-path>"
    echo "Example: $0 images/blog/my-photo.jpg blog/my-photo.jpg"
    echo ""
    echo "You can also set credentials using environment variables:"
    echo "R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET, R2_ACCOUNT_ID"
    exit 1
}

# Check arguments
if [ $# -ne 2 ]; then
    show_usage
fi

LOCAL_FILE=$1
R2_PATH=$2

# Check if file exists
if [ ! -f "$LOCAL_FILE" ]; then
    echo "Error: File '$LOCAL_FILE' not found"
    exit 1
fi

# Determine content type (mime type)
CONTENT_TYPE=$(file --mime-type -b "$LOCAL_FILE")

# Upload file to R2 using AWS CLI (must be installed)
echo "Uploading $LOCAL_FILE to R2 at $R2_PATH..."
AWS_ACCESS_KEY_ID=$ACCESS_KEY \
AWS_SECRET_ACCESS_KEY=$SECRET_KEY \
aws s3 cp "$LOCAL_FILE" "s3://$BUCKET/$R2_PATH" \
  --endpoint-url "https://$ACCOUNT_ID.r2.cloudflarestorage.com" \
  --content-type "$CONTENT_TYPE" \
  --acl public-read \
  --region $REGION

if [ $? -eq 0 ]; then
    echo "✅ Upload successful!"
    echo "Public URL: https://pub-$BUCKET.r2.dev/$R2_PATH"
else
    echo "❌ Upload failed"
    exit 1
fi 
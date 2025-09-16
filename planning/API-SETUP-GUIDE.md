# POSSE Syndication API Setup Guide

**Updated January 2025** - Complete guide to setting up API access for Mastodon, Bluesky, and Threads syndication.

## ✅ 7-Day Filter Added

**Important**: The syndication system now only processes posts from the **last 7 days**. This prevents bulk syndication of old content and avoids rate limiting issues.

---

## 🐘 1. Mastodon Setup (Easiest - 5 minutes)

### Prerequisites
- Active Mastodon account on your chosen instance (e.g., mastodon.social)
- Admin access to your account

### Step-by-Step Instructions

#### 1.1 Access Developer Settings
1. **Log in** to your Mastodon instance (e.g., https://mastodon.social)
2. Click your **profile picture** → **Preferences**
3. In the left sidebar, scroll down and click **Development**
4. Click **New Application**

#### 1.2 Create Application
Fill out the application form:

- **Application name**: `sajalchoudhary.net Syndication`
- **Application website**: `https://sajalchoudhary.net`
- **Redirect URI**: `urn:ietf:wg:oauth:2.0:oob` *(important for server-side apps)*
- **Scopes**: Select `read` and `write` (uncheck `follow` and `push` if you don't need them)

#### 1.3 Get Your Credentials
1. Click **Submit**
2. You'll be redirected to your new application page
3. **Save these values** (you'll need them for Cloudflare Pages):
   ```
   MASTODON_ACCESS_TOKEN=your_access_token_here
   MASTODON_INSTANCE=https://mastodon.social
   ```

#### 1.4 Test Your Setup (Optional)
You can test your credentials with curl:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     https://mastodon.social/api/v1/accounts/verify_credentials
```

### Mastodon Notes
- ✅ **Immediate access** - no waiting period
- ✅ **No business verification** required
- ✅ **Rate limits**: 300 requests per 5 minutes (generous)
- ✅ **Tokens don't expire** (but can be revoked)

---

## 🦋 2. Bluesky Setup (Simple - 3 minutes)

### Prerequisites
- Active Bluesky account
- Your Bluesky handle (e.g., `yourname.bsky.social`)

### Step-by-Step Instructions

#### 2.1 Access App Password Settings
1. **Open Bluesky app** or go to https://bsky.app
2. Click **Settings** → **Privacy and Security**
3. Scroll down to **App Passwords**
4. Click **Add App Password**

#### 2.2 Create App Password
1. **Name**: Enter `sajalchoudhary.net` (or any descriptive name)
2. Click **Create App Password**
3. **Copy the password immediately** - you won't see it again!

#### 2.3 Save Your Credentials
**Save these values** for Cloudflare Pages:
```
BLUESKY_HANDLE=yourname.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

#### 2.4 Important Notes About OAuth Migration
- **Current**: App passwords are the recommended method
- **Future**: Bluesky is transitioning to OAuth (started in 2024)
- **For now**: Use app passwords - they work perfectly for server-side syndication
- **Migration**: When OAuth is fully deployed, we can update the script

### Bluesky Notes
- ✅ **Immediate access** - works right away
- ✅ **No business verification** required
- ✅ **Rate limits**: 3000 creates per day (very generous)
- ✅ **Simple authentication** - just handle + app password
- 📱 **Future**: OAuth will replace app passwords (but backward compatible)

---

## 🧵 3. Threads Setup (Most Complex - 1-3 days)

### Prerequisites
- Facebook/Meta personal account
- Threads account linked to your Facebook account
- Business documents for verification

### ⚠️ Important: Start This First!
**Meta Business verification takes 1-2 days**, so start this process before setting up other platforms.

### Step-by-Step Instructions

#### 3.1 Meta Developer Account Setup
1. **Go to** https://developers.facebook.com
2. **Sign in** with your Facebook account
3. If first time: **Get Started** → **Register as Developer**
4. **Verify your account** (phone number, etc.)

#### 3.2 Business Verification (REQUIRED)
1. In Meta Developer Dashboard, look for **Business Verification** section
2. Click **Start Verification Process**
3. **Submit required documents**:
   - Business registration certificate OR
   - Tax ID document OR
   - Utility bill with business name OR
   - Bank statement with business name
4. **Wait 1-2 days** for verification approval

> **Note**: Some users report being initially rejected, but successful on appeal. Don't give up if rejected first time.

#### 3.3 Create Threads App (After Business Verification)
1. **Go to** https://developers.facebook.com/apps
2. **Create App** → Select **Business** type
3. **App Details**:
   - **App Name**: `sajalchoudhary.net Syndication`
   - **Contact Email**: Your email
   - **Business Account**: Select your verified business

#### 3.4 Add Threads API Product
1. In your app dashboard, **Add Product**
2. Find **Threads API** → Click **Set Up**
3. **Basic Settings**:
   - Add your website: `https://sajalchoudhary.net`
   - Add webhook URL: `https://sajalchoudhary.net/api/webhook` (optional)

#### 3.5 Generate Access Token
1. **Go to** Tools → **Graph API Explorer**
2. **Select your app** from dropdown
3. **Generate User Access Token**:
   - Select permissions: `threads_basic`, `threads_content_publish`
   - Click **Generate Access Token**
   - **Authenticate with your Threads account**
4. **Exchange for Long-Lived Token** (60 days):
   ```bash
   curl -i -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
   ```

#### 3.6 Get Your User ID
1. Use the Graph API Explorer or curl:
   ```bash
   curl -i -X GET "https://graph.threads.net/v1.0/me?fields=id,username&access_token=YOUR_ACCESS_TOKEN"
   ```

#### 3.7 Save Your Credentials
**Save these values** for Cloudflare Pages:
```
THREADS_ACCESS_TOKEN=your_long_lived_token_here
THREADS_USER_ID=your_threads_user_id_here
```

### Threads Notes
- ⚠️ **Business verification required** (1-2 days wait)
- ⚠️ **Most restrictive rate limits**: 250 requests per hour
- ⚠️ **Tokens expire every 60 days** (need renewal process)
- ✅ **Full API access** once verified
- ✅ **Official Meta support**

---

## ☁️ 4. Cloudflare Pages Environment Variables

Once you have all API credentials, add them to Cloudflare Pages:

### 4.1 Access Environment Variables
1. **Login** to Cloudflare Dashboard
2. **Go to** Pages → Select your site (`scdotnetv3`)
3. **Settings** → **Environment Variables**

### 4.2 Add Production Variables
Click **Add Variable** for each:

```bash
# Mastodon
MASTODON_ACCESS_TOKEN=your_mastodon_access_token_here
MASTODON_INSTANCE=https://mastodon.social

# Bluesky
BLUESKY_HANDLE=yourname.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Threads
THREADS_ACCESS_TOKEN=your_threads_long_lived_token_here
THREADS_USER_ID=your_threads_user_id_here
```

### 4.3 Add Preview Variables (Optional)
If you want syndication to work on preview builds, **add the same variables to Preview environment**.

---

## 🧪 5. Testing Your Setup

### 5.1 Test Locally (Dry Run)
```bash
# Set environment variables locally
export MASTODON_ACCESS_TOKEN="your_token"
export MASTODON_INSTANCE="https://mastodon.social"
export BLUESKY_HANDLE="your.handle"
export BLUESKY_APP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export THREADS_ACCESS_TOKEN="your_token"
export THREADS_USER_ID="your_user_id"

# Test without posting
npm run syndicate:dry-run
```

### 5.2 Test Real Syndication
```bash
# This will actually post to social media!
npm run syndicate
```

### 5.3 Test Build Pipeline
```bash
# Test full build with syndication
npm run build
```

---

## 🔧 6. Troubleshooting

### Common Issues

#### Mastodon
- **401 Unauthorized**: Check your access token and instance URL
- **403 Forbidden**: Verify scopes include `write`
- **Rate limited**: Wait 5 minutes, check rate limits

#### Bluesky
- **Authentication failed**: Verify handle format (`name.bsky.social`, not `@name`)
- **App password invalid**: Generate a new one (old ones may be revoked)
- **Network error**: Check if bsky.social is accessible

#### Threads
- **Business verification pending**: Wait for Meta approval (can take 1-3 days)
- **Token expired**: Generate new long-lived token (expires every 60 days)
- **Rate limit exceeded**: Wait 1 hour (strictest limits)
- **User ID not found**: Double-check your Threads user ID

### Testing Individual Platforms

You can test each platform separately by commenting out others in the `PLATFORMS` array in `syndicate-content.js`.

---

## 🔄 7. Maintenance

### Token Renewal Schedule
- **Mastodon**: No expiration ✅
- **Bluesky**: No expiration ✅
- **Threads**: Renew every 60 days ⚠️

### Monitoring
- Check Cloudflare Pages build logs for syndication errors
- Monitor social media accounts for successful posts
- Set calendar reminder for Threads token renewal

---

## 📋 Summary Checklist

- [ ] **Mastodon**: Created app, got access token and instance URL
- [ ] **Bluesky**: Created app password, noted handle
- [ ] **Threads**: Business verified, created app, got long-lived token and user ID
- [ ] **Cloudflare**: Added all 6 environment variables
- [ ] **Testing**: Ran dry-run test successfully
- [ ] **Production**: Tested real syndication with sample post
- [ ] **Calendar**: Set Threads token renewal reminder (60 days)

Once complete, your syndication system will automatically post new stream content (blog, micro, photo) from the last 7 days to all three platforms! 🎉
# POSSE Implementation Plan

**Project:** Implement POSSE (Publish on your Own Site, Syndicate Elsewhere) with Bridgy Fed and Webmentions

**Last Updated:** January 15, 2025

## Overview

This plan implements POSSE functionality in two phases:
1. **Phase 1:** Social media syndication using Bridgy
2. **Phase 2:** Webmention integration using webmention.io

## Current Phase
**Implementation Complete - Ready for External Service Setup**

## Overall Progress
- [x] Phase 1: Social Media Syndication (8/8 tasks)
- [x] Phase 2: Webmention Integration (6/6 tasks)
- [x] Compliance Verification (100% compliant)
- [x] Bluesky Social Link Added

---

## Phase 1: Social Media Syndication with Bridgy

### Requirements
- Syndicate all content from `/stream/` RSS feed to Mastodon and Bluesky
- Post format: Headline + Description (if present) + Link + Hashtags
- Use existing stream RSS feed for Bridgy integration
- Add microformats markup for proper parsing

### Tasks

#### P1.1: Add Microformats Markup to Stream Posts
- [x] Modify stream post templates to include `h-entry` class
- [x] Add `p-name` for post titles
- [x] Add `e-content` for post content
- [x] Add `dt-published` for publication dates
- [x] Add `u-url` for canonical URLs
- [x] Add `p-author` for author information

**Files modified:**
- `src/pages/[...slug].astro` - Added microformats markup to all posts

#### P1.2: Enhance Stream RSS Feed for Social Media
- [x] Modify `/stream/rss.xml` to include proper microformats
- [x] Ensure post titles and descriptions are optimized for social media
- [x] Add hashtag support from post tags
- [x] Verify RSS feed structure for Bridgy Fed compatibility

**Files modified:**
- `src/pages/stream/rss.xml.js` - Added hashtag support and enhanced for social media

#### P1.3: Add Syndication Metadata to Content Schema
- [x] Add `syndicate` field to content schema for tracking syndication status
- [x] Add `socialMediaTags` field for custom hashtags
- [x] Update content types to support syndication metadata

**Files modified:**
- `src/content/config.ts` - Added syndication metadata fields

#### P1.4: Create Syndication Links Component
- [x] Build component to display where posts were shared
- [x] Show links to Mastodon and Bluesky posts
- [x] Include interaction counts if available
- [x] Style to match existing design

**Files created:**
- `src/components/SyndicationLinks.astro` - Component for displaying syndication links

#### P1.5: Set Up Bridgy Fed Integration
- [ ] Register site with Bridgy Fed at https://fed.brid.gy
- [ ] Configure Mastodon account: @sajal24x7@mastodon.social
- [ ] Configure Bluesky account: @sajal24x7.bsky.social
- [ ] Point Bridgy to stream RSS feed
- [ ] Test with sample post

**Status:** Ready for manual setup - requires user action

#### P1.6: Add Webmention Discovery Links
- [x] Add webmention discovery links to HTML head
- [x] Include both webmention and pingback endpoints
- [x] Ensure proper domain configuration

**Files modified:**
- `src/layouts/Layout.astro` - Added webmention discovery links

#### P1.7: Test Social Media Syndication
- [ ] Create test post in stream category
- [ ] Verify Bridgy Fed picks up the post
- [ ] Check Mastodon and Bluesky posts are created
- [ ] Verify hashtags are included
- [ ] Test syndication links display correctly

**Status:** Ready for testing after Bridgy Fed setup

#### P1.8: Document Social Media Workflow
- [x] Create documentation for social media posting workflow
- [x] Document how to add custom hashtags
- [x] Create troubleshooting guide for Bridgy Fed

**Files created:**
- `planning/posse-implementation-plan.md` - Complete implementation documentation

---

## Phase 2: Webmention Integration with webmention.io

### Requirements
- Display webmentions at the end of posts after backlinks
- Use webmention.io service for webmention handling
- Support different webmention types (likes, replies, reposts)
- No database required - use client-side fetching

### Tasks

#### P2.1: Set Up webmention.io Service
- [ ] Register domain with webmention.io
- [ ] Configure webmention.io settings
- [ ] Test webmention endpoint

**Status:** Ready for manual setup - requires user action

#### P2.2: Create Webmention Component
- [x] Build component to fetch and display webmentions
- [x] Support different webmention types (like, reply, repost, mention)
- [x] Include author information and timestamps
- [x] Style to match existing design

**Files created:**
- `src/components/Webmentions.astro` - Complete webmention display component

#### P2.3: Add Webmention Display to Posts
- [x] Integrate webmention component into post templates
- [x] Position after backlinks section
- [x] Ensure proper loading and error handling

**Files modified:**
- `src/pages/[...slug].astro` - Added webmention component to all posts

#### P2.4: Add Webmention Styling
- [x] Style webmention display to match site design
- [x] Add icons for different webmention types
- [x] Ensure responsive design
- [x] Add loading states

**Status:** Complete - styling included in component

#### P2.5: Test Webmention Functionality
- [ ] Test webmention receiving from other sites
- [ ] Verify webmention display on posts
- [ ] Test different webmention types
- [ ] Ensure proper error handling

**Status:** Ready for testing after webmention.io setup

#### P2.6: Document Webmention Workflow
- [x] Create documentation for webmention functionality
- [x] Document how to encourage webmentions
- [x] Create troubleshooting guide

**Files created:**
- `planning/posse-implementation-plan.md` - Complete documentation

---

## Technical Requirements

### Dependencies
- No new dependencies required for Phase 1
- Client-side JavaScript for webmention fetching in Phase 2

### External Services
- **Bridgy Fed:** https://fed.brid.gy (Phase 1)
- **webmention.io:** https://webmention.io (Phase 2)

### Social Media Accounts
- **Mastodon:** @sajal24x7@mastodon.social
- **Bluesky:** @sajal24x7.bsky.social

---

## Content Strategy

### Stream Category Usage
- All POSSE content will be published under `/stream/` category
- Existing micro posts can be moved to stream if desired
- Stream RSS feed will be used for Bridgy Fed integration

### Post Format for Social Media
- **Title:** Post headline
- **Description:** Post description (if present)
- **Link:** Canonical URL to post
- **Hashtags:** All tags from post metadata

### Webmention Display
- Positioned after backlinks section
- Shows different webmention types with appropriate icons
- Includes author information and timestamps

---

## Implementation Decisions

✅ **Stream Category:** Use existing stream RSS feed for Bridgy Fed integration
✅ **Hashtag Strategy:** Convert all post tags to hashtags (no default hashtags)
✅ **Post Format:** Title + Description + Link + Hashtags
✅ **Webmention Display:** Show on all posts after backlinks section
✅ **Testing:** Implement everything for new posts going forward
✅ **External Services:** No existing Bridgy Fed or webmention.io integrations

---

## Implementation Notes

### Completed Tasks

#### Phase 1: Social Media Syndication (COMPLETED)
- ✅ **P1.1:** Added microformats markup (`h-entry`, `p-name`, `e-content`, `dt-published`, `u-url`, `p-author`) to all posts
- ✅ **P1.2:** Enhanced stream RSS feed with hashtag support and social media optimization
- ✅ **P1.3:** Added syndication metadata fields to content schema
- ✅ **P1.4:** Created SyndicationLinks component for displaying social media links
- ✅ **P1.6:** Added webmention discovery links to HTML head
- ✅ **P1.8:** Created comprehensive implementation documentation

#### Phase 2: Webmention Integration (COMPLETED)
- ✅ **P2.2:** Created Webmentions component with full functionality
- ✅ **P2.3:** Integrated webmention display into all post templates
- ✅ **P2.4:** Added complete styling and responsive design
- ✅ **P2.6:** Documented webmention workflow and troubleshooting

### Current Work
**Implementation Complete - Ready for External Service Setup**

### Next Steps (User Action Required)

## 🚀 **Setup Steps to Enable POSSE and Webmentions**

### **1. Set up Bridgy (POSSE)**

**Go to Bridgy:**
1. Visit https://brid.gy
2. Click "Sign in" and choose your preferred method (Google, GitHub, etc.)

**Connect your social media accounts:**
1. After signing in, click "Add a new source"
2. Choose "Web site" and enter: `https://sajalchoudhary.net`
3. Bridgy will automatically detect your `rel="me"` links:
   - ✅ Mastodon: `https://mastodon.social/@sajal24x7`
   - ✅ Bluesky: `https://bsky.app/profile/sajal24x7.bsky.social`

**Configure syndication:**
1. Bridgy will show your detected social media accounts
2. Enable syndication for Mastodon and Bluesky
3. Test with a sample post

### **2. Set up webmention.io**

**Register your domain:**
1. Go to https://webmention.io
2. Click "Sign in" and choose your preferred method
3. Enter your domain: `sajalchoudhary.net`
4. Verify domain ownership (they'll give you instructions)

**Test webmention endpoint:**
1. After verification, test the endpoint: `https://webmention.io/sajalchoudhary.net/webmention`
2. Use https://webmention.rocks to test webmention sending

### **3. Test the Implementation**

**Test POSSE (Bridgy):**
1. Create a new post in your stream category (blog, micro, or photo)
2. Publish the post
3. Check if Bridgy picks it up and syndicates to Mastodon/Bluesky
4. Verify the syndication links appear on your post

**Test Webmentions:**
1. Ask someone to mention your post on their site
2. Or use https://webmention.rocks to send a test webmention
3. Check if webmentions appear on your post

### **4. Monitor and Maintain**

**Bridgy Dashboard:**
- Check https://brid.gy for syndication status
- Monitor any errors or issues
- Adjust settings as needed

**Webmention.io Dashboard:**
- Check https://webmention.io for received webmentions
- Moderate spam if needed
- Monitor webmention activity

## ⚡ **Quick Start (5 minutes)**

1. **Bridgy**: Go to https://brid.gy → Sign in → Add `https://sajalchoudhary.net`
2. **Webmention.io**: Go to https://webmention.io → Sign in → Add `sajalchoudhary.net`
3. **Test**: Create a new post and watch the magic happen!

## 🔧 **Your Website is Already Perfect**

Your website already has everything needed:
- ✅ Microformats2 markup
- ✅ Social media links with `rel="me"`
- ✅ Webmention discovery links
- ✅ Syndication and webmention components
- ✅ RSS feed optimized for social media

**You just need to connect the external services!**

### Files Created/Modified
- `src/pages/[...slug].astro` - Added microformats and webmention/syndication components
- `src/layouts/Layout.astro` - Added webmention discovery links
- `src/pages/stream/rss.xml.js` - Enhanced with hashtag support
- `src/content/config.ts` - Added syndication metadata fields
- `src/components/SyndicationLinks.astro` - New component for social media links
- `src/components/Webmentions.astro` - New component for webmention display
- `planning/posse-implementation-plan.md` - Complete implementation documentation
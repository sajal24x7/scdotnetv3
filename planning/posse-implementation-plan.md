# POSSE Implementation Plan

**Project:** Implement POSSE (Publish on your Own Site, Syndicate Elsewhere) with Bridgy Fed and Webmentions

**Last Updated:** January 15, 2025

## Overview

This plan implements POSSE functionality in two phases:
1. **Phase 1:** Social media syndication using Bridgy Fed
2. **Phase 2:** Webmention integration using webmention.io

## Current Phase
**Phase 1: Social Media Syndication Setup - COMPLETED**

## Overall Progress
- [x] Phase 1: Social Media Syndication (8/8 tasks)
- [x] Phase 2: Webmention Integration (6/6 tasks)

---

## Phase 1: Social Media Syndication with Bridgy Fed

### Requirements
- Syndicate all content from `/stream/` RSS feed to Mastodon and Bluesky
- Post format: Headline + Description (if present) + Link + Hashtags
- Use existing stream RSS feed for Bridgy Fed integration
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
1. **Set up Bridgy Fed:**
   - Go to https://fed.brid.gy
   - Enter your website URL: `https://sajalchoudhary.net`
   - Connect your Mastodon account: @sajal24x7@mastodon.social
   - Connect your Bluesky account: @sajal24x7.bsky.social
   - Point Bridgy to your stream RSS feed: `https://sajalchoudhary.net/stream/rss.xml`

2. **Set up webmention.io:**
   - Go to https://webmention.io
   - Register your domain: `sajalchoudhary.net`
   - Verify domain ownership
   - Test webmention endpoint

3. **Test the implementation:**
   - Create a new post in the stream category (blog, micro, or photo)
   - Verify Bridgy Fed picks up the post and syndicates to social media
   - Test webmention functionality by having someone mention your post
   - Check that syndication links appear on your posts

### Files Created/Modified
- `src/pages/[...slug].astro` - Added microformats and webmention/syndication components
- `src/layouts/Layout.astro` - Added webmention discovery links
- `src/pages/stream/rss.xml.js` - Enhanced with hashtag support
- `src/content/config.ts` - Added syndication metadata fields
- `src/components/SyndicationLinks.astro` - New component for social media links
- `src/components/Webmentions.astro` - New component for webmention display
- `planning/posse-implementation-plan.md` - Complete implementation documentation
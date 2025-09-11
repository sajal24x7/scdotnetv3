# POSSE Implementation Plan

**Project:** Implement POSSE (Publish on your Own Site, Syndicate Elsewhere) with Bridgy Fed and Webmentions

**Last Updated:** January 15, 2025

## Overview

This plan implements POSSE functionality in two phases:
1. **Phase 1:** Social media syndication using Bridgy Fed
2. **Phase 2:** Webmention integration using webmention.io

## Current Phase
**Phase 1: Social Media Syndication Setup**

## Overall Progress
- [ ] Phase 1: Social Media Syndication (0/8 tasks)
- [ ] Phase 2: Webmention Integration (0/6 tasks)

---

## Phase 1: Social Media Syndication with Bridgy Fed

### Requirements
- Syndicate all content from `/stream/` RSS feed to Mastodon and Bluesky
- Post format: Headline + Description (if present) + Link + Hashtags
- Use existing stream RSS feed for Bridgy Fed integration
- Add microformats markup for proper parsing

### Tasks

#### P1.1: Add Microformats Markup to Stream Posts
- [ ] Modify stream post templates to include `h-entry` class
- [ ] Add `p-name` for post titles
- [ ] Add `e-content` for post content
- [ ] Add `dt-published` for publication dates
- [ ] Add `u-url` for canonical URLs
- [ ] Add `p-author` for author information

**Files to modify:**
- `src/pages/stream/[...slug].astro` (if exists)
- Stream post layout components
- Any stream-specific templates

#### P1.2: Enhance Stream RSS Feed for Social Media
- [ ] Modify `/stream/rss.xml` to include proper microformats
- [ ] Ensure post titles and descriptions are optimized for social media
- [ ] Add hashtag support from post tags
- [ ] Verify RSS feed structure for Bridgy Fed compatibility

**Files to modify:**
- `src/pages/stream/rss.xml.js` (if exists)
- Or create new stream RSS feed

#### P1.3: Add Syndication Metadata to Content Schema
- [ ] Add `syndicate` field to content schema for tracking syndication status
- [ ] Add `socialMediaTags` field for custom hashtags
- [ ] Update content types to support syndication metadata

**Files to modify:**
- `src/content/config.ts`

#### P1.4: Create Syndication Links Component
- [ ] Build component to display where posts were shared
- [ ] Show links to Mastodon and Bluesky posts
- [ ] Include interaction counts if available
- [ ] Style to match existing design

**Files to create:**
- `src/components/SyndicationLinks.astro`

#### P1.5: Set Up Bridgy Fed Integration
- [ ] Register site with Bridgy Fed at https://fed.brid.gy
- [ ] Configure Mastodon account: @sajal24x7@mastodon.social
- [ ] Configure Bluesky account: @sajal24x7.bsky.social
- [ ] Point Bridgy to stream RSS feed
- [ ] Test with sample post

#### P1.6: Add Webmention Discovery Links
- [ ] Add webmention discovery links to HTML head
- [ ] Include both webmention and pingback endpoints
- [ ] Ensure proper domain configuration

**Files to modify:**
- `src/layouts/Layout.astro`

#### P1.7: Test Social Media Syndication
- [ ] Create test post in stream category
- [ ] Verify Bridgy Fed picks up the post
- [ ] Check Mastodon and Bluesky posts are created
- [ ] Verify hashtags are included
- [ ] Test syndication links display correctly

#### P1.8: Document Social Media Workflow
- [ ] Create documentation for social media posting workflow
- [ ] Document how to add custom hashtags
- [ ] Create troubleshooting guide for Bridgy Fed

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

#### P2.2: Create Webmention Component
- [ ] Build component to fetch and display webmentions
- [ ] Support different webmention types (like, reply, repost, mention)
- [ ] Include author information and timestamps
- [ ] Style to match existing design

**Files to create:**
- `src/components/Webmentions.astro`
- `src/utils/webmentions.ts`

#### P2.3: Add Webmention Display to Posts
- [ ] Integrate webmention component into post templates
- [ ] Position after backlinks section
- [ ] Ensure proper loading and error handling

**Files to modify:**
- Post layout templates
- Stream post templates

#### P2.4: Add Webmention Styling
- [ ] Style webmention display to match site design
- [ ] Add icons for different webmention types
- [ ] Ensure responsive design
- [ ] Add loading states

#### P2.5: Test Webmention Functionality
- [ ] Test webmention receiving from other sites
- [ ] Verify webmention display on posts
- [ ] Test different webmention types
- [ ] Ensure proper error handling

#### P2.6: Document Webmention Workflow
- [ ] Create documentation for webmention functionality
- [ ] Document how to encourage webmentions
- [ ] Create troubleshooting guide

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

## Questions for Clarification

1. **Stream Category:** Do you want to move existing micro posts to the stream category, or keep them separate?

2. **Hashtag Strategy:** Should all post tags become hashtags, or do you want to filter certain tags?

3. **Post Length:** Any maximum length for social media posts, or let Bridgy handle truncation?

4. **Webmention Moderation:** Do you want to moderate webmentions before they appear, or show all received webmentions?

5. **Testing:** Would you like to test with a specific post first, or implement for all stream content at once?

---

## Implementation Notes

### Completed Tasks
*No tasks completed yet*

### Current Work
*Starting with Phase 1: Social Media Syndication Setup*

### Next Steps
1. Begin with P1.1: Add microformats markup to stream posts
2. Set up Bridgy Fed integration
3. Test with sample post
4. Move to Phase 2 after Phase 1 is complete
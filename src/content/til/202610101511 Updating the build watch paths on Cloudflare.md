---
title: Updating the Build Watch Paths on Cloudflare
slug: updating-the-build-watch-paths-on-cloudflare
created: 2026-10-10T12:11:00.000Z
updated: 2026-10-10T12:14:18.000Z
category: til
tags:
  - cloudflare
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/117417758466906340'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mxjyqo43gb2w'
  - 'https://www.threads.com/@sajal24x7/post/DeVEu5mgbc3'
---
You go to your project settings > Build > Build watch paths.

The gotcha is that you need to press an enter after typing out the settings. 

I wanted these settings:
  
Include paths: `*`
Exclude paths:`inbox/*`

I first tried to do this on mobile where it did not work. On my Mac as well, the Save button was grayed out, no matter how many refreshes I did. Then I did a chat with the agent, and it said:

>In the Cloudflare dashboard, pattern input fields typically require you to press Enter (or click an "Add" button) after typing `inbox/*`. If you type the pattern but don't confirm it, the form doesn't detect a change and the Save button stays grayed out.


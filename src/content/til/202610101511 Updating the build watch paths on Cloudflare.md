---
title: "Updating the Build Watch Paths on Cloudflare"
slug: "updating-the-build-watch-paths-on-cloudflare"
created: 2026-10-10T15:11:00+03:00
updated: 2026-10-10T15:14:18+03:00
category: til
tags: ["cloudflare"]
---
You go to your project settings > Build > Build watch paths.

The gotcha is that you need to press an enter after typing out the settings. 

I wanted these settings:
  
Include paths: `*`
Exclude paths:`inbox/*`

I first tried to do this on mobile where it did not work. On my Mac as well, the Save button was grayed out, no matter how many refreshes I did. Then I did a chat with the agent, and it said:

>In the Cloudflare dashboard, pattern input fields typically require you to press Enter (or click an "Add" button) after typing `inbox/*`. If you type the pattern but don't confirm it, the form doesn't detect a change and the Save button stays grayed out.


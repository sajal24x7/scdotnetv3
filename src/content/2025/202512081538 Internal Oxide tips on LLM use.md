---
title: Internal Oxide tips on LLM use
slug: internal-oxide-tips-on-llm-use
pubDate: 2025-12-08T13:42:38.000Z
updatedDate: 2025-12-08T13:42:38.000Z
category: micro
tags:
  - claude
  - code
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115684239554979144'
  - 'https://bsky.app/profile/sajal24x7.bsky.social/post/3m7i5xjtddp2d'
  - 'https://www.threads.com/@sajal24x7/post/DSBEHeGCSWR'
---
[Oxide's internal tips on LLM use](https://gist.github.com/david-crespo/5c5eaf36a2d20be8a3013ba3c7c265d9)

> As conversation length grows, each message gets more expensive while Claude gets dumber. That's a bad trade! Use /context and /cost or the statusline trick above to keep an eye on your context window. CC natively gives a percentage but it's sort of fake because it includes a large buffer of empty space to use for compacting.

Aligns with my experience. It’s better to start a new chat than trying to continue in the same chat hoping for a fix.

Also has a nice list of resources at the end.

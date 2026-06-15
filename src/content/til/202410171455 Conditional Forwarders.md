---
title: Conditional Forwarders
slug: conditional-forwarders
created: '2024-10-17T14:55:00+03:00'
updated: '2024-10-17T14:55:00+03:00'
category: til
tags:
  - windows
  - dns
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modobrjsql2m'
  - 'https://mastodon.social/@sajal24x7/116756402841623091'
---

- Forward specific DNS queries (for a domain) to external DNS servers, when it can't be solved internally.
- If forwarders are not responding, it will use root hints
- Uses recursive queries, which make resolution faster when compared to dns forwarders which use iterative query

---
# references:

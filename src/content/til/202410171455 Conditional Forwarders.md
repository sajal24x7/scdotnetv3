---
title: Conditional Forwarders
slug: conditional-forwarders
pubDate: '2024-10-17T14:55:00+03:00'
updatedDate: '2024-10-17T14:55:00+03:00'
category: til
tags:
- windows
- dns
---

- Forward specific DNS queries (for a domain) to external DNS servers, when it can't be solved internally.
- If forwarders are not responding, it will use root hints
- Uses recursive queries, which make resolution faster when compared to dns forwarders which use iterative query

---
# references:
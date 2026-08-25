---
aliases:
  - conditional forwarders
tags:
  - "#windows"
  - "#dns"
category: til
updated: 2026-08-25T14:30:56
---
- Forward specific DNS queries (for a domain) to external DNS servers, when it can't be solved internally.
- If forwarders are not responding, it will use root hints
- Uses recursive queries, which make resolution faster when compared to dns forwarders which use iterative query

---
# references:
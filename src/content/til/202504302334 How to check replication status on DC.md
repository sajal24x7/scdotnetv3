---
title: "How to Check Replication Status on DC"
slug: "how-to-check-replication-status-on-dc"
created: 2025-04-30T23:34:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell", "ad"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mododufjhf2p'
  - 'https://mastodon.social/@sajal24x7/116756406592896027'
---
```powershell
# For summary
repadmin /replsummary

# For specific DC
repadmin /showrepl <DCName>

# To check replication partners
repadmin /showreps <DCName>

```

---
# references:
---
title: How to Check Replication Status on DC
slug: how-to-check-replication-status-on-dc
created: 2025-04-30T20:39:20.000Z
updated: 2025-04-30T20:39:20.000Z
category: til
tags:
  - powershell
  - ad
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mododufjhf2p'
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

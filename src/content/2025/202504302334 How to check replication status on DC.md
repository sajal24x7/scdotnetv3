---
title: "How to check replication status on DC"
slug: "how-to-check-replication-status-on-dc"
pubDate: 2025-04-30T23:39:20+03:00
updatedDate: 2025-04-30T23:39:20+03:00
category: til
tags:
  - powershell
  - ad

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
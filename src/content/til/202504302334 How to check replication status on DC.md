---
title: "How to Check Replication Status on DC"
slug: "how-to-check-replication-status-on-dc"
created: 2025-04-30T23:39:20+03:00
updated: 2025-04-30T23:39:20+03:00
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
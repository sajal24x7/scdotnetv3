---
aliases:
  - How to check replication status on DC
tags:
  - "#powershell"
  - "#ad"
category: til
updated: 2026-08-25T14:30:56
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
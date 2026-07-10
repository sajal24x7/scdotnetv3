---
tags:
  - powershell
  - ad
aliases:
  - How to check replication status on DC
category: til
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
---
tags:
  - "#ad"
  - "#windows"
aliases:
  - AD pre-requisites
---
- separate data disk for an NTDS database, SYSVOL folders, and log files.
- Set **Host Cache Preference** of the data disk to **None** to disable write-through caching, which can cause a conflict with AD DS operations
- 

---
# references:
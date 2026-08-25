---
aliases:
  - AD pre-requisites
tags:
  - "#ad"
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
- separate data disk for an NTDS database, SYSVOL folders, and log files.
- Set **Host Cache Preference** of the data disk to **None** to disable write-through caching, which can cause a conflict with AD DS operations
- 

---
# references:
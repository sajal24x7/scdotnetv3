---
title: "AD Pre-requisites"
slug: "ad-pre-requisites"
created: 2024-12-11T16:22:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["ad", "windows"]
---
- separate data disk for an NTDS database, SYSVOL folders, and log files.
- Set **Host Cache Preference** of the data disk to **None** to disable write-through caching, which can cause a conflict with AD DS operations
- 

---
# references:
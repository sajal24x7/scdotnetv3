---
title: Powershell AD Recover Deleted Objects
slug: powershell-ad-recover-deleted-objects
created: '2022-08-10T14:05:00+03:00'
updated: '2022-08-10T14:05:00+03:00'
category: til
tags:
- powershell
- ad
---


```powershell

# Get deleted object
Get-ADObject <userid> -IncludeDeletedObjects

## Restore
Get-ADObject <userid> -IncludeDeletedObjects | Restore-ADObject
```

---
references:
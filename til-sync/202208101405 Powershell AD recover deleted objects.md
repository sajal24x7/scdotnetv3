---
aliases:
  - Powershell AD recover deleted objects
tags:
  - "#powershell"
  - "#ad"
category: til
updated: 2026-08-25T14:30:56
---
```powershell

# Get deleted object
Get-ADObject <userid> -IncludeDeletedObjects

## Restore
Get-ADObject <userid> -IncludeDeletedObjects | Restore-ADObject
```

---
references:
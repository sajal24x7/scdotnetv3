---
tags:
  - powershell
  - ad
aliases:
---

```powershell

# Get deleted object
Get-ADObject <userid> -IncludeDeletedObjects

## Restore
Get-ADObject <userid> -IncludeDeletedObjects | Restore-ADObject
```

---
references:
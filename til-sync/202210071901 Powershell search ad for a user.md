---
aliases:
  - Powershell search ad for a user
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```
$ADFilter = "*345" #anything which has 345 at end
Get-ADUser -Server $Domain -Filter { SamAccountName -like $ADFilter } -Properties *
```

---
references:
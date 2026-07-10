---
tag: #powershell
aliases:
---

```
$ADFilter = "*345" #anything which has 345 at end
Get-ADUser -Server $Domain -Filter { SamAccountName -like $ADFilter } -Properties *
```

---
references:
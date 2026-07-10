---
tags:
  - "#windows"
aliases:
---
```powershell
Get-EventLog -LogName * | ForEach { Clear-EventLog $_.Log }
```

---
# references:
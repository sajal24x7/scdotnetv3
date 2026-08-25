---
aliases:
  - Windows clear all events
tags:
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Get-EventLog -LogName * | ForEach { Clear-EventLog $_.Log }
```

---
# references:
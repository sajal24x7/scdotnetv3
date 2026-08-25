---
aliases:
  - Remove child items skipping one
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powerhsell

Get-ChildItem -Path "C:\Windows\System32\winevt\Logs\*" -File -Include Archive-Sec* | Sort-Object LastWriteTime -Descending | Select-Object -Skip 1 | Remove-Item -Force
```

---
# references:
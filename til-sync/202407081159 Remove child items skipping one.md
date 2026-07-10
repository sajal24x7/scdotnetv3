---
tags:
  - "#powershell"
aliases:
---
```powerhsell

Get-ChildItem -Path "C:\Windows\System32\winevt\Logs\*" -File -Include Archive-Sec* | Sort-Object LastWriteTime -Descending | Select-Object -Skip 1 | Remove-Item -Force
```

---
# references:
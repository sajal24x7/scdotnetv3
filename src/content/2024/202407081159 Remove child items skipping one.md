---
title: Remove child items skipping one
slug: remove-child-items-skipping-one
pubDate: '2024-07-08T11:59:00+03:00'
updatedDate: '2024-07-08T11:59:00+03:00'
category: til
tags:
- powershell
---

```powerhsell

Get-ChildItem -Path "C:\Windows\System32\winevt\Logs\*" -File -Include Archive-Sec* | Sort-Object LastWriteTime -Descending | Select-Object -Skip 1 | Remove-Item -Force
```

---
# references:
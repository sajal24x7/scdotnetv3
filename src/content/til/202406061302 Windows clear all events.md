---
title: Windows Clear All Events
slug: windows-clear-all-events
pubDate: '2024-06-06T13:02:00+03:00'
updatedDate: '2024-06-06T13:02:00+03:00'
category: til
tags:
- windows
---

```powershell
Get-EventLog -LogName * | ForEach { Clear-EventLog $_.Log }
```

---
# references:
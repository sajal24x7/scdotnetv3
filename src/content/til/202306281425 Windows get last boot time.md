---
title: Windows get last boot time
slug: windows-get-last-boot-time
pubDate: '2023-06-28T14:25:00+03:00'
updatedDate: '2023-06-28T14:25:00+03:00'
category: til
tags: []
---


```powershell
Get-CimInstance -ClassName win32_operatingsystem | select csname, lastbootuptime
```

---
# references:
[PowerTip: Get the Last Boot Time with PowerShell - Scripting Blog (microsoft.com)](https://devblogs.microsoft.com/scripting/powertip-get-the-last-boot-time-with-powershell/)
---
aliases:
  - Windows get last boot time
tags:
  - "#windows"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Get-CimInstance -ClassName win32_operatingsystem | select csname, lastbootuptime
```

---
# references:
[PowerTip: Get the Last Boot Time with PowerShell - Scripting Blog (microsoft.com)](https://devblogs.microsoft.com/scripting/powertip-get-the-last-boot-time-with-powershell/)
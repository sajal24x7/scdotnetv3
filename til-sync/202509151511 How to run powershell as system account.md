---
tags:
  - powershell
aliases:
category: til
---
There are two ways to run your powershell script as the SYSTEM account:
1. Use PsExec

```powershell
Psexec.exe -i -s C:\WINDOWS\system32\WindowsPowerShell\v1.0\powershell.exe`
```

2. Create a scheduled task that runs it as system, use `-User 'NT AUTHORITY\SYSTEM' `.
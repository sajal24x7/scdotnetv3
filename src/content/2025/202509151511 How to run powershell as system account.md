---
title: "How to run powershell as system account"
slug: "how-to-run-powershell-as-system-account"
pubDate: 2025-12-18T12:32:50+02:00
updatedDate: 2025-12-18T12:32:50+02:00
category: til
tags:
  - powershell

---
There are two ways to run your powershell script as the SYSTEM account:
1. Use PsExec

```powershell
Psexec.exe -i -s C:\WINDOWS\system32\WindowsPowerShell\v1.0\powershell.exe`
```

2. Create a scheduled task that runs it as system, use `-User 'NT AUTHORITY\SYSTEM' `.
---
title: How to run powershell as system account
slug: how-to-run-powershell-as-system-account
pubDate: 2025-12-18T10:32:50.000Z
updatedDate: 2025-12-18T10:32:50.000Z
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/115740127921475863'
  - 'https://bsky.app/profile/sajal24x7.bsky.social/post/3maay6mnbch22'
  - 'https://www.threads.com/@sajal24x7/post/DSZtTPfjnnq'
---
There are two ways to run your powershell script as the SYSTEM account:
1. Use PsExec

```powershell
Psexec.exe -i -s C:\WINDOWS\system32\WindowsPowerShell\v1.0\powershell.exe`
```

2. Create a scheduled task that runs it as system, use `-User 'NT AUTHORITY\SYSTEM' `.

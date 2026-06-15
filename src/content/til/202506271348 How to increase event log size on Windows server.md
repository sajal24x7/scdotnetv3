---
title: How to Increase Event Log Size on Windows Server
slug: how-to-increase-event-log-size-on-windows-server
created: 2025-06-27T10:38:34.000Z
updated: 2025-06-27T10:38:34.000Z
category: til
tags:
  - '#windows'
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoe7sob22m'
  - 'https://mastodon.social/@sajal24x7/116756407496781109'
---
# Through GPO
1. `Computer Configuration\Administrative Templates\Windows Components\Event Log Service\` 
	1. Subordinate folders exist by default, select the appropriate one and set the max log size

# PowerShell override

```powershell
wevtutil sl Security /ms:3145728
```
# How to check log size
```powershell
wevtutil gl Security | findstr /i "maxSize"
```

---
# references:
[Event Log | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/dd349798\(v=ws.10\))

---
tags:
  - "#windows"
aliases:
  - How to increase event log size on Windows server
category: til
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
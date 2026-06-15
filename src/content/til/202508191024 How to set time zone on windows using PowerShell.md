---
title: "How to Set Time Zone on Windows Using PowerShell"
slug: "how-to-set-time-zone-on-windows-using-powershell"
created: 2025-09-08T20:52:04+03:00
updated: 2025-09-08T20:52:04+03:00
category: til
tags:
  - powershell

---
```powershell

# To set time zone
Set-TimeZone -Id 'FLE Standard Time'

# To get IDs
Get-TimeZone -ListAvailable

# To get current timezone
Get-TimeZone

```
---
title: How to Set Time Zone on Windows Using PowerShell
slug: how-to-set-time-zone-on-windows-using-powershell
created: 2025-09-08T17:52:04.000Z
updated: 2025-09-08T17:52:04.000Z
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoesirsa2c'
---
```powershell

# To set time zone
Set-TimeZone -Id 'FLE Standard Time'

# To get IDs
Get-TimeZone -ListAvailable

# To get current timezone
Get-TimeZone

```

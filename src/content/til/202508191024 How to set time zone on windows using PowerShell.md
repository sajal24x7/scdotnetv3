---
title: "How to Set Time Zone on Windows Using PowerShell"
slug: "how-to-set-time-zone-on-windows-using-powershell"
created: 2025-08-19T10:24:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["powershell"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoesirsa2c'
  - 'https://mastodon.social/@sajal24x7/116756409143022582'
---
```powershell

# To set time zone
Set-TimeZone -Id 'FLE Standard Time'

# To get IDs
Get-TimeZone -ListAvailable

# To get current timezone
Get-TimeZone

```
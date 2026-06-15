---
title: Powershell Get Certs on System
slug: powershell-get-certs-on-system
created: '2024-07-09T16:31:00+03:00'
updated: '2024-07-09T16:31:00+03:00'
category: til
tags:
  - powershell
  - cert
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754951309815633'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnouneil2m'
---

```powershell
PS C:\Users\845874.adm> Get-ChildItem Cert:\ -Recurse | Where-Object { $_.PSIsContainer -eq $false} | Where-Object { $_.Subject -like "*solar*"}
```

---
# references:
[PowerTip: Get all your local certificates by using PowerShell - Scripting Blog [archived] (microsoft.com)](https://devblogs.microsoft.com/scripting/powertip-get-all-your-local-certificates-by-using-powershell/)

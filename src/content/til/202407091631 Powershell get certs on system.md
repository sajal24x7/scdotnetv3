---
title: Powershell Get Certs on System
slug: powershell-get-certs-on-system
pubDate: '2024-07-09T16:31:00+03:00'
updatedDate: '2024-07-09T16:31:00+03:00'
category: til
tags:
- powershell
- cert
---

```powershell
PS C:\Users\845874.adm> Get-ChildItem Cert:\ -Recurse | Where-Object { $_.PSIsContainer -eq $false} | Where-Object { $_.Subject -like "*solar*"}
```

---
# references:
[PowerTip: Get all your local certificates by using PowerShell - Scripting Blog [archived] (microsoft.com)](https://devblogs.microsoft.com/scripting/powertip-get-all-your-local-certificates-by-using-powershell/)
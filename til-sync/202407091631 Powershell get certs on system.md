---
aliases:
  - Powershell get certs on system
tags:
  - "#powershell"
  - "#cert"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
PS C:\Users\845874.adm> Get-ChildItem Cert:\ -Recurse | Where-Object { $_.PSIsContainer -eq $false} | Where-Object { $_.Subject -like "*solar*"}
```

---
# references:
[PowerTip: Get all your local certificates by using PowerShell - Scripting Blog [archived] (microsoft.com)](https://devblogs.microsoft.com/scripting/powertip-get-all-your-local-certificates-by-using-powershell/)
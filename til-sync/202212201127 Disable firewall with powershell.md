---
aliases:
  - Disable firewall with powershell
tags:
  - "#windows"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
1. Get status

```powershell
Get-NetFirewallProfile | Format-Table Name, Enabled
```

2. Disable
```powershell
Get-NetFirewallProfile | Set-NetFirewallProfile -Enabled False
```


---
references:
---
tags:
  - "#windows"
  - "#powershell"
aliases:
  - Disable firewall with powershell
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
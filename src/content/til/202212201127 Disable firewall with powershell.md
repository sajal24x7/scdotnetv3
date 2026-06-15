---
title: Disable Firewall With Powershell
slug: disable-firewall-with-powershell
created: '2022-12-20T11:27:00+03:00'
updated: '2022-12-20T11:27:00+03:00'
category: til
tags: []
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
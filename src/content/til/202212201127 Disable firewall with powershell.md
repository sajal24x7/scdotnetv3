---
title: Disable firewall with powershell
slug: disable-firewall-with-powershell
pubDate: '2022-12-20T11:27:00+03:00'
updatedDate: '2022-12-20T11:27:00+03:00'
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
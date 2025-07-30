---
title: "VMware List allowed IPs in firewall"
slug: "vmware-list-allowed-ips-in-firewall"
pubDate: 2025-07-29T21:42:07+03:00
updatedDate: 2025-07-29T21:42:07+03:00
category: til
tags:
  - "#vmware"
  - "#powershell"

---
```powershell

Get-VMHost | Get-VMHostFirewallException | Where {$_.Enabled -eq $true} | Select Name,Enabled,@{N="AllIPEnabled";E={$_.ExtensionData.AllowedHosts.AllIP}}

```

---
# references:
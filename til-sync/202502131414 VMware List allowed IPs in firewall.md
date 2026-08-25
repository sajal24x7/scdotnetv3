---
aliases:
  - List allowed IPs in firewall
  - VMware List allowed IPs in firewall
tags:
  - "#vmware"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell

Get-VMHost | Get-VMHostFirewallException | Where {$_.Enabled -eq $true} | Select Name,Enabled,@{N="AllIPEnabled";E={$_.ExtensionData.AllowedHosts.AllIP}}

```

---
# references:
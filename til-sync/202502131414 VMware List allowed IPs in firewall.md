---
tags:
  - "#vmware"
  - "#powershell"
aliases:
  - List allowed IPs in firewall
  - VMware List allowed IPs in firewall
category: til
---
```powershell

Get-VMHost | Get-VMHostFirewallException | Where {$_.Enabled -eq $true} | Select Name,Enabled,@{N="AllIPEnabled";E={$_.ExtensionData.AllowedHosts.AllIP}}

```

---
# references:
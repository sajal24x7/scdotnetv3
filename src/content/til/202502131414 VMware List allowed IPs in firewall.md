---
title: VMware List Allowed IPs in Firewall
slug: vmware-list-allowed-ips-in-firewall
created: 2025-02-13T11:42:07.000Z
updated: 2025-02-13T11:42:07.000Z
category: til
tags:
  - '#vmware'
  - '#powershell'
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modochq4dd2m'
---
```powershell

Get-VMHost | Get-VMHostFirewallException | Where {$_.Enabled -eq $true} | Select Name,Enabled,@{N="AllIPEnabled";E={$_.ExtensionData.AllowedHosts.AllIP}}

```

---
# references:

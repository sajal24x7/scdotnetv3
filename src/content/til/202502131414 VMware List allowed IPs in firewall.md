---
title: "VMware List Allowed IPs in Firewall"
slug: "vmware-list-allowed-ips-in-firewall"
created: 2025-02-13T14:14:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["vmware", "powershell"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modochq4dd2m'
  - 'https://mastodon.social/@sajal24x7/116756403866821078'
---
```powershell

Get-VMHost | Get-VMHostFirewallException | Where {$_.Enabled -eq $true} | Select Name,Enabled,@{N="AllIPEnabled";E={$_.ExtensionData.AllowedHosts.AllIP}}

```

---
# references:
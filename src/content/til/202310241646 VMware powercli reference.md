---
title: VMware Powercli Reference
slug: vmware-powercli-reference
created: '2023-10-24T16:46:00+03:00'
updated: '2023-10-24T16:46:00+03:00'
category: til
tags:
  - vmware
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754755413535444'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkvruzve2v'
---

# Get-VM filters

```powershell
## To get only non linux vms
$Cluster | Get-VM | Where-Object { $_.Guest.OSFullName -notlike "*Linux*" }
```



---
# references:

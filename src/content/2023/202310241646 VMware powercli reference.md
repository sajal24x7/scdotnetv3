---
title: VMware powercli reference
slug: vmware-powercli-reference
pubDate: '2023-10-24T16:46:00+03:00'
updatedDate: '2023-10-24T16:46:00+03:00'
category: til
tags:
- vmware
---

# Get-VM filters

```powershell
## To get only non linux vms
$Cluster | Get-VM | Where-Object { $_.Guest.OSFullName -notlike "*Linux*" }
```



---
# references:
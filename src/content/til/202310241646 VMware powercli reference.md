---
title: VMware Powercli Reference
slug: vmware-powercli-reference
created: '2023-10-24T16:46:00+03:00'
updated: '2023-10-24T16:46:00+03:00'
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
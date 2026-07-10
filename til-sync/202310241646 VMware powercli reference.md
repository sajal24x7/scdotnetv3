---
tags:
  - "#vmware"
aliases:
---
# Get-VM filters

```powershell
## To get only non linux vms
$Cluster | Get-VM | Where-Object { $_.Guest.OSFullName -notlike "*Linux*" }
```



---
# references:
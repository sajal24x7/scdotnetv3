---
aliases:
  - VMware powercli reference
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
# Get-VM filters

```powershell
## To get only non linux vms
$Cluster | Get-VM | Where-Object { $_.Guest.OSFullName -notlike "*Linux*" }
```



---
# references:
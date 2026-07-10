---
tags:
  - "#vmware"
  - "#powershell"
aliases:
  - VMware get VM creation date
category: til
---
```powershell
(Get-VM -Name esxi67-01).ExtensionData.Config.createDate
```

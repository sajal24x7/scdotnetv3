---
tags:
  - vmware
  - powershell
aliases:
  - VMware get VM creation date
category: til
updated: 2026-08-25T14:30:56
---
```powershell
(Get-VM -Name esxi67-01).ExtensionData.Config.createDate
```

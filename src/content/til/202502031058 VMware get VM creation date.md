---
title: "VMware Get VM Creation Date"
slug: "vmware-get-vm-creation-date"
created: 2025-02-03T10:58:00+02:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["vmware", "powershell"]
---
```powershell
(Get-VM -Name esxi67-01).ExtensionData.Config.createDate
```

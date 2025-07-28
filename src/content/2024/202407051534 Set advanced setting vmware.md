---
title: Set advanced setting vmware
slug: set-advanced-setting-vmware
pubDate: '2024-07-05T15:34:00+03:00'
updatedDate: '2024-07-05T15:34:00+03:00'
category: til
tags:
- vmware
- powershell
---

.Set-AdvancedSetting can be used to set it.

```powershell
Get-AdvancedSetting -Entity (Get-Cluster -Name Cluster) -Name SettingName | Set-AdvancedSetting -Value NewValue

Set-VmHostAdvancedConfiguration

```

Obsolete: 


---
# references:
[Set-AdvancedSetting Command | Vmware PowerCLI Reference (broadcom.com)](https://developer.broadcom.com/powercli/latest/vmware.vimautomation.core/commands/set-advancedsetting?scrollString=Set-AdvancedSetting)
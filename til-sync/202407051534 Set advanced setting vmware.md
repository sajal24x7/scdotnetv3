---
aliases:
  - Set advanced setting vmware
tags:
  - "#vmware"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
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
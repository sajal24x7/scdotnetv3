---
title: Set Advanced Setting Vmware
slug: set-advanced-setting-vmware
created: '2024-07-05T15:34:00+03:00'
updated: '2024-07-05T15:34:00+03:00'
category: til
tags:
  - vmware
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754949433854903'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modnnze2ei2v'
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

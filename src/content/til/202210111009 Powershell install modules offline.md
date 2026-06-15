---
title: Powershell Install Modules Offline
slug: powershell-install-modules-offline
created: '2022-10-11T10:09:00+03:00'
updated: '2022-10-11T10:09:00+03:00'
category: til
tags:
  - powershell
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754719599707964'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkfir6ub2m'
---


Download module and put it in below path on a VM that does not have internet access.
```powershell
Save-Module -Name <modulename> -Path <localpath>
```

```cmd
C:\Program Files\WindowsPowerShell\Modules
```

---
references:
[Save-Module (PowerShellGet) - PowerShell | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/powershellget/save-module?view=powershell-7.3)

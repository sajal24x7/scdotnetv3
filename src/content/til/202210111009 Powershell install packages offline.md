---
title: Powershell Install Packages Offline
slug: powershell-install-packages-offline
created: '2022-10-11T10:09:00+03:00'
updated: '2022-10-11T10:09:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754720077857454'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkfpkjbx2l'
  - 'https://www.threads.com/@sajal24x7/post/DZnF1DHlmgx'
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

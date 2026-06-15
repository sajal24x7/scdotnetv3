---
title: Get List of Open Shares on Windows Server
slug: get-list-of-open-shares-on-windows-server
created: 2025-05-23T09:38:46.000Z
updated: 2025-05-23T09:38:46.000Z
category: til
tags:
  - windows
  - powershell
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modoe3zl4d2m'
---
```powershell
Get-SmbOpenFile | select @{Name="Timestamp"; Expression={Get-Date}},Path, ClientUserName | Export-CSV -Path C:\SupportFilesWindows\Logs\openfiles.csv -Append -Encoding UTF8 -NoClobber -NoTypeInformation
```

---
# references:

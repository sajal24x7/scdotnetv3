---
title: "Get List of Open Shares on Windows Server"
slug: "get-list-of-open-shares-on-windows-server"
pubDate: 2025-05-23T12:38:46+03:00
updatedDate: 2025-05-23T12:38:46+03:00
category: til
tags:
  - windows
  - powershell

---
```powershell
Get-SmbOpenFile | select @{Name="Timestamp"; Expression={Get-Date}},Path, ClientUserName | Export-CSV -Path C:\SupportFilesWindows\Logs\openfiles.csv -Append -Encoding UTF8 -NoClobber -NoTypeInformation
```

---
# references:
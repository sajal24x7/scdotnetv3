---
title: "Get list of open shares on Windows server"
slug: "get-list-of-open-shares-on-windows-server"
pubDate: 2025-07-29T21:38:46+03:00
updatedDate: 2025-07-29T21:38:46+03:00
category: TIL
tags:
  - windows
  - powershell

---
```powershell
Get-SmbOpenFile | select @{Name="Timestamp"; Expression={Get-Date}},Path, ClientUserName | Export-CSV -Path C:\SupportFilesWindows\Logs\openfiles.csv -Append -Encoding UTF8 -NoClobber -NoTypeInformation
```

---
# references:
---
aliases:
  - Get list of open shares on Windows server
tags:
  - "#windows"
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Get-SmbOpenFile | select @{Name="Timestamp"; Expression={Get-Date}},Path, ClientUserName | Export-CSV -Path C:\SupportFilesWindows\Logs\openfiles.csv -Append -Encoding UTF8 -NoClobber -NoTypeInformation
```

---
# references:
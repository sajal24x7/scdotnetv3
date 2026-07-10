---
tags:
  - windows
  - powershell
aliases:
  - Get list of open shares on Windows server
category: til
---
```powershell
Get-SmbOpenFile | select @{Name="Timestamp"; Expression={Get-Date}},Path, ClientUserName | Export-CSV -Path C:\SupportFilesWindows\Logs\openfiles.csv -Append -Encoding UTF8 -NoClobber -NoTypeInformation
```

---
# references:
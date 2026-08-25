---
aliases:
  - Delete everything under a folder powershell
tags:
  - "#powershell"
category: til
updated: 2026-08-25T14:30:56
---
```powershell
Get-ChildItem -Path C:\Temp -Include *.* -File -Recurse | foreach { $_.Delete()}
```

---
# references:
[windows - Delete all files from a folder and its sub folders - Super User](https://superuser.com/questions/741945/delete-all-files-from-a-folder-and-its-sub-folders)
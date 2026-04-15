---
title: Delete everything under a folder powershell
slug: delete-everything-under-a-folder-powershell
pubDate: '2024-12-02T12:10:00+03:00'
updatedDate: '2024-12-02T12:10:00+03:00'
category: til
tags:
- powershell
---

```powershell
Get-ChildItem -Path C:\Temp -Include *.* -File -Recurse | foreach { $_.Delete()}
```

---
# references:
[windows - Delete all files from a folder and its sub folders - Super User](https://superuser.com/questions/741945/delete-all-files-from-a-folder-and-its-sub-folders)
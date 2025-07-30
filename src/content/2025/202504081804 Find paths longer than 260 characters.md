---
title: "Find paths longer than 260 characters"
slug: "find-paths-longer-than-260-characters"
pubDate: 2025-07-29T21:40:06+03:00
updatedDate: 2025-07-29T21:40:06+03:00
category: til
tags:
  - "#windows"

---
When running Get-ChildItem or Get-Acl, we might come across this issue. 

In the Windows API (with some exceptions discussed in the following paragraphs), the maximum length for a path is **MAX_PATH**, which is defined as 260 characters.

```powershell

# This gets everything, we can optionally just search for directories as well
Get-ChildItem –Force –Recurse –ErrorAction SilentlyContinue –ErrorVariable AccessDenied

# Then find the paths using this error variable
$AccessDenied |
Where-Object { $_.Exception -match "must be less than 260 characters" } |
ForEach-Object { $_.TargetObject }

```

---
# references:
[Naming Files, Paths, and Namespaces - Win32 apps | Microsoft Learn](https://learn.microsoft.com/en-gb/windows/win32/fileio/naming-a-file?redirectedfrom=MSDN#maxpath)
[Maximum Path Length Limitation - Win32 apps | Microsoft Learn](https://learn.microsoft.com/en-gb/windows/win32/fileio/maximum-file-path-limitation?tabs=registry)
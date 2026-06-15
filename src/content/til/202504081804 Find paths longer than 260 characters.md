---
title: Find Paths Longer Than 260 Characters
slug: find-paths-longer-than-260-characters
created: 2025-04-08T18:40:06.000Z
updated: 2025-04-08T18:40:06.000Z
category: til
tags:
  - '#windows'
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3mododjkovr2v'
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

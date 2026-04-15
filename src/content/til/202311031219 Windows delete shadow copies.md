---
title: Windows delete shadow copies
slug: windows-delete-shadow-copies
pubDate: '2023-11-03T12:19:00+03:00'
updatedDate: '2023-11-03T12:19:00+03:00'
category: til
tags:
- windows
---

```powershell

##  List
vssadmin list shadows

### List with powershell
Get-WmiObject Win32_Shadowcopy

## Delete with powershell
Get-WmiObject Win32_Shadowcopy |  ForEach-Object {$_.Delete();}

```

---
# references:
[An Underrated Technique to Delete Volume Shadow Copies - DeviceIoControl (picussecurity.com)](https://www.picussecurity.com/resource/blog/technique-to-delete-volume-shadow-copies-deviceiocontrol)
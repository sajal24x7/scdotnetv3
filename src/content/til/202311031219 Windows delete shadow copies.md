---
title: Windows Delete Shadow Copies
slug: windows-delete-shadow-copies
created: '2023-11-03T12:19:00+03:00'
updated: '2023-11-03T12:19:00+03:00'
category: til
tags:
  - windows
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754756061701551'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkw3d5ru2m'
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

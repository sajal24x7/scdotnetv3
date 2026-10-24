---
title: "Windows Time Service"
slug: "windows-time-service"
created: 2022-06-09T11:40:00+03:00
updated: 2026-08-25T14:30:56+03:00
category: til
tags: ["windows", "time"]
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modjsxybxp2u'
---
# Sync from domain
```powershell
w32tm /config /syncfromflags:domhier /update 
net stop w32time 
net start w32time
```

# Sync from local
```powershell
w32tm /config /syncfromflags:manual /update 
net stop w32time 
net start w32time
```


# Sync from external source on DC
```powershell
w32tm.exe /config /syncfromflags:manual /manualpeerlist:132.163.97.1,0x8 /reliable:yes /update
w32tm.exe /config /update
```

---
references:
[Windows Time service tools and settings | Microsoft Docs](https://docs.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings)
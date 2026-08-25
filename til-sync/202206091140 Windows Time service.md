---
aliases:
  - Time sybc
  - Windows time sync
tags:
  - "#windows"
  - "#time"
category: til
updated: 2026-08-25T14:30:56
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
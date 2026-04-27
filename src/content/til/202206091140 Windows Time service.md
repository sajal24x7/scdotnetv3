---
title: Windows Time Service
slug: windows-time-service
pubDate: '2022-06-09T11:40:00+03:00'
updatedDate: '2022-06-09T11:40:00+03:00'
category: til
tags:
- windows
- time
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

---
references:
[Windows Time service tools and settings | Microsoft Docs](https://docs.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings)
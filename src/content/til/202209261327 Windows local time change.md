---
title: Windows local time change
slug: windows-local-time-change
pubDate: '2022-09-26T13:27:00+03:00'
updatedDate: '2022-09-26T13:27:00+03:00'
category: til
tags: []
---


```cmd
w32tm /query /source
w32tm /config /syncfromflags:domhier /update
net stop w32time && net start w32time
```

---
references:
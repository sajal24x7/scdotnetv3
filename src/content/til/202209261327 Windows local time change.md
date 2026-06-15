---
title: Windows Local Time Change
slug: windows-local-time-change
created: '2022-09-26T13:27:00+03:00'
updated: '2022-09-26T13:27:00+03:00'
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
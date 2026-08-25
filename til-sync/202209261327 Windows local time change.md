---
aliases:
  - Windows local time change
tags:
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
```cmd
w32tm /query /source
w32tm /config /syncfromflags:domhier /update
net stop w32time && net start w32time
```

---
references:
---
tag: #windows
aliases:
---

```cmd
w32tm /query /source
w32tm /config /syncfromflags:domhier /update
net stop w32time && net start w32time
```

---
references:
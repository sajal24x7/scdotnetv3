---
aliases:
  - Windows make disk active
tags:
  - "#windows"
  - "#platespin"
category: til
updated: 2026-08-25T14:30:56
---
After migration if VM does not boot:

```cmd
diskpart
list disk
select disk #
list partition
select partition #
active
```


---
references:
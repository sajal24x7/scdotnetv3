---
title: Windows make disk active
slug: windows-make-disk-active
pubDate: '2022-09-26T13:14:00+03:00'
updatedDate: '2022-09-26T13:14:00+03:00'
category: til
tags: []
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
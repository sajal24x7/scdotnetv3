---
tag: #windows, #platespin
aliases:
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
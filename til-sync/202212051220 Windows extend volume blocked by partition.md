---
aliases:
  - Windows extend volume blocked by partition
tags:
  - "#windows"
category: til
updated: 2026-08-25T14:30:56
---
1. Run diskpart
``` cmd
list disk

select disk *

list partition

select partition *

delete partition override
```


---
references:
[Fixed: Cannot Extend Volume Blocked by a Recovery Partition on Windows 10 (diskpart.com)](https://www.diskpart.com/res/extend-volume-blocked-by-a-recovery-partition-on-windows-10-0825.html#:~:text=Volume%20extension%20might%20be%20blocked%20by%20a%20recovery,operating%20system%20in%20case%20of%20any%20system%20failure.)
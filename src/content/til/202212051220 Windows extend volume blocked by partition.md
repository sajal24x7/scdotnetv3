---
title: Windows Extend Volume Blocked by Partition
slug: windows-extend-volume-blocked-by-partition
created: '2022-12-05T12:20:00+03:00'
updated: '2022-12-05T12:20:00+03:00'
category: til
tags: []
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
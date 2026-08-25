---
aliases:
  - Remove IP from cluster NIC
tags:
  - "#windows"
  - "#cluster"
category: til
updated: 2026-08-25T14:30:56
---
To remove IP from the microsoft cluster nic

``` cmd
netsh interface ip set address “Local Area Connection” dhcp
```

---
references:
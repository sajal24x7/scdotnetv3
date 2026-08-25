---
aliases:
  - Vmware check rdm details
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
---
To check if disk is perennialy reserved

``` bash
esxcli storage core device list -d naa.id
```

---
# references:
[ESXi host takes a long time to start during rescan of RDM LUNs (1016106) (vmware.com)](https://kb.vmware.com/s/article/1016106)
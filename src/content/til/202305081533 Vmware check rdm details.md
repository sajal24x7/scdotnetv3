---
title: Vmware check rdm details
slug: vmware-check-rdm-details
pubDate: '2023-05-08T15:33:00+03:00'
updatedDate: '2023-05-08T15:33:00+03:00'
category: til
tags: []
---


To check if disk is perennialy reserved

``` bash
esxcli storage core device list -d naa.id
```

---
# references:
[ESXi host takes a long time to start during rescan of RDM LUNs (1016106) (vmware.com)](https://kb.vmware.com/s/article/1016106)
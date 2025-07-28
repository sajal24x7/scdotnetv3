---
title: VMware restart ui services
slug: vmware-restart-ui-services
pubDate: '2022-07-16T20:44:00+03:00'
updatedDate: '2022-07-16T20:44:00+03:00'
category: til
tags:
- vmware
---


Done in seconds.

```bash
# Stop ui
service-control --stop vsphere-ui

# start ui
service-control --start vsphere-ui

# check status
service-control --status --all
```


---
references:
[https://kb.vmware.com/s/article/81792?lang=en_US](https://kb.vmware.com/s/article/81792?lang=en_US)
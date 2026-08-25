---
aliases:
  - VMware restart ui services
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
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
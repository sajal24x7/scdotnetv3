---
title: VMware set proxy
slug: vmware-set-proxy
pubDate: '2024-09-18T14:58:00+03:00'
updatedDate: '2024-09-18T14:58:00+03:00'
category: til
tags:
- vmware
---

We can not set **noproxy** in VAMI UI. It needs to be set in config file located at
```text
/etc/sysconfig/proxy


# Example: NO_PROXY="www.me.de, do.main, localhost"
NO_PROXY="localhost, 127.0.0.1, 10.47.*.*, *.tcsecp.com"

```


---
# references:
[How to configure Proxy Settings for vCenter Server (broadcom.com)](https://knowledge.broadcom.com/external/article/370265/how-to-configure-proxy-settings-for-vcen.html)
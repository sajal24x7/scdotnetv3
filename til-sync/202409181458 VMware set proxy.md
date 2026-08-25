---
aliases:
  - VMware set proxy
tags:
  - "#vmware"
category: til
updated: 2026-08-25T14:30:56
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
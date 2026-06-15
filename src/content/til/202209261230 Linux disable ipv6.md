---
title: Linux Disable Ipv6
slug: linux-disable-ipv6
created: '2022-09-26T12:30:00+03:00'
updated: '2022-09-26T12:30:00+03:00'
category: til
tags: []
---


# RHEL-disable-ipv6

```bash
vi /etc/sysctl.d/ipv6.conf
net.ipv6.conf.all.disable_ipv6 = 1
sysctl -p /etc/sysctl.d/ipv6.conf
dracut -f
```

---
references:
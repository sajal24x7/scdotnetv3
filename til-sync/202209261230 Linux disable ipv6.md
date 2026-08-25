---
aliases:
  - Linux disable ipv6
tags:
  - "#linux"
category: til
updated: 2026-08-25T14:30:56
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
---
title: Linux Disable Ipv6
slug: linux-disable-ipv6
created: '2022-09-26T12:30:00+03:00'
updated: '2022-09-26T12:30:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk6rzwd72l'
  - 'https://www.threads.com/@sajal24x7/post/DZnFX_RFvCd'
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

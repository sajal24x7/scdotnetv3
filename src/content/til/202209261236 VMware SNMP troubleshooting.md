---
title: VMware SNMP Troubleshooting
slug: vmware-snmp-troubleshooting
created: '2022-09-26T12:36:00+03:00'
updated: '2022-09-26T12:36:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modka5bowp26'
  - 'https://www.threads.com/@sajal24x7/post/DZnFeDVFhbF'
---

Tcpdump command to capture outgoing packets
```bash
tcpdump-uw -v -i vmk# -n -T snmp udp and port 161
# typically port 162; if custom ports are configured use those
```

---
references:
[VMware KB](https://kb.vmware.com/s/article/2033528)

---
title: Vmware Check Rdm Details
slug: vmware-check-rdm-details
created: '2023-05-08T15:33:00+03:00'
updated: '2023-05-08T15:33:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://mastodon.social/@sajal24x7/116754741163106502'
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modkpcon232v'
  - 'https://www.threads.com/@sajal24x7/post/DZnGcg5lvge'
---


To check if disk is perennialy reserved

``` bash
esxcli storage core device list -d naa.id
```

---
# references:
[ESXi host takes a long time to start during rescan of RDM LUNs (1016106) (vmware.com)](https://kb.vmware.com/s/article/1016106)

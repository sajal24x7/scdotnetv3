---
title: Remove IP From Cluster NIC
slug: remove-ip-from-cluster-nic
created: '2022-09-21T12:43:00+03:00'
updated: '2022-09-21T12:43:00+03:00'
category: til
tags: []
syndicationUrls:
  - 'https://bsky.app/profile/sajalchoudhary.net/post/3modk3b3wjq2u'
  - 'https://www.threads.com/@sajal24x7/post/DZnFJiXFlgL'
---


To remove IP from the microsoft cluster nic

``` cmd
netsh interface ip set address “Local Area Connection” dhcp
```

---
references:
